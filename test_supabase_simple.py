import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ak")

print("Testing Supabase Connection")
print(f"URL: {SUPABASE_URL}")
print(f"Bucket: {BUCKET_NAME}")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Client created successfully")
    
    # List buckets
    buckets = supabase.storage.list_buckets()
    print(f"\nAvailable buckets: {len(buckets)}")
    for b in buckets:
        print(f"  - {b.name}")
    
    # Check if our bucket exists
    bucket_names = [b.name for b in buckets]
    if BUCKET_NAME in bucket_names:
        print(f"\nBucket '{BUCKET_NAME}' EXISTS")
        
        # Try to list files
        files = supabase.storage.from_(BUCKET_NAME).list()
        print(f"Files in bucket: {len(files)}")
        for f in files[:5]:
            print(f"  - {f.get('name')}")
    else:
        print(f"\nBucket '{BUCKET_NAME}' DOES NOT EXIST")
        print("Creating bucket...")
        result = supabase.storage.create_bucket(BUCKET_NAME, options={"public": True})
        print(f"Bucket created: {result}")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
