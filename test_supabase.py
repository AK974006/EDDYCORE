import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ak")

print("=" * 60)
print("TESTING SUPABASE CONNECTION")
print("=" * 60)
print(f"\nSupabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:30]}..." if SUPABASE_KEY else "No key found")
print(f"Bucket Name: {BUCKET_NAME}")
print("-" * 60)

try:
    # Create Supabase client
    print("\n1. Creating Supabase client...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("   SUCCESS - Client created")
    
    # Test bucket access
    print(f"\n2. Testing bucket '{BUCKET_NAME}' access...")
    try:
        files = supabase.storage.from_(BUCKET_NAME).list()
        print(f"   SUCCESS - Bucket accessible")
        print(f"   Found {len(files)} files/folders:")
        for file in files[:10]:  # Show first 10
            print(f"   - {file.get('name')} ({file.get('metadata', {}).get('size', 0)} bytes)")
    except Exception as e:
        print(f"   ERROR accessing bucket: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        # Try to list all buckets
        print("\n3. Listing all available buckets...")
        try:
            buckets = supabase.storage.list_buckets()
            print(f"   Available buckets:")
            for bucket in buckets:
                print(f"   - {bucket.name} (ID: {bucket.id})")
        except Exception as e2:
            print(f"   ERROR listing buckets: {e2}")
    
    # Test creating a bucket if it doesn't exist
    print(f"\n4. Checking if bucket '{BUCKET_NAME}' exists...")
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if BUCKET_NAME in bucket_names:
            print(f"   Bucket '{BUCKET_NAME}' exists")
        else:
            print(f"   Bucket '{BUCKET_NAME}' does NOT exist")
            print(f"   Attempting to create bucket...")
            try:
                result = supabase.storage.create_bucket(BUCKET_NAME, options={"public": True})
                print(f"   SUCCESS - Bucket created: {result}")
            except Exception as e3:
                print(f"   ERROR creating bucket: {e3}")
    except Exception as e4:
        print(f"   ERROR checking buckets: {e4}")
        
except Exception as e:
    print(f"\nFATAL ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
