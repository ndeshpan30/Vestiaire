import os
import requests

# Load .env
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
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or SUPABASE_KEY

migration_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'supabase', 'migrations', '20260804000001_recreate_garments_table.sql')
with open(migration_path, 'r') as f:
    sql_script = f.read()

print("Executing SQL Migration against Supabase...")

# Try sending SQL execution via Supabase Management or REST
headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Check if there's an rpc exec_sql function or pg_net endpoint, or PostgREST schema query
resp = requests.post(f"{SUPABASE_URL}/rest/v1/rpc/exec_sql", headers=headers, json={"query": sql_script})
print(f"RPC Status: {resp.status_code}")
print(f"RPC Response: {resp.text}")
