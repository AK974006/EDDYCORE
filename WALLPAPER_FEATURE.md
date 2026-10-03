# Wallpaper Management Feature

## Overview
The EDDYCORE now supports dynamic wallpaper management with persistent storage. Users can change wallpapers anytime, and the selected wallpaper will be saved even when the app is closed.

## Features

### 1. **Persistent Wallpaper Storage**
- Wallpaper settings are saved to `storage/settings.json` on the backend
- Settings persist across app restarts
- Default wallpaper: `/default-wallpaper.jpg`

### 2. **Multiple Ways to Change Wallpaper**

#### Method 1: Settings App
1. Click the **Settings** icon (⚙️) in the taskbar
2. Choose from:
   - **Preset Wallpapers**: Default wallpapers
   - **Your Uploaded Images**: Images you've uploaded via File Explorer
   - **Custom URL**: Enter any direct image URL

#### Method 2: File Explorer (Right-Click)
1. Open **File Explorer** (📁) from the taskbar
2. Upload an image file (JPG, PNG, GIF, BMP, WEBP)
3. Right-click on any image file
4. Select **"Set as Wallpaper"** from the context menu

### 3. **Supported Image Formats**
- JPG/JPEG
- PNG
- GIF
- BMP
- WEBP
- SVG

## Technical Implementation

### Backend (FastAPI)
- **Endpoint**: `/api/settings/wallpaper`
  - `GET`: Retrieve current wallpaper
  - `POST`: Set new wallpaper
- **Storage**: JSON file at `storage/settings.json`

### Frontend (React)
- **Desktop Component**: Loads wallpaper on mount, applies as background
- **Settings App**: Full wallpaper management UI
- **File Explorer**: Context menu for image files

### API Structure
```javascript
// Get current wallpaper
api.settings.getWallpaper()
// Returns: { wallpaper: "/jarvis-bg.png" }

// Set wallpaper
api.settings.setWallpaper(wallpaperUrl)
// Returns: { status: "success", wallpaper: wallpaperUrl }
```

## Usage Examples

### Setting a Custom Wallpaper URL
```javascript
await api.settings.setWallpaper('https://example.com/my-wallpaper.jpg');
```

### Setting from Uploaded File
```javascript
const wallpaperUrl = api.storage.downloadUrl('my-image.png');
await api.settings.setWallpaper(wallpaperUrl);
```

## Files Modified/Created

### New Files
- `backend/settings.py` - Settings API endpoints
- `web_ui/src/apps/Settings.jsx` - Settings app UI
- `storage/settings.json` - Persistent settings storage (auto-created)

### Modified Files
- `backend/main.py` - Added settings router
- `web_ui/src/api.js` - Added settings API methods
- `web_ui/src/components/Desktop.jsx` - Dynamic wallpaper loading
- `web_ui/src/apps/FileExplorer.jsx` - Context menu for wallpaper setting

## Future Enhancements
- Wallpaper slideshow/rotation
- Blur/brightness adjustments
- Multiple wallpaper presets
- Wallpaper categories/collections
- Unsplash API integration
