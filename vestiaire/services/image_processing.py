"""
Image Processing Service for AI Wardrobe & Outfit Stylist.
Handles background removal via rembg, bounding-box cropping with padding, and saving PNG files.
"""

import io
import os
import uuid
from PIL import Image
from rembg import remove

SAVED_CLOTHES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_clothes")


def ensure_saved_clothes_dir(target_dir: str = SAVED_CLOTHES_DIR) -> str:
    """Ensures that the saved_clothes directory exists."""
    os.makedirs(target_dir, exist_ok=True)
    return target_dir


def remove_background_and_crop(
    image_bytes: bytes,
    padding_percent: float = 0.04
) -> Image.Image:
    """
    Strips background from input image bytes using rembg,
    computes bounding box of alpha > 0 pixels, and crops with small padding.
    """
    # 1. Background removal
    nobg_bytes = remove(image_bytes)
    rgba_image = Image.open(io.BytesIO(nobg_bytes)).convert("RGBA")

    # 2. Bounding box calculation on non-transparent alpha channel
    alpha = rgba_image.split()[-1]
    bbox = alpha.getbbox()

    if not bbox:
        # If no alpha bounding box detected, return raw RGBA image
        return rgba_image

    left, upper, right, lower = bbox
    width = right - left
    height = lower - upper

    # Add 4% padding margin
    pad_w = int(width * padding_percent)
    pad_h = int(height * padding_percent)

    crop_box = (
        max(0, left - pad_w),
        max(0, upper - pad_h),
        min(rgba_image.width, right + pad_w),
        min(rgba_image.height, lower + pad_h)
    )

    cropped_img = rgba_image.crop(crop_box)
    return cropped_img


def process_and_save_image(
    image_bytes: bytes,
    target_filename: str = None,
    target_dir: str = SAVED_CLOTHES_DIR,
    padding_percent: float = 0.04
) -> str:
    """
    Processes raw image bytes (rembg + crop) and saves as PNG.
    Returns the relative image path (e.g. 'saved_clothes/{uuid}.png').
    """
    ensure_saved_clothes_dir(target_dir)

    cropped_image = remove_background_and_crop(image_bytes, padding_percent=padding_percent)

    if not target_filename:
        filename = f"{uuid.uuid4().hex}.png"
    else:
        filename = target_filename if target_filename.endswith(".png") else f"{target_filename}.png"

    full_path = os.path.join(target_dir, filename)
    cropped_image.save(full_path, format="PNG")

    # Return relative path for database storage
    return os.path.join("saved_clothes", filename)
