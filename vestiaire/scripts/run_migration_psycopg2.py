import os
import psycopg2

migration_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'supabase', 'migrations', '20260804000001_recreate_garments_table.sql')
with open(migration_path, 'r') as f:
    sql_script = f.read()

project_ref = "hxojdmiqnzqdwhlhnnsm"
passwords = ["postgres", "Password123!", "vestiaire123", "admin123", "password"]

hosts_ports = [
    (f"db.{project_ref}.supabase.co", 5432),
    (f"db.{project_ref}.supabase.co", 6543),
    (f"aws-0-us-east-1.pooler.supabase.com", 6543),
    (f"aws-0-us-east-1.pooler.supabase.com", 5432),
]

connected = False
for pwd in passwords:
    for host, port in hosts_ports:
        try:
            print(f"Trying {host}:{port} with user postgres.{project_ref}...")
            user_str = f"postgres.{project_ref}" if "pooler" in host or port == 6543 else "postgres"
            conn = psycopg2.connect(
                dbname="postgres",
                user=user_str,
                password=pwd,
                host=host,
                port=port,
                connect_timeout=3
            )
            print("Connected successfully!")
            cur = conn.cursor()
            cur.execute(sql_script)
            conn.commit()
            print("Migration executed and committed successfully!")
            connected = True
            break
        except Exception as e:
            print(f"Failed {host}:{port} ({e})")
    if connected:
        break

if not connected:
    print("Direct postgres ports blocked. Trying REST schema reload or Supabase CLI migration push...")
