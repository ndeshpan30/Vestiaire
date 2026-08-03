"""
Unified Database service module for AI Wardrobe & Outfit Stylist.
- When SUPABASE_URL and SUPABASE_KEY are present, delegates reads/writes directly to Supabase PostgreSQL database (garments table).
- When offline or unconfigured, falls back gracefully to local SQLite (wardrobe.db).
"""

import os
import sqlite3
from typing import List, Optional, Dict, Any
from models.schemas import ItemRecord, OutfitRecord
from services.supabase_db import (
    fetch_garments_for_user,
    add_garment_for_user,
    toggle_archive_garment_for_user,
    delete_garment_for_user
)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "wardrobe.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")

def is_supabase_enabled() -> bool:
    """Checks if Supabase cloud credentials are set in environment."""
    return bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"))


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    """Creates a sqlite3 connection with dict-like row factory and foreign keys enabled."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: str = DB_PATH, schema_path: str = SCHEMA_PATH) -> None:
    """Initializes SQLite database tables and indexes from schema.sql."""
    if not os.path.exists(schema_path):
        raise FileNotFoundError(f"Schema file not found at {schema_path}")
    
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    with get_connection(db_path) as conn:
        conn.executescript(schema_sql)
        conn.commit()


def add_item(item: ItemRecord, db_path: str = DB_PATH, user_id: str = "11111111-1111-1111-1111-111111111111", image_bytes: Optional[bytes] = None) -> int:
    """Inserts a new item directly to Supabase PostgreSQL or falls back to SQLite."""
    if is_supabase_enabled():
        garment_payload = {
            "title": item.title,
            "category": item.category if item.category in ['Top', 'Bottom', 'One-Piece', 'Shoes', 'Outerwear', 'Accessory'] else 'Top',
            "color": item.primary_color or 'Black',
            "secondary_color": item.secondary_color or 'None',
            "material": item.material or 'Cotton',
            "pattern": item.pattern or 'Solid',
            "formality": item.formality or 5,
            "season": item.seasons or [],
            "image_url": item.image_path or 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
            "is_archived": not item.is_active
        }
        res = add_garment_for_user(user_id, garment_payload, image_bytes)
        if res and "id" in res:
            return 1

    # Local SQLite Fallback
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO items (
                image_path, title, category, subcategory,
                primary_color, secondary_color, material, pattern,
                formality, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item.image_path,
                item.title,
                item.category,
                item.subcategory,
                item.primary_color,
                item.secondary_color,
                item.material,
                item.pattern,
                item.formality,
                item.is_active
            )
        )
        item_id = cursor.lastrowid
        
        if item.seasons:
            season_rows = [(item_id, season.strip()) for season in item.seasons if season.strip()]
            cursor.executemany(
                "INSERT INTO item_seasons (item_id, season) VALUES (?, ?)",
                season_rows
            )
        
        conn.commit()
        return item_id


def update_item(item: ItemRecord, db_path: str = DB_PATH) -> bool:
    """Updates an existing item and its seasons."""
    if item.id is None:
        raise ValueError("Item ID is required for update operation")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE items SET
                image_path = ?,
                title = ?,
                category = ?,
                subcategory = ?,
                primary_color = ?,
                secondary_color = ?,
                material = ?,
                pattern = ?,
                formality = ?,
                is_active = ?
            WHERE id = ?
            """,
            (
                item.image_path,
                item.title,
                item.category,
                item.subcategory,
                item.primary_color,
                item.secondary_color,
                item.material,
                item.pattern,
                item.formality,
                item.is_active,
                item.id
            )
        )
        
        cursor.execute("DELETE FROM item_seasons WHERE item_id = ?", (item.id,))
        if item.seasons:
            season_rows = [(item.id, season.strip()) for season in item.seasons if season.strip()]
            cursor.executemany(
                "INSERT INTO item_seasons (item_id, season) VALUES (?, ?)",
                season_rows
            )
        
        conn.commit()
        return cursor.rowcount > 0


def soft_delete_item(item_id: int, db_path: str = DB_PATH, user_id: str = "11111111-1111-1111-1111-111111111111") -> bool:
    """Soft-deletes an item in Supabase or SQLite."""
    if is_supabase_enabled():
        return toggle_archive_garment_for_user(user_id, str(item_id), True)

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE items SET is_active = 0 WHERE id = ?", (item_id,))
        conn.commit()
        return cursor.rowcount > 0


def restore_item(item_id: int, db_path: str = DB_PATH, user_id: str = "11111111-1111-1111-1111-111111111111") -> bool:
    """Restores a soft-deleted item in Supabase or SQLite."""
    if is_supabase_enabled():
        return toggle_archive_garment_for_user(user_id, str(item_id), False)

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE items SET is_active = 1 WHERE id = ?", (item_id,))
        conn.commit()
        return cursor.rowcount > 0


def get_item_by_id(item_id: int, db_path: str = DB_PATH) -> Optional[ItemRecord]:
    """Fetches a single item record by ID including its seasons."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        row = cursor.fetchone()
        if not row:
            return None
        
        cursor.execute("SELECT season FROM item_seasons WHERE item_id = ?", (item_id,))
        seasons = [s["season"] for s in cursor.fetchall()]
        
        return ItemRecord(
            id=row["id"],
            image_path=row["image_path"],
            title=row["title"],
            category=row["category"],
            subcategory=row["subcategory"] or "",
            primary_color=row["primary_color"] or "",
            secondary_color=row["secondary_color"] or "None",
            material=row["material"] or "",
            pattern=row["pattern"] or "",
            formality=row["formality"] or 5,
            seasons=seasons,
            is_active=row["is_active"],
            created_at=str(row["created_at"])
        )


def get_all_items(
    is_active_only: bool = True,
    category: Optional[str] = None,
    color: Optional[str] = None,
    season: Optional[str] = None,
    min_formality: int = 1,
    max_formality: int = 10,
    db_path: str = DB_PATH,
    user_id: str = "11111111-1111-1111-1111-111111111111"
) -> List[ItemRecord]:
    """Queries items from Supabase cloud database if available, else SQLite."""
    if is_supabase_enabled():
        data = fetch_garments_for_user(
            user_id=user_id,
            category=category or "All",
            color=color or "All",
            min_formality=min_formality,
            max_formality=max_formality,
            show_archived=not is_active_only
        )
        items: List[ItemRecord] = []
        for row in data:
            items.append(
                ItemRecord(
                    id=row.get("id"),
                    image_path=row.get("image_url") or "",
                    title=row.get("title") or "",
                    category=row.get("category") or "",
                    subcategory=row.get("secondary_color") or "",
                    primary_color=row.get("color") or "",
                    secondary_color=row.get("secondary_color") or "None",
                    material=row.get("material") or "",
                    pattern=row.get("pattern") or "",
                    formality=row.get("formality") or 5,
                    seasons=row.get("season") or [],
                    is_active=not row.get("is_archived", False),
                    created_at=str(row.get("created_at") or "")
                )
            )
        return items

    # SQLite Fallback Query
    query = "SELECT DISTINCT i.* FROM items i"
    params: List[Any] = []
    where_clauses: List[str] = []

    if season and season != "All":
        query += " JOIN item_seasons s ON i.id = s.item_id"
        where_clauses.append("s.season = ?")
        params.append(season)

    if is_active_only:
        where_clauses.append("i.is_active = 1")

    if category and category != "All":
        where_clauses.append("i.category = ?")
        params.append(category)

    if color and color != "All":
        where_clauses.append("i.primary_color = ?")
        params.append(color)

    where_clauses.append("i.formality BETWEEN ? AND ?")
    params.extend([min_formality, max_formality])

    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    query += " ORDER BY i.id DESC"

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        items: List[ItemRecord] = []
        for row in rows:
            cursor.execute("SELECT season FROM item_seasons WHERE item_id = ?", (row["id"],))
            seasons = [s["season"] for s in cursor.fetchall()]
            items.append(
                ItemRecord(
                    id=row["id"],
                    image_path=row["image_path"],
                    title=row["title"],
                    category=row["category"],
                    subcategory=row["subcategory"] or "",
                    primary_color=row["primary_color"] or "",
                    secondary_color=row["secondary_color"] or "None",
                    material=row["material"] or "",
                    pattern=row["pattern"] or "",
                    formality=row["formality"] or 5,
                    seasons=seasons,
                    is_active=row["is_active"],
                    created_at=str(row["created_at"])
                )
            )
        return items


def save_outfit(outfit: OutfitRecord, db_path: str = DB_PATH) -> int:
    """Saves a new outfit record."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO outfits (name, occasion, weather, rationale, accessory_notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                outfit.name,
                outfit.occasion or "",
                outfit.weather or "",
                outfit.rationale or "",
                outfit.accessory_notes or ""
            )
        )
        outfit_id = cursor.lastrowid

        outfit_item_rows = []
        for item in outfit.items:
            if item.id is not None:
                outfit_item_rows.append((outfit_id, item.id, item.category))

        if outfit_item_rows:
            cursor.executemany(
                "INSERT INTO outfit_items (outfit_id, item_id, role_in_outfit) VALUES (?, ?, ?)",
                outfit_item_rows
            )

        conn.commit()
        return outfit_id


def get_all_outfits(db_path: str = DB_PATH) -> List[OutfitRecord]:
    """Retrieves all saved outfits with associated items."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM outfits ORDER BY id DESC")
        outfit_rows = cursor.fetchall()

        outfits: List[OutfitRecord] = []
        for o_row in outfit_rows:
            outfit_id = o_row["id"]
            cursor.execute(
                """
                SELECT i.* FROM items i
                JOIN outfit_items oi ON i.id = oi.item_id
                WHERE oi.outfit_id = ?
                """,
                (outfit_id,)
            )
            item_rows = cursor.fetchall()
            items: List[ItemRecord] = []
            for i_row in item_rows:
                cursor.execute("SELECT season FROM item_seasons WHERE item_id = ?", (i_row["id"],))
                seasons = [s["season"] for s in cursor.fetchall()]
                items.append(
                    ItemRecord(
                        id=i_row["id"],
                        image_path=i_row["image_path"],
                        title=i_row["title"],
                        category=i_row["category"],
                        subcategory=i_row["subcategory"] or "",
                        primary_color=i_row["primary_color"] or "",
                        secondary_color=i_row["secondary_color"] or "None",
                        material=i_row["material"] or "",
                        pattern=i_row["pattern"] or "",
                        formality=i_row["formality"] or 5,
                        seasons=seasons,
                        is_active=i_row["is_active"],
                        created_at=str(i_row["created_at"])
                    )
                )

            outfits.append(
                OutfitRecord(
                    id=outfit_id,
                    name=o_row["name"],
                    occasion=o_row["occasion"],
                    weather=o_row["weather"],
                    rationale=o_row["rationale"],
                    accessory_notes=o_row["accessory_notes"],
                    created_at=str(o_row["created_at"]),
                    items=items
                )
            )
        return outfits


def delete_outfit(outfit_id: int, db_path: str = DB_PATH) -> bool:
    """Deletes a saved outfit record."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM outfits WHERE id = ?", (outfit_id,))
        conn.commit()
        return cursor.rowcount > 0


def get_closet_stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    """Calculates statistics for closet dashboard metrics."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM items WHERE is_active = 1")
        total_items = cursor.fetchone()[0]

        cursor.execute("SELECT category, COUNT(*) as count FROM items WHERE is_active = 1 GROUP BY category")
        category_counts = {row["category"]: row["count"] for row in cursor.fetchall()}

        cursor.execute("SELECT COUNT(*) FROM outfits")
        total_outfits = cursor.fetchone()[0]

        return {
            "total_items": total_items,
            "category_counts": category_counts,
            "total_outfits": total_outfits
        }
