"""
Add Item Page — Icon-Free Ingestion Flow.
"""

import streamlit as st
from PIL import Image

from models.schemas import ClothingTag, ItemRecord
from services.db import add_item
from services.image_processing import process_and_save_image, remove_background_and_crop
from services.stylist import analyze_garment_image
from services.ui_theme import apply_custom_css, render_sidebar

st.set_page_config(page_title="Add Item | VESTIAIRE", layout="wide")
apply_custom_css()
render_sidebar()

st.markdown("# Add Garment to Your Closet")
st.markdown("<p style='color: #666666; font-size: 15px;'>Capture or upload a photo. Background is automatically removed locally before AI tagging.</p>", unsafe_allow_html=True)
st.divider()

# Segmented Toggle
input_mode = st.radio("Select Upload Source", ["Camera Capture", "Upload File"], horizontal=True)

raw_image_bytes = None

if input_mode == "Camera Capture":
    camera_file = st.camera_input("Take photograph of your garment")
    if camera_file is not None:
        raw_image_bytes = camera_file.getvalue()
else:
    uploaded_file = st.file_uploader("Select garment image", type=["jpg", "jpeg", "png", "webp"])
    if uploaded_file is not None:
        raw_image_bytes = uploaded_file.getvalue()

if raw_image_bytes:
    col_left, col_right = st.columns(2)

    with col_left:
        st.markdown("### 1. Processed Image Preview")
        with st.spinner("Removing background locally..."):
            cropped_pil_img = remove_background_and_crop(raw_image_bytes, padding_percent=0.04)
        
        with st.container(border=True):
            st.image(cropped_pil_img, caption="Background removed & cropped", use_container_width=True)
        
        analyze_button = st.button("Run Gemini AI Tagging", type="primary", use_container_width=True)

    if "current_tag" not in st.session_state or analyze_button:
        if analyze_button or "current_tag" not in st.session_state:
            api_key = st.session_state.get("gemini_api_key", "")
            with st.spinner("Extracting garment metadata with Gemini..."):
                tag, err = analyze_garment_image(cropped_pil_img, api_key=api_key)
                if err:
                    st.warning(f"AI Tagging Note: {err}. Please verify metadata manually.")
                    tag = ClothingTag(
                        title="New Item",
                        category="Top",
                        subcategory="T-Shirt",
                        primary_color="White",
                        secondary_color="None",
                        material="Cotton",
                        pattern="Solid",
                        formality=4,
                        seasons=["Spring", "Summer"]
                    )
                st.session_state["current_tag"] = tag

    current_tag: ClothingTag = st.session_state["current_tag"]

    with col_right:
        st.markdown("### 2. Verify & Edit Metadata")

        with st.form("add_item_form"):
            title = st.text_input("Garment Title", value=current_tag.title)
            
            categories = ["Top", "Bottom", "One-Piece", "Shoes", "Outerwear", "Accessory"]
            category_idx = categories.index(current_tag.category) if current_tag.category in categories else 0
            category = st.selectbox("Category", options=categories, index=category_idx)

            subcategory = st.text_input("Subcategory", value=current_tag.subcategory)

            c1, c2 = st.columns(2)
            with c1:
                primary_color = st.text_input("Primary Color", value=current_tag.primary_color)
                material = st.text_input("Material", value=current_tag.material)
            with c2:
                secondary_color = st.text_input("Secondary Color", value=current_tag.secondary_color or "None")
                pattern = st.text_input("Pattern", value=current_tag.pattern)

            formality = st.slider("Formality Rating (1 = Casual, 10 = Black Tie)", min_value=1, max_value=10, value=int(current_tag.formality))

            all_seasons = ["Spring", "Summer", "Fall", "Winter"]
            default_seasons = [s for s in current_tag.seasons if s in all_seasons]
            seasons = st.multiselect("Suitable Seasons", options=all_seasons, default=default_seasons)

            save_submitted = st.form_submit_button("Save Item to Closet", type="primary", use_container_width=True)

            if save_submitted:
                if not title.strip():
                    st.error("Title is required.")
                else:
                    rel_img_path = process_and_save_image(raw_image_bytes, padding_percent=0.04)
                    item_rec = ItemRecord(
                        image_path=rel_img_path,
                        title=title.strip(),
                        category=category,
                        subcategory=subcategory.strip(),
                        primary_color=primary_color.strip(),
                        secondary_color=secondary_color.strip(),
                        material=material.strip(),
                        pattern=pattern.strip(),
                        formality=formality,
                        seasons=seasons,
                        is_active=1
                    )
                    item_id = add_item(item_rec)
                    st.success(f"Garment '{title}' saved to your closet!")
                    if "current_tag" in st.session_state:
                        del st.session_state["current_tag"]
