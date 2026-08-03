"""
Demo wardrobe seed generator for AI Wardrobe & Outfit Stylist.
Creates initial sample clothes with styled graphics and tags if wardrobe is empty.
"""

import os
from PIL import Image, ImageDraw
from models.schemas import ItemRecord
from services.db import init_db, add_item, get_closet_stats
from services.image_processing import SAVED_CLOTHES_DIR


def create_sample_garment_image(filename: str, color_rgb: tuple, shape_type: str) -> str:
    """Generates a clean garment illustration PNG on transparent background."""
    os.makedirs(SAVED_CLOTHES_DIR, exist_ok=True)
    img_path = os.path.join(SAVED_CLOTHES_DIR, filename)

    # 400x400 RGBA image
    img = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    r, g, b = color_rgb
    fill_color = (r, g, b, 240)
    outline_color = (max(0, r - 40), max(0, g - 40), max(0, b - 40), 255)

    if shape_type == "top":  # T-Shirt / Shirt
        points = [(100, 120), (140, 70), (260, 70), (300, 120), (270, 150), (250, 130), (250, 360), (150, 360), (150, 130), (130, 150)]
        draw.polygon(points, fill=fill_color, outline=outline_color, width=4)
        # Collar cut
        draw.polygon([(180, 70), (200, 110), (220, 70)], fill=(0, 0, 0, 0), outline=outline_color, width=3)

    elif shape_type == "bottom":  # Trousers / Jeans
        points = [(130, 80), (270, 80), (260, 370), (210, 370), (200, 170), (190, 370), (140, 370)]
        draw.polygon(points, fill=fill_color, outline=outline_color, width=4)
        draw.line([(130, 130), (270, 130)], fill=outline_color, width=3)

    elif shape_type == "shoes":  # Sneakers / Loafers
        draw.rounded_rectangle([80, 220, 320, 310], radius=30, fill=fill_color, outline=outline_color, width=4)
        draw.rounded_rectangle([70, 280, 330, 325], radius=10, fill=(245, 245, 245, 255), outline=(180, 180, 180, 255), width=3)

    elif shape_type == "accessory_belt":  # Belt
        draw.rounded_rectangle([60, 170, 340, 210], radius=10, fill=fill_color, outline=outline_color, width=3)
        draw.rectangle([300, 160, 350, 220], outline=(218, 165, 32, 255), width=6)  # Gold buckle

    elif shape_type == "accessory_watch":  # Watch
        draw.rounded_rectangle([170, 60, 230, 340], radius=8, fill=fill_color, outline=outline_color, width=3)
        draw.ellipse([140, 140, 260, 260], fill=(250, 250, 250, 255), outline=(218, 165, 32, 255), width=6)
        draw.line([(200, 200), (200, 170)], fill=(30, 30, 30, 255), width=4)
        draw.line([(200, 200), (225, 200)], fill=(30, 30, 30, 255), width=3)

    elif shape_type == "outerwear":  # Blazer / Jacket
        draw.polygon([(110, 80), (160, 60), (240, 60), (290, 80), (310, 360), (90, 360)], fill=fill_color, outline=outline_color, width=4)
        draw.polygon([(160, 60), (200, 220), (240, 60)], fill=(240, 240, 240, 255), outline=outline_color, width=3)

    elif shape_type == "onepiece":  # Dress
        points = [(150, 70), (250, 70), (270, 140), (320, 370), (80, 370), (130, 140)]
        draw.polygon(points, fill=fill_color, outline=outline_color, width=4)

    img.save(img_path, format="PNG")
    return os.path.join("saved_clothes", filename)


def seed_demo_wardrobe(force: bool = False):
    """Populates wardrobe.db with initial high quality seed data if empty."""
    init_db()
    stats = get_closet_stats()

    if stats["total_items"] > 0 and not force:
        return

    sample_items = [
        {
            "filename": "demo_white_linen_shirt.png",
            "color": (245, 245, 240),
            "shape": "top",
            "title": "Organic White Linen Button-Up",
            "category": "Top",
            "subcategory": "Button-Up Shirt",
            "primary_color": "White",
            "secondary_color": "None",
            "material": "Linen",
            "pattern": "Solid",
            "formality": 4,
            "seasons": ["Spring", "Summer"]
        },
        {
            "filename": "demo_raw_denim_jeans.png",
            "color": (30, 50, 90),
            "shape": "bottom",
            "title": "Raw Indigo Slim Denim Jeans",
            "category": "Bottom",
            "subcategory": "Jeans",
            "primary_color": "Navy",
            "secondary_color": "None",
            "material": "Denim",
            "pattern": "Solid",
            "formality": 4,
            "seasons": ["Spring", "Summer", "Fall", "Winter"]
        },
        {
            "filename": "demo_cognac_belt.png",
            "color": (140, 70, 30),
            "shape": "accessory_belt",
            "title": "Cognac Leather Belt (Gold Buckle)",
            "category": "Accessory",
            "subcategory": "Belt",
            "primary_color": "Tan",
            "secondary_color": "Gold",
            "material": "Leather",
            "pattern": "Solid",
            "formality": 5,
            "seasons": ["Spring", "Summer", "Fall", "Winter"]
        },
        {
            "filename": "demo_gold_watch.png",
            "color": (120, 60, 20),
            "shape": "accessory_watch",
            "title": "Brown Leather & Gold Chronograph",
            "category": "Accessory",
            "subcategory": "Watch",
            "primary_color": "Brown",
            "secondary_color": "Gold",
            "material": "Leather",
            "pattern": "Solid",
            "formality": 6,
            "seasons": ["Spring", "Summer", "Fall", "Winter"]
        },
        {
            "filename": "demo_white_sneakers.png",
            "color": (235, 235, 235),
            "shape": "shoes",
            "title": "Minimalist White Leather Sneakers",
            "category": "Shoes",
            "subcategory": "Sneakers",
            "primary_color": "White",
            "secondary_color": "None",
            "material": "Leather",
            "pattern": "Solid",
            "formality": 3,
            "seasons": ["Spring", "Summer", "Fall"]
        },
        {
            "filename": "demo_navy_blazer.png",
            "color": (20, 30, 65),
            "shape": "outerwear",
            "title": "Tailored Navy Wool Blazer",
            "category": "Outerwear",
            "subcategory": "Blazer",
            "primary_color": "Navy",
            "secondary_color": "None",
            "material": "Wool",
            "pattern": "Solid",
            "formality": 7,
            "seasons": ["Fall", "Winter", "Spring"]
        },
        {
            "filename": "demo_emerald_dress.png",
            "color": (16, 124, 65),
            "shape": "onepiece",
            "title": "Emerald Silk Midi Slip Dress",
            "category": "One-Piece",
            "subcategory": "Dress",
            "primary_color": "Green",
            "secondary_color": "None",
            "material": "Silk",
            "pattern": "Solid",
            "formality": 8,
            "seasons": ["Summer", "Spring", "Fall"]
        }
    ]

    for item_def in sample_items:
        img_rel_path = create_sample_garment_image(item_def["filename"], item_def["color"], item_def["shape"])
        rec = ItemRecord(
            image_path=img_rel_path,
            title=item_def["title"],
            category=item_def["category"],
            subcategory=item_def["subcategory"],
            primary_color=item_def["primary_color"],
            secondary_color=item_def["secondary_color"],
            material=item_def["material"],
            pattern=item_def["pattern"],
            formality=item_def["formality"],
            seasons=item_def["seasons"],
            is_active=1
        )
        add_item(rec)
    print("Demo wardrobe successfully seeded!")


if __name__ == "__main__":
    seed_demo_wardrobe(force=True)
