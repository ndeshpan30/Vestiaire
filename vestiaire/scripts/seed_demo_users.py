"""
Python Seeding Script: Register Demo User Accounts in Supabase.
Creates demo accounts with pre-configured style preferences and auto-confirmed emails.
"""

import os
import sys

# Add root project path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.supabase_db import sign_up_user, get_supabase_client

DEMO_ACCOUNTS = [
    {
        "email": "demo@vestiaire.app",
        "password": "Password123!",
        "full_name": "Demo Curator",
        "style_preference": "Editorial"
    },
    {
        "email": "admin@vestiaire.app",
        "password": "Password123!",
        "full_name": "Admin Stylist",
        "style_preference": "Minimalist"
    },
    {
        "email": "fashionista@vestiaire.app",
        "password": "Password123!",
        "full_name": "Elena Vance",
        "style_preference": "Classic Luxury"
    }
]

def seed_demo_users():
    print("=" * 60)
    print("VESTIAIRE — SUPABASE DEMO USER SEEDING SCRIPT")
    print("=" * 60)

    client = get_supabase_client()
    if not client:
        print("[!] Error: Supabase client not configured.")
        print("[!] Please ensure SUPABASE_URL and SUPABASE_KEY are set in your environment or .env file.")
        return

    print(f"[*] Target Supabase Project: {os.environ.get('SUPABASE_URL')}\n")

    for acc in DEMO_ACCOUNTS:
        print(f"[*] Creating demo account: {acc['email']} ({acc['full_name']})...")
        res = sign_up_user(
            email=acc["email"],
            password=acc["password"],
            full_name=acc["full_name"],
            style_preference=acc["style_preference"]
        )

        if "error" in res:
            print(f"    [!] Result: {res['error']}")
        else:
            print(f"    [✓] Success! Account created for {acc['email']}")

    print("\n" + "=" * 60)
    print("Seeding complete! You can now log in using any demo account.")
    print("=" * 60)

if __name__ == "__main__":
    seed_demo_users()
