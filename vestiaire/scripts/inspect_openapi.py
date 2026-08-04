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
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

print("Fetching OpenAPI schema from PostgREST...")
resp = requests.get(f"{SUPABASE_URL}/rest/v1/?apikey={SUPABASE_KEY}", headers=headers)
if resp.status_code == 200:
    spec = resp.json()
    garments_def = spec.get('definitions', {}).get('garments', {})
    print("PostgREST 'garments' Table Columns:")
    print(json.dumps(list(garments_def.get('properties', {}).keys()), indent=2))
else:
    print(f"Error fetching OpenAPI spec: {resp.status_code} - {resp.text}")
