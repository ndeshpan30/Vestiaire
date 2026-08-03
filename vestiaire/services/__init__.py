"""Services package initialization."""
from services.db import init_db, get_connection, add_item, update_item, soft_delete_item, get_all_items, save_outfit, get_all_outfits, get_closet_stats
from services.image_processing import process_and_save_image, remove_background_and_crop
from services.stylist import analyze_garment_image, recommend_outfit

__all__ = [
    "init_db",
    "get_connection",
    "add_item",
    "update_item",
    "soft_delete_item",
    "get_all_items",
    "save_outfit",
    "get_all_outfits",
    "get_closet_stats",
    "process_and_save_image",
    "remove_background_and_crop",
    "analyze_garment_image",
    "recommend_outfit",
]
