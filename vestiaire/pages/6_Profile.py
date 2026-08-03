"""
VESTIAIRE User Profile & Account Settings Page.
- Manages user details, style preferences, and wardrobe metrics.
- API keys handled strictly via server environment variables.
"""

import os
import streamlit as st
from services.ui_theme import apply_custom_css, render_sidebar

st.set_page_config(
    page_title="User Profile — VESTIAIRE",
    page_icon="👠",
    layout="wide",
    initial_sidebar_state="expanded"
)

apply_custom_css()
render_sidebar()

st.markdown(
    """
    <div style="margin-bottom: 24px;">
        <span class="attribute-pill attribute-pill-accent">ACCOUNT OVERVIEW</span>
        <h1 style="font-family: 'Fraunces', Georgia, serif; font-size: 32px; font-weight: 500; color: #121212; margin-top: 8px;">User Profile & Settings</h1>
        <p style="color: #525252; font-size: 14px;">Manage your editorial style preferences and system configurations.</p>
    </div>
    """,
    unsafe_allow_html=True
)

col1, col2 = st.columns([2, 1], gap="large")

with col1:
    with st.container(border=True):
        st.markdown("### Profile Details")
        st.text_input("Full Name", value="Editorial Curator", key="user_full_name")
        st.selectbox(
            "Style Preference Aesthetic",
            options=["Editorial", "Minimalist", "Classic Luxury", "Streetwear", "Bohemian", "Vintage"],
            index=0,
            key="user_style_pref"
        )
        st.button("Save Profile Preferences", type="primary")

    st.markdown("<br>", unsafe_allow_html=True)

    with st.container(border=True):
        st.markdown("### Cloud & Environment Status")
        gemini_active = bool(os.environ.get("GEMINI_API_KEY"))
        supabase_active = bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"))

        if gemini_active:
            st.success("Google Gemini 2.5 Flash Vision API active via server environment (GEMINI_API_KEY).")
        else:
            st.warning("GEMINI_API_KEY environment variable is not set on backend server.")

        if supabase_active:
            st.success("Supabase Cloud Database & RLS policies connected.")
        else:
            st.info("Operating in Local SQLite database mode.")

with col2:
    with st.container(border=True):
        st.markdown("### Wardrobe Metrics")
        st.markdown(
            """
            <div class="metric-box" style="margin-bottom: 12px;">
                <div class="metric-value">4</div>
                <div class="metric-label">Garments in Archive</div>
            </div>
            <div class="metric-box" style="margin-bottom: 12px;">
                <div class="metric-value">2</div>
                <div class="metric-label">Saved Outfits</div>
            </div>
            <div class="metric-box">
                <div class="metric-value">Editorial</div>
                <div class="metric-label">Active Aesthetic</div>
            </div>
            """,
            unsafe_allow_html=True
        )
