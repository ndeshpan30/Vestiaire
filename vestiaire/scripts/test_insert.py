import os
import requests
import json

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

payload = {
    "user_id": "11111111-1111-1111-1111-111111111111",
    "title": "Italian Wool Blazer",
    "category": "Outerwear",
    "color": "Navy",
    "formality": 8,
    "image_url": "https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/11111111-1111-1111-1111-111111111111/test.jpg"
}

resp = requests.post(f"{SUPABASE_URL}/rest/v1/garments", headers=headers, json=payload)
print("INSERT Status:", resp.status_code)
print("INSERT Response:", resp.text)
