# CloudOS Authentication System

This system supports multiple users with separate storage and settings, authenticated via **Google**, **Face ID**, or **Password**.

## features

### 👥 Multiple User Profiles
- **Profile Separation**: Each user has their own wallpapers, settings, and files
- **Easy Switching**: Switch between accounts from the login screen
- **Auto-Login**: Remembers the last logged-in user session

### 🔐 Authentication Methods
1. **Google Login**
   - Sign in with your Google Account
   - Automatically creates a profile with your name and photo
   - Secure token-based authentication

2. **Face ID**
   - Registered per-user
   - Fast, secure biometric login
   - Requires one-time setup in Settings

3. **Local Password**
   - Traditional password protection
   - Required fallback for Face ID

## Setup Instructions

### 1. Google Login Setup
To enable Google Login, you need a Google Cloud Console project.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **APIs & Services > Credentials**
4. Create **OAuth 2.0 Client ID**
5. Select "Web application"
6. Add `http://localhost:5173` (or your dev port) to **Authorized Javascript Origins**
7. Copy the **Client ID**
8. Create/Edit `web_ui/.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   ```

### 2. Face Recognition
Models are loaded automatically from the CDN. No extra setup required.
Ensure you have a working webcam and allow camera permissions.

## Usage Guide

### Creating an Account
- **Option A (Google)**: Click "Continue with Google". Account is created automatically.
- **Option B (Local)**: Click "Create local account", enter name and password.

### Switching Users
- On the login screen, click "Switch Account" or the "←" arrow.
- Select your profile picture from the list.

### Managing Security
- Go to **Settings > Security**
- **Change Password**: Update your local password
- **Face ID**: Register or remove your face data

### Logout
- Go to **Settings > Account**
- Click **Logout** to return to the login screen
