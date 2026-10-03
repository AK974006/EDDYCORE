const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { bounds } = primaryDisplay; // use full display bounds (includes taskbar area)

    mainWindow = new BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        frame: false, // frameless so content can extend to screen edges
        // use a transparent window so renderer controls visible corners
        // Disable transparency to avoid border artifacts
        transparent: false,
        // Remove shadow
        hasShadow: false,
        // Use solid black background
        backgroundColor: '#000000',
        // Allow resizing — Windows DWM can handle rounded corners better for resizable windows
        resizable: true,
        fullscreenable: true,
        autoHideMenuBar: true,
        show: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webviewTag: true, // Enable webview tag for Browser app
        },
    });

    // Load the web UI
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
        // Development mode - load from Vite dev server
        const devUrl = 'http://localhost:5173';
        console.log('Loading EDDYCORE from dev server:', devUrl);

        mainWindow.loadURL(devUrl).catch(err => {
            console.error('Failed to load dev server:', err);
            console.log('Make sure the dev server is running on port 5173');
        });

    } else {
        // Production mode - load from built files
        const indexPath = path.join(__dirname, 'web_ui', 'dist', 'index.html');
        console.log('Loading EDDYCORE from:', indexPath);
        mainWindow.loadFile(indexPath);
    }

    // Log any console messages from the renderer
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Renderer]: ${message}`);
    });

    // Handle webview attachment
    mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
        // Strip away preload scripts if present
        delete webPreferences.preload;

        // Enable web security but allow loading external content
        webPreferences.webSecurity = true;
        webPreferences.allowRunningInsecureContent = false;
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true;
    });

    // Windows-specific: request vibrancy/acrylic if supported by this Electron build
    try {
        if (process.platform === 'win32' && typeof mainWindow.setVibrancy === 'function') {
            // 'acrylic' gives Windows 10/11 DWM acrylic blur and may help with seamless edges
            mainWindow.setVibrancy('acrylic');
        }
    } catch (err) {
        console.warn('setVibrancy not available or failed:', err && err.message);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Ensure the window covers the full display bounds and enter fullscreen as fallback
    try {
        mainWindow.setBounds(bounds);
        // also try entering fullscreen to hide the taskbar if needed
        mainWindow.setFullScreen(true);
    } catch (e) {
        // ignore if not supported on the platform
    }
}

app.whenReady().then(() => {
    createWindow();

    // Handle webview permission requests
    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        // Allow all permissions for webview
        callback(true);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for window controls (if needed by the OS)
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});
