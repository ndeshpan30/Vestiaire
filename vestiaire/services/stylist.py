"""
Gemini AI Stylist & Outfit Recommendation Service.
Provides image tagging and Gemini-assisted outfit recommendations.
All recommendations are powered by Google Gemini (gemini-2.5-flash).
"""

import os
import random
from typing import List, Tuple, Optional
from PIL import Image
from google import genai
from google.genai import types

from models.schemas import ClothingTag, OutfitRecommendation, ItemRecord


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """Initializes Google GenAI client using provided API key or environment variable."""
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        raise ValueError("GEMINI_API_KEY is not set. Please provide a valid Gemini API key.")
    return genai.Client(api_key=key)


def analyze_garment_image(
    image: Image.Image,
    api_key: Optional[str] = None
) -> Tuple[Optional[ClothingTag], Optional[str]]:
    """
    Sends garment image to Gemini Vision (gemini-2.5-flash) with structured output schema ClothingTag.
    Returns (ClothingTag, error_message).
    """
    try:
        client = get_gemini_client(api_key)
        
        prompt = (
            "You are an expert fashion curator and wardrobe stylist. "
            "Analyze the provided image of a garment or fashion accessory. "
            "Extract exact metadata including title, primary category, subcategory, primary/secondary colors, "
            "material, visual pattern, formality rating (1-10 scale), and suitable seasons. "
            "Return valid JSON matching the exact schema."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ClothingTag,
                temperature=0.2,
            )
        )

        if response.parsed:
            return response.parsed, None
        elif response.text:
            tag = ClothingTag.model_validate_json(response.text)
            return tag, None
        else:
            return None, "Empty response from Gemini API."

    except Exception as e:
        return None, str(e)


def format_item_metadata_string(item: ItemRecord) -> str:
    """Formats an item into a clean metadata line for the Gemini prompt."""
    seasons_str = ", ".join(item.seasons) if item.seasons else "All-Season"
    return (
        f"[ID {item.id}] Category: {item.category} | Title: '{item.title}' | "
        f"Subcategory: '{item.subcategory or 'N/A'}' | Material: {item.material or 'Unknown'} | "
        f"Primary Color: {item.primary_color or 'Unknown'} | Secondary Color: {item.secondary_color or 'None'} | "
        f"Pattern: {item.pattern or 'Solid'} | Formality: {item.formality}/10 | Suitable Seasons: {seasons_str}"
    )


def recommend_outfit(
    items: List[ItemRecord],
    occasion: str = "",
    weather: str = "",
    api_key: Optional[str] = None
) -> Tuple[Optional[OutfitRecommendation], List[ItemRecord], Optional[str]]:
    """
    Generates a Gemini-assisted outfit recommendation using Gemini 2.5 Flash.
    Applies strict selection constraints:
    - (Top AND Bottom) OR One-Piece
    - Always + Shoes
    - ALWAYS 1-3 Accessories
    - Outerwear if cold weather signal is present
    - Reasoning for leather tone and hardware matching
    
    Returns (OutfitRecommendation, selected_items_list, error_message).
    """
    if not items:
        return None, [], "No active items available in wardrobe database."

    active_items = [item for item in items if item.is_active == 1]
    if not active_items:
        return None, [], "No active wardrobe items found."

    effective_occasion = occasion.strip() if occasion.strip() else "Surprise styling / Creative combination"
    effective_weather = weather.strip() if weather.strip() else "Moderate weather"

    try:
        client = get_gemini_client(api_key)

        inventory_lines = [format_item_metadata_string(item) for item in active_items]
        inventory_text = "\n".join(inventory_lines)

        prompt = f"""
You are an expert high-end personal wardrobe stylist.
Your task is to compose a stylish, coordinated outfit from the user's local closet inventory for a specific occasion and weather condition.

### WARDROBE INVENTORY:
{inventory_text}

### CONTEXT:
- Occasion: {effective_occasion}
- Weather: {effective_weather}

### MANDATORY SELECTION RULES (STRICT CONSTRAINTS):
1. **BASE STRUCTURE**: Select EITHER (exactly 1 'Top' AND 1 'Bottom') OR (exactly 1 'One-Piece').
2. **FOOTWEAR**: ALWAYS select exactly 1 item from category 'Shoes'.
3. **ACCESSORIES**: ALWAYS select between 1 and 3 items from category 'Accessory'. (Do not skip accessories!).
4. **OUTERWEAR**: Include 1 'Outerwear' item if the weather text describes cold, chilly, rainy, windy, or winter conditions. Otherwise optional.
5. **HARMONY & MATCHING**: Carefully evaluate leather tones (e.g. brown leather belt matching brown leather shoes) and metal hardware colors (gold with gold, silver with silver).
6. **VALID ITEM IDS**: ONLY pick item IDs that exist in the provided Wardrobe Inventory list above!

### REQUIRED OUTPUT:
Return JSON following the exact output schema containing:
- outfit_name: Catchy theme title
- item_ids: Array of chosen item IDs
- rationale: 2 to 4 sentence styling rationale
- accessory_notes: Detailed accessory pairing advice (leather tones, metal hardware, layering hints)
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=OutfitRecommendation,
                temperature=0.7 if "Surprise" in effective_occasion else 0.4,
            )
        )

        rec: Optional[OutfitRecommendation] = None
        if response.parsed:
            rec = response.parsed
        elif response.text:
            rec = OutfitRecommendation.model_validate_json(response.text)

        if not rec:
            return None, [], "Failed to parse outfit recommendation response from Gemini."

        item_map = {item.id: item for item in active_items if item.id is not None}
        valid_selected_items = [item_map[i_id] for i_id in rec.item_ids if i_id in item_map]

        if not valid_selected_items:
            return _internal_fallback_outfit(active_items, occasion=effective_occasion, weather=effective_weather)

        return rec, valid_selected_items, None

    except Exception as e:
        rec, items_list, _ = _internal_fallback_outfit(active_items, occasion=effective_occasion, weather=effective_weather)
        return rec, items_list, f"Gemini API connection issue ({str(e)}). Used internal emergency fallback."


def _internal_fallback_outfit(
    items: List[ItemRecord],
    occasion: str = "Styling",
    weather: str = "Moderate"
) -> Tuple[OutfitRecommendation, List[ItemRecord], Optional[str]]:
    """Internal emergency backup if API connection drops."""
    active_items = [i for i in items if i.is_active == 1]
    by_category = {}
    for item in active_items:
        by_category.setdefault(item.category, []).append(item)

    selected_items: List[ItemRecord] = []

    has_one_piece = bool(by_category.get("One-Piece"))
    has_top_bottom = bool(by_category.get("Top")) and bool(by_category.get("Bottom"))

    if has_one_piece and (not has_top_bottom or random.random() < 0.35):
        selected_items.append(random.choice(by_category["One-Piece"]))
    elif has_top_bottom:
        selected_items.append(random.choice(by_category["Top"]))
        selected_items.append(random.choice(by_category["Bottom"]))
    elif has_one_piece:
        selected_items.append(random.choice(by_category["One-Piece"]))
    else:
        non_acc = [i for i in active_items if i.category != "Accessory"]
        if non_acc:
            selected_items.append(random.choice(non_acc))

    if by_category.get("Shoes"):
        selected_items.append(random.choice(by_category["Shoes"]))

    if by_category.get("Accessory"):
        num_acc = min(len(by_category["Accessory"]), random.randint(1, 3))
        selected_items.extend(random.sample(by_category["Accessory"], num_acc))

    weather_lower = (weather or "").lower()
    is_cold = any(w in weather_lower for w in ["cold", "rain", "snow", "chilly", "winter", "cool"])
    if by_category.get("Outerwear") and is_cold:
        selected_items.append(random.choice(by_category["Outerwear"]))

    item_titles = [f"'{item.title}'" for item in selected_items]
    item_ids = [item.id for item in selected_items if item.id is not None]

    rec = OutfitRecommendation(
        outfit_name=f"Curated {occasion.title()} Combination",
        item_ids=item_ids,
        rationale=f"Combination pairing {', '.join(item_titles[:3])} suited for {occasion} in {weather} conditions.",
        accessory_notes="Ensure matching leather tones and metallic hardware accents across selected accessories."
    )

    return rec, selected_items, None
