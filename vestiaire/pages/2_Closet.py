"""
Your Closet Page — Strict 3-Column Grid Layout with Deterministic Sorting System.
Tira Editorial E-Commerce Aesthetics with Deep Teal (#064E65) Accents.
"""

import streamlit as st

from models.schemas import ItemRecord
from services.db import get_all_items, update_item, soft_delete_item, restore_item
from services.stylist import analyze_garment_image
from services.ui_theme import apply_custom_css, render_sidebar, render_tira_garment_card, load_item_image

st.set_page_config(page_title="Your Closet | VESTIAIRE", layout="wide")
apply_custom_css()
render_sidebar()

all_active_items = get_all_items(is_active_only=True)
stats_total = len(all_active_items)

# Header & Right-Aligned Sort Dropdown
header_col1, header_col2 = st.columns([3, 1])

with header_col1:
    st.markdown(f"# Your Closet <span style='color:#666666; font-size:20px; font-weight:400;'>({stats_total} items)</span>", unsafe_allow_html=True)

with header_col2:
    sort_option = st.selectbox(
        "Sort by",
        options=["Recently Added", "Formality: High to Low", "Formality: Low to High", "Category (A-Z)"],
        index=0
    )

st.divider()

# Left Filter Column + Main 3-Column Grid Split
filter_col, main_grid = st.columns([1, 3])

with filter_col:
    f_header_col1, f_header_col2 = st.columns([2, 1])
    with f_header_col1:
        st.markdown("### FILTERS")
    with f_header_col2:
        if st.button("Reset", key="reset_filters"):
            st.rerun()

    all_items_unfiltered = get_all_items(is_active_only=False)
    all_colors = sorted(list(set([i.primary_color for i in all_items_unfiltered if i.primary_color])))

    with st.expander("Category", expanded=True):
        selected_category = st.selectbox("Select Category", ["All", "Top", "Bottom", "One-Piece", "Shoes", "Outerwear", "Accessory"])

    with st.expander("Color", expanded=False):
        selected_color = st.selectbox("Select Color", ["All"] + all_colors)

    with st.expander("Season", expanded=False):
        selected_season = st.selectbox("Select Season", ["All", "Spring", "Summer", "Fall", "Winter"])

    show_archived = st.checkbox("Include Archived Items", value=False)

    # Active Filter Tags
    st.markdown("#### Active Tags:")
    if selected_category != "All":
        st.markdown(f"<span class='attribute-pill attribute-pill-accent'>{selected_category} &times;</span>", unsafe_allow_html=True)
    if selected_color != "All":
        st.markdown(f"<span class='attribute-pill attribute-pill-accent'>{selected_color} &times;</span>", unsafe_allow_html=True)

with main_grid:
    items = get_all_items(
        is_active_only=not show_archived,
        category=selected_category,
        color=selected_color,
        season=selected_season
    )

    # Apply Sorting System
    if sort_option == "Recently Added":
        items.sort(key=lambda x: x.id, reverse=True)
    elif sort_option == "Formality: High to Low":
        items.sort(key=lambda x: x.formality, reverse=True)
    elif sort_option == "Formality: Low to High":
        items.sort(key=lambda x: x.formality, reverse=False)
    elif sort_option == "Category (A-Z)":
        items.sort(key=lambda x: (x.category, x.title))

    if not items:
        st.info("No garments match selected filter criteria.")
    else:
        # Enforce Strict 3-Column Grid per Row
        grid = st.columns(3)

        for idx, item in enumerate(items):
            col = grid[idx % 3]
            with col:
                with st.container(border=True):
                    img = load_item_image(item.image_path)
                    if img:
                        st.image(img, use_container_width=True)

                    active_label = "Active" if item.is_active == 1 else "Archived"

                    st.markdown(f"<div class='tira-category-tag'>{item.category}</div>", unsafe_allow_html=True)
                    st.markdown(f"<div class='tira-item-title'>{item.title}</div>", unsafe_allow_html=True)
                    st.markdown(f"<div class='tira-rating-line'>Formality {item.formality}/10 • {active_label}</div>", unsafe_allow_html=True)

                    st.markdown(
                        f"""
                        <div style="margin-bottom:8px;">
                            <span class="attribute-pill">{item.primary_color}</span>
                            <span class="attribute-pill">{item.material or 'Cotton'}</span>
                            <span class="attribute-pill">{item.pattern or 'Solid'}</span>
                        </div>
                        """,
                        unsafe_allow_html=True
                    )

                    with st.expander("Edit Metadata & Actions"):
                        with st.form(key=f"edit_form_{item.id}"):
                            new_title = st.text_input("Title", value=item.title)
                            cats = ["Top", "Bottom", "One-Piece", "Shoes", "Outerwear", "Accessory"]
                            cat_idx = cats.index(item.category) if item.category in cats else 0
                            new_cat = st.selectbox("Category", options=cats, index=cat_idx)
                            new_subcat = st.text_input("Subcategory", value=item.subcategory or "")

                            e1, e2 = st.columns(2)
                            with e1:
                                new_pcolor = st.text_input("Primary Color", value=item.primary_color or "")
                                new_mat = st.text_input("Material", value=item.material or "")
                            with e2:
                                new_scolor = st.text_input("Secondary Color", value=item.secondary_color or "None")
                                new_pattern = st.text_input("Pattern", value=item.pattern or "")

                            new_formality = st.slider("Formality", 1, 10, value=item.formality)
                            all_seasons_opt = ["Spring", "Summer", "Fall", "Winter"]
                            curr_seasons = [s for s in item.seasons if s in all_seasons_opt]
                            new_seasons = st.multiselect("Seasons", options=all_seasons_opt, default=curr_seasons)

                            save_edit = st.form_submit_button("Save Changes", type="primary")
                            if save_edit:
                                updated_rec = ItemRecord(
                                    id=item.id,
                                    image_path=item.image_path,
                                    title=new_title.strip(),
                                    category=new_cat,
                                    subcategory=new_subcat.strip(),
                                    primary_color=new_pcolor.strip(),
                                    secondary_color=new_scolor.strip(),
                                    material=new_mat.strip(),
                                    pattern=new_pattern.strip(),
                                    formality=new_formality,
                                    seasons=new_seasons,
                                    is_active=item.is_active
                                )
                                update_item(updated_rec)
                                st.success("Metadata updated!")
                                st.rerun()

                        a1, a2 = st.columns(2)
                        with a1:
                            if st.button("Re-analyze", key=f"reanalyze_{item.id}"):
                                api_key = st.session_state.get("gemini_api_key", "")
                                item_img = load_item_image(item.image_path)
                                if item_img:
                                    with st.spinner("Analyzing..."):
                                        tag, err = analyze_garment_image(item_img, api_key=api_key)
                                        if tag:
                                            new_rec = ItemRecord(
                                                id=item.id,
                                                image_path=item.image_path,
                                                title=tag.title,
                                                category=tag.category,
                                                subcategory=tag.subcategory,
                                                primary_color=tag.primary_color,
                                                secondary_color=tag.secondary_color,
                                                material=tag.material,
                                                pattern=tag.pattern,
                                                formality=tag.formality,
                                                seasons=tag.seasons,
                                                is_active=item.is_active
                                            )
                                            update_item(new_rec)
                                            st.success("Updated!")
                                            st.rerun()

                        with a2:
                            if item.is_active == 1:
                                if st.button("Archive", key=f"delete_{item.id}"):
                                    soft_delete_item(item.id)
                                    st.warning("Archived.")
                                    st.rerun()
                            else:
                                if st.button("Restore", key=f"restore_{item.id}"):
                                    restore_item(item.id)
                                    st.success("Restored.")
                                    st.rerun()
