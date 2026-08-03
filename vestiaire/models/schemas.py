"""
Pydantic schemas for AI Wardrobe & Outfit Stylist.
Contains structured output definitions for Google Gemini API and application data models.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ClothingTag(BaseModel):
    """Structured output for Gemini Vision AI Image Tagging."""
    title: str = Field(
        description="A concise, descriptive display title for the garment or accessory (e.g., 'Organic White Linen Button-Up', 'Classic Tan Leather Belt')"
    )
    category: str = Field(
        description="Garment main category. Must be one of: 'Top', 'Bottom', 'One-Piece', 'Shoes', 'Outerwear', 'Accessory'"
    )
    subcategory: str = Field(
        description="Specific type of item (e.g., 'T-Shirt', 'Blazer', 'Jeans', 'Chinos', 'Midi Dress', 'Sneakers', 'Watch', 'Belt', 'Handbag')"
    )
    primary_color: str = Field(
        description="Dominant primary color (e.g., 'White', 'Black', 'Navy', 'Tan', 'Olive', 'Beige', 'Red', 'Brown')"
    )
    secondary_color: Optional[str] = Field(
        default="None",
        description="Secondary color or accent color if present, else 'None'"
    )
    material: str = Field(
        description="Primary fabric or material (e.g., 'Linen', 'Cotton', 'Denim', 'Leather', 'Wool', 'Silk', 'Suede', 'Synthetic')"
    )
    pattern: str = Field(
        description="Visual pattern (e.g., 'Solid', 'Striped', 'Plaid', 'Floral', 'Graphic', 'Textured', 'Polka Dot')"
    )
    formality: int = Field(
        description="Formality rating on a 1-10 scale (1 = ultra casual/loungewear, 5 = smart casual, 8 = business formal, 10 = black tie)"
    )
    seasons: List[str] = Field(
        description="List of suitable seasons. Can include any combination of: 'Spring', 'Summer', 'Fall', 'Winter'"
    )


class OutfitRecommendation(BaseModel):
    """Structured output for Gemini Outfit Recommendation Engine."""
    outfit_name: str = Field(
        description="A catchy, stylish title for the curated outfit (e.g., 'Breezy Seaside Smart Casual', 'Monochrome Evening Luxe')"
    )
    item_ids: List[int] = Field(
        description="List of exact integer IDs of selected closet items forming the complete outfit. Must include (Top + Bottom OR One-Piece) + Shoes + 1-3 Accessories (+ Outerwear if weather requires)."
    )
    rationale: str = Field(
        description="A 2 to 4 sentence styling rationale explaining why these pieces complement each other for the specified occasion and weather."
    )
    accessory_notes: str = Field(
        description="Specific styling guidance on how to wear and match the selected accessories (e.g. matching leather tones, metal hardware, or jewelry accents)."
    )


class ItemRecord(BaseModel):
    """Internal model representing an item record from database."""
    id: Optional[int] = None
    image_path: str
    title: str
    category: str
    subcategory: Optional[str] = ""
    primary_color: Optional[str] = ""
    secondary_color: Optional[str] = "None"
    material: Optional[str] = ""
    pattern: Optional[str] = ""
    formality: int = 5
    seasons: List[str] = []
    is_active: int = 1
    created_at: Optional[str] = None


class OutfitRecord(BaseModel):
    """Internal model representing a saved outfit record."""
    id: Optional[int] = None
    name: str
    occasion: Optional[str] = ""
    weather: Optional[str] = ""
    rationale: Optional[str] = ""
    accessory_notes: Optional[str] = ""
    created_at: Optional[str] = None
    items: List[ItemRecord] = []
