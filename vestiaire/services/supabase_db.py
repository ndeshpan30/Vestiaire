"""
Multi-User Supabase Database & Authentication Service for Vestiaire Backend.
Provides user authentication, RLS-scoped database queries, user profile management,
and user-isolated cloud storage uploads.
"""

import os
import time
from typing import List, Optional, Dict, Any

try:
    from supabase import create_client, Client
except ImportError:
    Client = Any

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")


def get_supabase_client() -> Optional[Client]:
    """Returns an authenticated Supabase client instance."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase client initialization error: {e}")
        return None


# ====================================================================
# AUTHENTICATION & USER PROFILE METHODS
# ====================================================================

def sign_up_user(email: str, password: str, full_name: str, style_preference: str = "Editorial") -> Dict[str, Any]:
    """Registers a new user in Supabase Auth and triggers profile creation."""
    client = get_supabase_client()
    if not client:
        return {"error": "Supabase client not configured."}

    try:
        res = client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "full_name": full_name,
                    "style_preference": style_preference
                }
            }
        })
        if res.user:
            return {"user": res.user, "session": res.session}
        return {"error": "Sign up failed."}
    except Exception as e:
        return {"error": str(e)}


def sign_in_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticates an existing user with email and password."""
    client = get_supabase_client()
    if not client:
        return {"error": "Supabase client not configured."}

    try:
        res = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        if res.user:
            return {"user": res.user, "session": res.session}
        return {"error": "Invalid credentials."}
    except Exception as e:
        return {"error": str(e)}


def sign_out_user() -> bool:
    """Signs out the active user session."""
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.auth.sign_out()
        return True
    except Exception as e:
        print(f"Sign out error: {e}")
        return False


def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves user profile details from public.profiles table."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        res = client.table("profiles").select("*").eq("id", user_id).single().execute()
        return res.data
    except Exception as e:
        print(f"Fetch profile error: {e}")
        return None


# ====================================================================
# USER-ISOLATED DATA ACCESS METHODS (RLS SCOPED)
# ====================================================================

def fetch_garments_for_user(
    user_id: str,
    category: str = "All",
    color: str = "All",
    min_formality: int = 1,
    max_formality: int = 10,
    show_archived: bool = False,
    sort_by: str = "Recently Added"
) -> List[Dict[str, Any]]:
    """Retrieves garments scoped strictly to the authenticated user ID."""
    client = get_supabase_client()
    if not client:
        return []

    query = client.table("garments").select("*").eq("user_id", user_id)

    if not show_archived:
        query = query.eq("is_archived", False)
    
    if category != "All":
        query = query.eq("category", category)

    if color != "All":
        query = query.eq("color", color)

    query = query.gte("formality", min_formality).lte("formality", max_formality)

    # Sorting
    if sort_by == "Recently Added":
        query = query.order("created_at", desc=True)
    elif sort_by == "Formality: High to Low":
        query = query.order("formality", desc=True)
    elif sort_by == "Formality: Low to High":
        query = query.order("formality", desc=False)
    elif sort_by == "Category (A-Z)":
        query = query.order("category", desc=False).order("title", desc=False)

    res = query.execute()
    return res.data or []


def upload_user_garment_image(user_id: str, image_bytes: bytes, file_extension: str = "png") -> Optional[str]:
    """Uploads raw image bytes to user-isolated folder ({user_id}/garment_timestamp.png) in garments bucket."""
    client = get_supabase_client()
    if not client:
        return None

    ext = file_extension.lstrip('.')
    filename = f"{user_id}/garment_{int(time.time() * 1000)}.{ext}"
    
    try:
        client.storage.from_("garments").upload(
            path=filename,
            file=image_bytes,
            file_options={"content-type": f"image/{ext}"}
        )
        public_url = client.storage.from_("garments").get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"Supabase Storage Upload Error: {e}")
        return None


def add_garment_for_user(user_id: str, garment_data: Dict[str, Any], image_bytes: Optional[bytes] = None) -> Optional[Dict[str, Any]]:
    """Inserts a new garment record injected with user_id into Supabase."""
    client = get_supabase_client()
    if not client:
        return None

    garment_data["user_id"] = user_id

    if image_bytes and "image_url" not in garment_data:
        public_url = upload_user_garment_image(user_id, image_bytes)
        if public_url:
            garment_data["image_url"] = public_url

    res = client.table("garments").insert(garment_data).execute()
    return res.data[0] if res.data else None


def toggle_archive_garment_for_user(user_id: str, garment_id: str, is_archived: bool) -> bool:
    """Updates archive status scoped to user_id."""
    client = get_supabase_client()
    if not client:
        return False

    res = client.table("garments").update({"is_archived": is_archived}).eq("id", garment_id).eq("user_id", user_id).execute()
    return bool(res.data)


def delete_garment_for_user(user_id: str, garment_id: str, image_url: Optional[str] = None) -> bool:
    """Deletes user garment record from DB and cleans up storage object."""
    client = get_supabase_client()
    if not client:
        return False

    # Optional Storage Cleanup
    if image_url and f"garments/{user_id}/" in image_url:
        try:
            filename = image_url.split("garments/")[-1]
            client.storage.from_("garments").remove([filename])
        except Exception as e:
            print(f"Storage Delete Note: {e}")

    res = client.table("garments").delete().eq("id", garment_id).eq("user_id", user_id).execute()
    return bool(res.data)
