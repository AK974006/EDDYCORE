
try:
    from supabase import create_client
    print("supabase.create_client: OK")
except ImportError as e:
    print(f"supabase.create_client: MISSING ({e})")

try:
    import storage3
    print("storage3: OK")
except ImportError as e:
    print(f"storage3: MISSING ({e})")

try:
    import postgrest
    print("postgrest: OK")
except ImportError as e:
    print(f"postgrest: MISSING ({e})")

try:
    import gotrue
    print("gotrue: OK")
except ImportError as e:
    print(f"gotrue: MISSING ({e})")

try:
    import realtime
    print("realtime: OK")
except ImportError as e:
    print(f"realtime: MISSING ({e})")
