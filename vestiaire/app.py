"""
VESTIAIRE — Master Refactored Wardrobe Editorial.
Follows Master Architectural Layout Blueprint.
"""

import os
import streamlit as st
from PIL import Image

from services.db import init_db, get_closet_stats, get_all_items
from services.ui_theme import (
    apply_custom_css,
    render_sidebar,
    render_tira_garment_card
)

st.set_page_config(
    page_title="VESTIAIRE | Your Closet Editorial",
    layout="wide",
    initial_sidebar_state="expanded"
)

init_db()
apply_custom_css()
render_sidebar()

stats = get_closet_stats()

# 1. Top Bar: Title + Search + Add Button aligned on same row
top_c1, top_c2, top_c3 = st.columns([3, 3, 2])

with top_c1:
    st.markdown(f"<h1 style='margin-bottom:0;'>Your Closet <span style='color:#666666; font-size:18px; font-weight:400;'>({stats['total_items']} items)</span></h1>", unsafe_allow_html=True)

with top_c2:
    search_query = st.text_input("Search Garments", placeholder="Search garments...", label_visibility="collapsed")

with top_c3:
    if st.button("+ Add Garment", type="primary", use_container_width=True):
        st.switch_page("pages/1_Add_Item.py")

st.divider()

# 2. Stat Metrics Row
m1, m2, m3, m4 = st.columns(4)

with m1:
    st.markdown(
        f"""
        <div class="metric-box">
            <div class="metric-value">{stats['total_items']}</div>
            <div class="metric-label">TOTAL GARMENTS</div>
        </div>
        """,
        unsafe_allow_html=True
    )

with m2:
    top_count = stats["category_counts"].get("Top", 0)
    bottom_count = stats["category_counts"].get("Bottom", 0)
    st.markdown(
        f"""
        <div class="metric-box">
            <div class="metric-value">{top_count} Top · {bottom_count} Bottom</div>
            <div class="metric-label">TOPS & BOTTOMS</div>
        </div>
        """,
        unsafe_allow_html=True
    )

with m3:
    acc_count = stats["category_counts"].get("Accessory", 0)
    st.markdown(
        f"""
        <div class="metric-box">
            <div class="metric-value">{acc_count}</div>
            <div class="metric-label">ACCESSORIES</div>
        </div>
        """,
        unsafe_allow_html=True
    )

with m4:
    st.markdown(
        f"""
        <div class="metric-box">
            <div class="metric-value">{stats['total_outfits']}</div>
            <div class="metric-label">SAVED OUTFITS</div>
        </div>
        """,
        unsafe_allow_html=True
    )

st.divider()

# 3. Action Buttons Row (16px spacing)
act1, act2, act_spacer = st.columns([3, 3, 4])
with act1:
    if st.button("Generate Outfit", use_container_width=True, type="primary"):
        st.switch_page("pages/3_Stylist.py")
with act2:
    if st.button("Randomize Outfit", use_container_width=True):
        st.switch_page("pages/4_Randomizer.py")

st.divider()

# 4. Section Bar & Sort Dropdown directly above content grid
sec_col1, sec_col2 = st.columns([3, 1])

with sec_col1:
    st.markdown("## Your Collection")

with sec_col2:
    sort_option = st.selectbox(
        "Sort by",
        options=["Recently Added", "Formality: High to Low", "Formality: Low to High", "Category (A-Z)"],
        index=0,
        key="app_sort",
        label_visibility="collapsed"
    )

# 5. Strict 3-Column Garment Grid
all_items = get_all_items(is_active_only=True)

if search_query.strip():
    q = search_query.strip().lower()
    all_items = [i for i in all_items if q in i.title.lower() or q in i.category.lower() or q in i.primary_color.lower()]

# Apply Sort Logic
if sort_option == "Recently Added":
    all_items.sort(key=lambda x: x.id, reverse=True)
elif sort_option == "Formality: High to Low":
    all_items.sort(key=lambda x: x.formality, reverse=True)
elif sort_option == "Formality: Low to High":
    all_items.sort(key=lambda x: x.formality, reverse=False)
elif sort_option == "Category (A-Z)":
    all_items.sort(key=lambda x: (x.category, x.title))

if not all_items:
    st.info("No garments match your search criteria.")
else:
    grid_cols = st.columns(3)
    
    for idx, item in enumerate(all_items):
        col = grid_cols[idx % 3]
        with col:
            render_tira_garment_card(item, show_details=True)
