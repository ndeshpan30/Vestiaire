"""
VESTIAIRE UI Theme — Absolute Top VESTIAIRE Sidebar & Fraunces/Inter Engine.
- Gemini API key handled strictly server-side via process.env.GEMINI_API_KEY / os.environ.
- UI password fields for API keys deleted from sidebar/settings.
- Permanently suppresses default Streamlit stSidebarNav floating above VESTIAIRE header.
"""

import os
import streamlit as st
from PIL import Image
from typing import Optional

from services.db import get_all_items


def apply_custom_css():
    """Injects CSS to completely remove default Streamlit sidebar nav items above VESTIAIRE header."""
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap');

        /* ABSOLUTE SUPPRESSION OF DEFAULT STREAMLIT SIDEBAR NAV ITEMS ABOVE VESTIAIRE */
        [data-testid="stSidebarNav"],
        ul[data-testid="stSidebarNavItems"],
        div[data-testid="stSidebarNav"],
        nav[data-testid="stSidebarNav"],
        [data-testid="stSidebarNavSeparator"],
        section[data-testid="stSidebar"] > div:first-child > div:first-child > ul,
        section[data-testid="stSidebar"] nav {
            display: none !important;
            visibility: hidden !important;
            height: 0px !important;
            max-height: 0px !important;
            overflow: hidden !important;
            margin: 0px !important;
            padding: 0px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        :root {
            /* WCAG Compliant Color Tokens */
            --bg-main: #FFFFFF;
            --text-primary: #121212;         /* 18.5:1 Contrast (AAA) */
            --text-muted: #525252;           /* 4.6:1 Contrast (AA Compliant Normal Text) */
            --tag-text: #404040;            /* 8.4:1 Contrast on #F5F5F5 (AAA Compliant Tag Text) */
            --tag-bg: #F5F5F5;
            --border-light: #EEEEEE;
            --border-tag: #E5E5E5;
            --accent-signature: #5B1422;     /* 10.4:1 Contrast (AAA Compliant Burgundy) */

            /* Font Family Tokens */
            --font-serif: 'Fraunces', Georgia, serif;
            --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Permanently Hide All Sidebar Collapse & Expand Toggle Buttons */
        [data-testid="stSidebarCollapseButton"],
        [data-testid="stSidebarExpandButton"],
        button[data-testid="stSidebarCollapseButton"],
        button[data-testid="stSidebarExpandButton"],
        button[data-testid="baseButton-headerNoPadding"],
        [data-testid="stHeader"] button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0px !important;
            height: 0px !important;
            pointer-events: none !important;
        }

        header[data-testid="stHeader"],
        [data-testid="stHeader"] {
            background-color: transparent !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        div[data-testid="stDecoration"] {
            display: none !important;
            visibility: hidden !important;
            height: 0px !important;
        }

        #MainMenu,
        div[data-testid="stToolbar"] {
            visibility: hidden !important;
            display: none !important;
        }

        /* Container Padding */
        .block-container {
            max-width: 1280px !important;
            padding-left: 32px !important;
            padding-right: 32px !important;
            padding-top: 24px !important;
            padding-bottom: 48px !important;
            margin: 0 auto !important;
        }

        /* Permanently Lock Sidebar Drawer in Fixed Expanded View starting at very top */
        section[data-testid="stSidebar"],
        [data-testid="stSidebar"] {
            min-width: 280px !important;
            width: 280px !important;
            display: block !important;
            visibility: visible !important;
            background-color: #FAFAFA !important;
            border-right: 1px solid #EEEEEE !important;
            padding: 20px 16px !important;
            position: relative !important;
            transform: none !important;
        }

        /* Base Body (Inter Sans-Serif) */
        html, body, [class*="css"], .stApp {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            background-color: #FFFFFF !important;
            color: #121212 !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Editorial Headlines (Fraunces Serif) */
        h1, h2, h3, .stMarkdown h1, .stMarkdown h2, .stMarkdown h3 {
            font-family: 'Fraunces', Georgia, serif !important;
            color: #121212 !important;
        }

        h1, .stMarkdown h1 {
            font-size: 32px !important;
            font-weight: 500 !important;
            line-height: 40px !important;
            letter-spacing: -0.02em !important;
            margin-top: 0 !important;
            margin-bottom: 12px !important;
        }

        h2, .stMarkdown h2 {
            font-size: 24px !important;
            font-weight: 500 !important;
            line-height: 32px !important;
            letter-spacing: -0.01em !important;
            margin-top: 0 !important;
            margin-bottom: 16px !important;
        }

        h3, .stMarkdown h3 {
            font-size: 18px !important;
            font-weight: 600 !important;
            line-height: 26px !important;
            margin-top: 0 !important;
            margin-bottom: 12px !important;
        }

        /* Body Copy (Inter) */
        p, span, div, .stMarkdown p {
            font-family: 'Inter', system-ui, sans-serif !important;
            color: #121212;
            font-size: 14px;
            line-height: 22px;
        }

        .text-neutral-600,
        p.text-muted {
            color: #525252 !important;
            font-size: 14px !important;
            line-height: 22px !important;
        }

        label, .stMarkdown label, p[data-testid="stWidgetLabel"] {
            font-family: 'Inter', system-ui, sans-serif !important;
            color: #121212 !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            margin-bottom: 8px !important;
        }

        *, ::before, ::after {
            border-radius: 4px;
        }

        /* High-Contrast Badges & Attribute Pills */
        .attribute-pill,
        .tag-badge {
            display: inline-block;
            background-color: #F5F5F5 !important;
            color: #404040 !important;
            border: 1px solid #E5E5E5 !important;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 6px;
            margin-bottom: 6px;
        }

        .attribute-pill-accent {
            background-color: #5B1422 !important;
            color: #FFFFFF !important;
            border: 1px solid #5B1422 !important;
        }

        .attribute-pill-accent * {
            color: #FFFFFF !important;
        }

        /* 6-State Button Architecture */
        .stButton > button {
            font-family: 'Inter', system-ui, sans-serif !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            border-radius: 6px !important;
            border: 1px solid #EEEEEE !important;
            background-color: #FFFFFF !important;
            color: #121212 !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            padding: 12px 24px !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
            cursor: pointer !important;
            transition: all 150ms ease-out !important;
        }

        .stButton > button:hover {
            border-color: #5B1422 !important;
            color: #5B1422 !important;
            background-color: #FAFAFA !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            transform: translateY(-1px) !important;
        }

        .stButton > button:focus-visible {
            outline: none !important;
            box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #5B1422 !important;
        }

        .stButton > button:active {
            transform: translateY(0) scale(0.98) !important;
            background-color: #F4F4F4 !important;
            box-shadow: none !important;
        }

        .stButton > button:disabled,
        .stButton > button[disabled] {
            pointer-events: none !important;
            opacity: 0.5 !important;
            box-shadow: none !important;
            transform: none !important;
            cursor: not-allowed !important;
        }

        .stButton > button[kind="primary"] {
            background-color: #5B1422 !important;
            color: #FFFFFF !important;
            border: 1px solid #5B1422 !important;
        }

        .stButton > button[kind="primary"] * {
            color: #FFFFFF !important;
        }

        .stButton > button[kind="primary"]:hover {
            background-color: #450F1A !important;
            color: #FFFFFF !important;
            box-shadow: 0 4px 14px rgba(91, 20, 34, 0.28) !important;
            transform: translateY(-1px) !important;
        }

        /* Sidebar Custom Navigation Links with Accessible Left-Border Indicator */
        div[data-testid="stPageLink"] a {
            font-family: 'Inter', system-ui, sans-serif !important;
            border-radius: 6px !important;
            padding: 10px 16px !important;
            margin-bottom: 8px !important;
            color: #333333 !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            background-color: transparent !important;
            transition: all 180ms ease !important;
            text-decoration: none !important;
            display: block !important;
            border-left: 3px solid transparent !important;
        }

        div[data-testid="stPageLink"] a:hover {
            background-color: #F4F4F4 !important;
            color: #5B1422 !important;
        }

        div[data-testid="stPageLink"] a[aria-current="page"],
        div[data-testid="stPageLink"] a.active {
            background-color: #F4F4F4 !important;
            color: #5B1422 !important;
            border-left: 3px solid #5B1422 !important;
            padding-left: 13px !important;
        }

        /* Inputs */
        .stTextInput input, .stNumberInput input, .stTextArea textarea {
            font-family: 'Inter', system-ui, sans-serif !important;
            background-color: transparent !important;
            color: #121212 !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1.5px solid #D4D4D4 !important;
            border-radius: 0px !important;
            font-size: 14px !important;
            padding: 10px 4px !important;
            transition: border-color 200ms ease-out !important;
        }

        .stTextInput input:focus, .stNumberInput input:focus, .stTextArea textarea:focus {
            border-bottom-color: #5B1422 !important;
            box-shadow: none !important;
            outline: none !important;
        }

        .stTextInput input::placeholder {
            color: #525252 !important;
            opacity: 1 !important;
        }

        /* Product Card */
        .tira-product-card {
            background-color: #FFFFFF;
            border: 1px solid #EEEEEE;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tira-product-card:hover {
            border-color: #5B1422;
            box-shadow: 0 8px 24px rgba(91, 20, 34, 0.08);
            transform: translateY(-2px);
        }

        .tira-img-container {
            background-color: #FAFAFA;
            border-radius: 6px;
            padding: 0px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 280px !important;
            aspect-ratio: 4 / 5 !important;
            margin-bottom: 12px;
            overflow: hidden;
            border: 1px solid #EEEEEE;
        }

        .tira-img-container img {
            width: 100% !important;
            height: 280px !important;
            object-fit: cover !important;
            object-position: center !important;
            transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .tira-product-card:hover .tira-img-container img {
            transform: scale(1.03) !important;
        }

        .tira-category-tag {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #525252;
            margin-bottom: 4px;
        }

        .tira-item-title {
            font-family: 'Fraunces', Georgia, serif !important;
            font-size: 16px;
            font-weight: 500;
            color: #121212;
            margin-bottom: 8px;
            line-height: 22px;
            height: 44px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .tira-rating-line {
            font-size: 12px;
            color: #525252;
            margin-bottom: 12px;
        }

        hr {
            border: none !important;
            border-top: 1px solid #EEEEEE !important;
            margin: 32px 0 !important;
        }
        </style>
        """,
        unsafe_allow_html=True
    )


def render_sidebar():
    """Renders consolidated custom sidebar navigation with VESTIAIRE header as absolute top element."""
    with st.sidebar:
        st.markdown(
            """
            <div style="margin-top: 0px !important; padding-top: 0px !important; margin-bottom: 16px !important;">
                <h1 style="font-family: 'Fraunces', Georgia, serif !important; color: #121212 !important; font-size: 30px !important; font-weight: 500 !important; letter-spacing: 0.04em !important; text-transform: uppercase !important; margin: 0 0 4px 0 !important; line-height: 34px !important;">VESTIAIRE</h1>
                <div style="font-family: 'Inter', sans-serif !important; color: #5B1422 !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.14em !important;">CLOSET EDITORIAL</div>
            </div>
            <hr style="margin: 16px 0 !important; border-top: 1px solid #EEEEEE !important;">
            """,
            unsafe_allow_html=True
        )

        st.page_link("app.py", label="Your Closet")
        st.page_link("pages/1_Add_Item.py", label="Add Garment")
        st.page_link("pages/3_Stylist.py", label="Outfit Stylist")
        st.page_link("pages/4_Randomizer.py", label="Surprise Randomizer")
        st.page_link("pages/5_Saved_Outfits.py", label="Saved Outfits Archive")
        st.page_link("pages/6_Profile.py", label="User Profile")

        st.divider()

        with st.expander("System Info & Status", expanded=False):
            st.markdown("#### Cloud & AI Engine Status")
            
            gemini_active = bool(os.environ.get("GEMINI_API_KEY"))
            supabase_active = bool(os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"))

            if gemini_active:
                st.markdown("<span class='attribute-pill attribute-pill-accent'>Gemini Vision Active (Server Env)</span>", unsafe_allow_html=True)
            else:
                st.markdown("<span class='attribute-pill'>Gemini Key Unset</span>", unsafe_allow_html=True)

            if supabase_active:
                st.markdown("<span class='attribute-pill attribute-pill-accent'>Supabase Cloud Active</span>", unsafe_allow_html=True)
            else:
                st.markdown("<span class='attribute-pill'>Local SQLite Mode</span>", unsafe_allow_html=True)

            st.divider()
            st.markdown("Database: `garments` / `wardrobe.db`")
            st.markdown("Storage: `garments` / `/saved_clothes`")
            st.markdown("Engine: `gemini-2.5-flash`")


def render_sidebar_header():
    """Alias for render_sidebar."""
    render_sidebar()


def render_tira_garment_card(item, show_details: bool = True):
    """
    Renders Tira frameless product card matching Fraunces title & Inter metadata:
    - Aspect ratio 4:5 image container (height: 280px)
    - WCAG AA/AAA compliant subtext (#525252 and #404040)
    """
    with st.container(border=True):
        img = load_item_image(item.image_path)
        if img:
            st.image(img, use_container_width=True)

        st.markdown(f"<div class='tira-category-tag'>{item.category}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='tira-item-title'>{item.title}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='tira-rating-line'>Formality {item.formality}/10</div>", unsafe_allow_html=True)

        st.markdown(
            f"""
            <div>
                <span class="attribute-pill">{item.primary_color}</span>
                <span class="attribute-pill">{item.material or 'Cotton'}</span>
                <span class="attribute-pill">{item.pattern or 'Solid'}</span>
            </div>
            """,
            unsafe_allow_html=True
        )

        if show_details and item.seasons:
            st.markdown(
                f"""
                <div style="font-size: 12px; color: #525252; margin-top: 8px;">
                    Seasons: {', '.join(item.seasons)}
                </div>
                """,
                unsafe_allow_html=True
            )


def load_item_image(image_path: str) -> Optional[Image.Image]:
    """Safely loads an image file from local path or URL."""
    if not image_path:
        return None
    
    if image_path.startswith("http://") or image_path.startswith("https://"):
        return image_path  # Return URL string directly for Streamlit image rendering

    if os.path.exists(image_path):
        try:
            return Image.open(image_path)
        except Exception:
            return None
    
    abs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), image_path)
    if os.path.exists(abs_path):
        try:
            return Image.open(abs_path)
        except Exception:
            return None

    return None
