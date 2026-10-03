# Supabase Storage Setup Guide for EDDYCORE

## Current Issue:
The Supabase storage is showing errors related to row-level security policies or bucket access.

## Solution Steps:

### Option 1: Create Bucket via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `ukjofmkyobtdrzovwfcg`
3. Click on "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Bucket name: `ak`
6. Make it **PUBLIC** (toggle the public option ON)
7. Click "Create bucket"

### Option 2: Disable RLS for Storage (If bucket exists)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Storage" → Click on the `ak` bucket
4. Go to "Policies" tab
5. Make sure there's a policy that allows public access, or:
   - Click "New Policy"
   - Select "For full customization"
   - Policy name: `Public Access`
   - Allowed operation: SELECT, INSERT, UPDATE, DELETE
   - Target roles: `public`, `anon`
   - USING expression: `true`
   - Click "Review" then "Save policy"

### Option 3: Use Local Storage Only
If you don't want to use Supabase cloud storage, you can disable it:

1. Edit `.env` file
2. Comment out or remove the Supabase credentials:
   ```
   # SUPABASE_URL=https://ukjofmkyobtdrzovwfcg.supabase.co
   # SUPABASE_KEY=...
   # SUPABASE_BUCKET=ak
   ```
3. The app will automatically fall back to local storage in the `storage/` folder

### Current Configuration:
- **Supabase URL**: https://ukjofmkyobtdrzovwfcg.supabase.co
- **Bucket Name**: ak
- **Local Storage Fallback**: c:\\projects\\cloud\\storage

### Testing:
After making changes, restart the app:
```
.\run_app.bat
```

Then test by:
1. Opening the "Cloud Storage" app in EDDYCORE
2. Try uploading a file
3. Check if it appears in the file list

## Notes:
- The app has a built-in fallback to local storage if Supabase fails
- Files uploaded locally will be stored in `c:\\projects\\cloud\\storage`
- Both local and cloud files will be visible in the app
