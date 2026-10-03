import os
from supabase import create_client

# Use environment or fall back to known defaults in the repo
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ukjofmkyobtdrzovwfcg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ak")

print("Supabase URL:", SUPABASE_URL)
print("Bucket to create:", BUCKET_NAME)

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # create_bucket returns the bucket object or raises
    print("Creating bucket...")
    # The python client may not accept a `public` keyword; call with just the name.
    res = client.storage.create_bucket(BUCKET_NAME)
    print("Create bucket response:", res)
    print("Done.")
except Exception as e:
    print("Failed to create bucket:", e)
