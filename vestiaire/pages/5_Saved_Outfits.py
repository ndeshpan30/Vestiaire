"""
Saved Outfits Page — Tira Premium Editorial Archive.
"""

import streamlit as st

from services.db import get_all_outfits, delete_outfit
from services.ui_theme import apply_custom_css, render_sidebar, render_tira_garment_card

st.set_page_config(page_title="Saved outfits — Vestiaire", layout="wide")
apply_custom_css()
render_sidebar()

st.markdown("# Saved Outfits Archive")
st.markdown("Archive of saved outfit combinations and styling records.")
st.divider()

outfits = get_all_outfits()

if not outfits:
    st.markdown("No saved outfits in database.")
else:
    st.markdown(f"Count: {len(outfits)} outfits")
    st.divider()

    for outfit in outfits:
        with st.container():
            d_col1, d_col2 = st.columns([3, 1])
            with d_col1:
                st.markdown(
                    f"""
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h2 style="margin:0;">{outfit.name}</h2>
                        <span class="attribute-pill attribute-pill-accent">Occasion: {outfit.occasion or 'General'}</span>
                        <span class="attribute-pill">Weather: {outfit.weather or 'Moderate'}</span>
                    </div>
                    <p style="font-size: 12px; margin-top: 4px; margin-bottom: 0;">Recorded: {outfit.created_at}</p>
                    """,
                    unsafe_allow_html=True
                )

            with d_col2:
                if st.button("Delete record", key=f"del_outfit_{outfit.id}"):
                    delete_outfit(outfit.id)
                    st.success("Record deleted.")
                    st.rerun()

            if outfit.items:
                st.markdown("## Included items")
                item_cols = st.columns(min(len(outfit.items), 5))
                for idx, item in enumerate(outfit.items):
                    with item_cols[idx % len(item_cols)]:
                        render_tira_garment_card(item, show_details=False)

            if outfit.rationale or outfit.accessory_notes:
                st.markdown(
                    f"""
                    <div class="callout-box" style="margin-top: 12px;">
                        <p style="margin-bottom: 4px;"><strong>Rationale:</strong> {outfit.rationale}</p>
                        <p style="margin-bottom: 0;"><strong>Accessory guidance:</strong> {outfit.accessory_notes}</p>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            st.divider()
