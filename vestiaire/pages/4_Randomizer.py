"""
Randomizer Page — Gemini-assisted surprise outfit selection interface.
Tira Premium Editorial E-Commerce Style.
"""

import streamlit as st

from models.schemas import OutfitRecord
from services.db import get_all_items, save_outfit
from services.stylist import recommend_outfit
from services.ui_theme import apply_custom_css, render_sidebar, render_tira_garment_card

st.set_page_config(page_title="Randomizer — Vestiaire", layout="wide")
apply_custom_css()
render_sidebar()

st.markdown("# Surprise Outfit Randomizer")
st.markdown("Gemini-assisted surprise outfit selection conforming to wardrobe composition rules.")
st.divider()

spin_button = st.button("Generate surprise outfit", type="primary", use_container_width=True)

if spin_button or "wheel_recommendation" not in st.session_state:
    if spin_button or "wheel_recommendation" not in st.session_state:
        all_active_items = get_all_items(is_active_only=True)
        if not all_active_items:
            st.warning("Database empty. Add items first.")
            st.stop()

        api_key = st.session_state.get("gemini_api_key", "")
        with st.spinner("Asking Gemini 2.5 Flash for a surprise outfit..."):
            rec, items_list, err = recommend_outfit(
                items=all_active_items,
                occasion="Surprise selection",
                weather="Moderate weather",
                api_key=api_key
            )
            if err:
                st.info(f"Engine note: {err}")
            st.session_state["wheel_recommendation"] = (rec, items_list)

w_rec, w_items = st.session_state["wheel_recommendation"]

if w_rec and w_items:
    st.divider()
    st.markdown(
        f"""
        <div class="callout-box" style="margin-bottom: 24px;">
            <span class="attribute-pill attribute-pill-accent">Gemini surprise selection</span>
            <h2 style="margin-top: 6px;">{w_rec.outfit_name}</h2>
            <p style="font-size: 13px; margin-top: 6px; margin-bottom: 0;">{w_rec.rationale}</p>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("## Selected Products")
    grid_cols = st.columns(min(len(w_items), 4))

    for idx, item in enumerate(w_items):
        with grid_cols[idx % len(grid_cols)]:
            render_tira_garment_card(item, show_details=False)

    st.markdown(
        f"""
        <div class="callout-box">
            <div class="callout-title">Accessory pairing guidance</div>
            <div>{w_rec.accessory_notes}</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    c1, c2 = st.columns(2)
    with c1:
        if st.button("Save outfit", type="primary", use_container_width=True):
            outfit_rec = OutfitRecord(
                name=w_rec.outfit_name,
                occasion="Random spin",
                weather="Moderate",
                rationale=w_rec.rationale,
                accessory_notes=w_rec.accessory_notes,
                items=w_items
            )
            outfit_id = save_outfit(outfit_rec)
            st.success(f"Outfit saved (ID {outfit_id}).")

    with c2:
        if st.button("Re-spin", use_container_width=True):
            if "wheel_recommendation" in st.session_state:
                del st.session_state["wheel_recommendation"]
            st.rerun()
