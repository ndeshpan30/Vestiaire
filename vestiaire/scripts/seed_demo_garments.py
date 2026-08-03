"""
Seeding Script: Seed User-Isolated Demo Garments into Wardrobe Database.
Adds curated editorial garments for demo@vestiaire.app and admin@vestiaire.app.
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from models.schemas import ItemRecord
from services.db import add_item
from services.supabase_db import add_garment_for_user, get_supabase_client

DEMO_USER_ID = "11111111-1111-1111-1111-111111111111"
ADMIN_USER_ID = "22222222-2222-2222-2222-222222222222"

DEMO_ITEMS = [
    {
        "title": "Navy Italian Wool Blazer",
        "category": "Outerwear",
        "primary_color": "Navy",
        "secondary_color": "Gold",
        "material": "Wool",
        "pattern": "Solid",
        "formality": 9,
        "seasons": ["Autumn", "Winter"],
        "image_path": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Silk Off-White Blouse",
        "category": "Top",
        "primary_color": "White",
        "secondary_color": "None",
        "material": "Silk",
        "pattern": "Solid",
        "formality": 8,
        "seasons": ["Spring", "Summer", "Autumn"],
        "image_path": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Pleated Charcoal Trousers",
        "category": "Bottom",
        "primary_color": "Grey",
        "secondary_color": "None",
        "material": "Wool Blend",
        "pattern": "Solid",
        "formality": 8,
        "seasons": ["Autumn", "Winter"],
        "image_path": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Burgundy Leather Loafers",
        "category": "Shoes",
        "primary_color": "Burgundy",
        "secondary_color": "None",
        "material": "Leather",
        "pattern": "Solid",
        "formality": 9,
        "seasons": ["Spring", "Autumn"],
        "image_path": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80"
    }
]

ADMIN_ITEMS = [
    {
        "title": "Oversized Black Trench Coat",
        "category": "Outerwear",
        "primary_color": "Black",
        "secondary_color": "None",
        "material": "Gabardine",
        "pattern": "Solid",
        "formality": 7,
        "seasons": ["Autumn", "Winter"],
        "image_path": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Cashmere Beige Crewneck Sweater",
        "category": "Top",
        "primary_color": "Beige",
        "secondary_color": "None",
        "material": "Cashmere",
        "pattern": "Solid",
        "formality": 6,
        "seasons": ["Winter", "Spring"],
        "image_path": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"
    },
    {
        "title": "Raw Indigo Denim Jeans",
        "category": "Bottom",
        "primary_color": "Blue",
        "secondary_color": "None",
        "material": "Denim",
        "pattern": "Solid",
        "formality": 4,
        "seasons": ["Spring", "Summer", "Autumn", "Winter"],
        "image_path": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
    }
]

def seed_garments():
    print("=" * 60)
    print("VESTIAIRE - SEEDING DEMO GARMENTS FOR USER ISOLATION")
    print("=" * 60)

    # 1. Local SQLite Seeding
    print("[*] Seeding items into local SQLite database...")
    for item in DEMO_ITEMS:
        rec = ItemRecord(
            image_path=item["image_path"],
            title=item["title"],
            category=item["category"],
            subcategory="",
            primary_color=item["primary_color"],
            secondary_color=item["secondary_color"],
            material=item["material"],
            pattern=item["pattern"],
            formality=item["formality"],
            seasons=item["seasons"]
        )
        item_id = add_item(rec)
        print(f"    [+] Added SQLite Item ID {item_id}: {item['title']}")

    # 2. Supabase Cloud Seeding (if credentials active)
    client = get_supabase_client()
    if client:
        print("\n[*] Supabase Cloud Active. Seeding user-isolated garments...")
        for item in DEMO_ITEMS:
            data = {
                "title": item["title"],
                "category": item["category"],
                "color": item["primary_color"],
                "secondary_color": item["secondary_color"],
                "material": item["material"],
                "pattern": item["pattern"],
                "formality": item["formality"],
                "season": item["seasons"],
                "image_url": item["image_path"],
                "is_archived": False
            }
            res = add_garment_for_user(DEMO_USER_ID, data)
            if res:
                print(f"    [+] Added Supabase Garment for Demo User: {item['title']}")

        for item in ADMIN_ITEMS:
            data = {
                "title": item["title"],
                "category": item["category"],
                "color": item["primary_color"],
                "secondary_color": item["secondary_color"],
                "material": item["material"],
                "pattern": item["pattern"],
                "formality": item["formality"],
                "season": item["seasons"],
                "image_url": item["image_path"],
                "is_archived": False
            }
            res = add_garment_for_user(ADMIN_USER_ID, data)
            if res:
                print(f"    [+] Added Supabase Garment for Admin User: {item['title']}")
    else:
        print("\n[!] Supabase credentials not set in .env. Skipped cloud seeding.")

    print("\n" + "=" * 60)
    print("Garment seeding complete! Check Your Closet grid in browser.")
    print("=" * 60)

if __name__ == "__main__":
    seed_garments()
