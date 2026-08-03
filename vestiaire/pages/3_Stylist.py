"""
Stylist Page — Gemini-assisted AI outfit recommendation interface.
Tira Premium Editorial E-Commerce Style.
"""

import streamlit as st

from models.schemas import OutfitRecord
from services.db import get_all_items, save_outfit
from services.stylist import recommend_outfit
from services.ui_theme import apply_custom_css, render_sidebar, render_tira_garment_card

st.set_page_config(page_title="Stylist — Vestiaire", layout="wide")
apply_custom_css()
render_sidebar()

st.markdown("# Outfit Stylist Editorial")
st.markdown("Generate Gemini-assisted outfit combinations matching occasion, weather, and accessory rules.")
st.divider()

i_col1, i_col2 = st.columns(2)

with i_col1:
    occasion = st.text_input("Occasion", value="Casual coffee date")

with i_col2:
    weather = st.text_input("Weather", value="Warm and sunny, 25°C")

generate_click = st.button("Generate recommendation", type="primary", use_container_width=True)

if generate_click or "current_recommendation" not in st.session_state:
    if generate_click or "current_recommendation" not in st.session_state:
        all_active_items = get_all_items(is_active_only=True)

        if not all_active_items:
            st.warning("Database empty. Add items first.")
            st.stop()

        api_key = st.session_state.get("gemini_api_key", "")

        with st.spinner("Generating recommendation with Gemini 2.5 Flash..."):
            rec, selected_items, err = recommend_outfit(
                items=all_active_items,
                occasion=occasion,
                weather=weather,
                api_key=api_key
            )
            if err:
                st.info(f"Engine note: {err}")
            st.session_state["current_recommendation"] = (rec, selected_items)

rec, selected_items = st.session_state["current_recommendation"]

if rec and selected_items:
    st.divider()
    
    st.markdown(
        f"""
        <div class="callout-box" style="margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0;">{rec.outfit_name}</h2>
                <span class="attribute-pill attribute-pill-accent">{len(selected_items)} items selected</span>
            </div>
            <p style="font-size: 13px; margin-top: 4px; margin-bottom: 0;">Occasion: {occasion} • Weather: {weather}</p>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("## Selected Products")

    piece_cols = st.columns(min(len(selected_items), 4))

    for idx, item in enumerate(selected_items):
        with piece_cols[idx % len(piece_cols)]:
            render_tira_garment_card(item, show_details=False)

    st.markdown("## Rationale and pairing guidance")

    st.markdown(
        f"""
        <div class="callout-box">
            <div class="callout-title">Styling Rationale</div>
            <div>{rec.rationale}</div>
        </div>
        <div class="callout-box">
            <div class="callout-title">Accessory and Hardware Pairing</div>
            <div>{rec.accessory_notes}</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.write("")
    act_col1, act_col2 = st.columns(2)

    with act_col1:
        if st.button("Save outfit", type="primary", use_container_width=True):
            outfit_rec = OutfitRecord(
                name=rec.outfit_name,
                occasion=occasion,
                weather=weather,
                rationale=rec.rationale,
                accessory_notes=rec.accessory_notes,
                items=selected_items
            )
            outfit_id = save_outfit(outfit_rec)
            st.success(f"Outfit saved (ID {outfit_id}).")

    with act_col2:
        if st.button("Generate another", use_container_width=True):
            if "current_recommendation" in st.session_state:
                del st.session_state["current_recommendation"]
            st.rerun()
