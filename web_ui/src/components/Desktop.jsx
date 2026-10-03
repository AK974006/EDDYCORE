import React, { useState, useEffect } from 'react';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';
import FileExplorer from '../apps/FileExplorer';
import EddieChat from '../apps/EddieChat';
import Settings from '../apps/Settings';
import Browser from '../apps/Browser';
import Camera from '../apps/Camera';
import WhatsApp from '../apps/WhatsApp';
import CloudFiles from '../apps/CloudFiles';
import Gallery from '../apps/Gallery';
import NeuroSeek from '../apps/NeuroSeek';
import Notepad from '../apps/Notepad';
import MusicPlayer from '../apps/MusicPlayer';
import ImageViewer from '../apps/ImageViewer';
import VideoPlayerApp from '../apps/VideoPlayerApp';
import PDFViewer from '../apps/PDFViewer';
import TrapWatch from '../apps/TrapWatch';
import NetScope from '../apps/NetScope';
import Connect from '../apps/Connect';
import { api } from '../api';
import { useUser } from '../contexts/UserContext';

const Desktop = () => {
    const { currentUser, updateUserSettings } = useUser();
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [wallpaper, setWallpaper] = useState('/default-wallpaper.jpg');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load wallpaper from current user settings
    useEffect(() => {
        if (currentUser?.settings?.wallpaper) {
            setWallpaper(currentUser.settings.wallpaper);
        }
    }, [currentUser]);

    const handleSetWallpaper = (newWallpaper) => {
        setWallpaper(newWallpaper);
        updateUserSettings({ wallpaper: newWallpaper });
    };

    const getAppComponent = (appId) => {
        switch (appId) {
            case 'files': return (props) => <FileExplorer {...props} onSetWallpaper={setWallpaper} />;
            case 'cloud': return CloudFiles;
            case 'eddie': return (props) => <EddieChat {...props} onOpenApp={openWindow} availableApps={apps} />;
            case 'settings': return (props) => <Settings {...props} onSetWallpaper={setWallpaper} />;
            case 'browser': return Browser;
            case 'camera': return Camera;
            case 'gallery': return Gallery;
            case 'whatsapp': return WhatsApp;
            case 'neuroseek': return NeuroSeek;
            case 'notepad': return Notepad;
            case 'music': return MusicPlayer;
            case 'image-viewer': return ImageViewer;
            case 'video-player': return VideoPlayerApp;
            case 'pdf-viewer': return PDFViewer;
            case 'trapwatch': return TrapWatch;
            case 'netscope': return NetScope;
            case 'connect': return Connect;
            default: return () => <div>App not found</div>;
        }
    };

    const getAppSize = (appId) => {
        if (isMobile) {
            return {
                width: window.innerWidth,
                height: window.innerHeight - 48 // Subtract taskbar height (48px)
            };
        }

        switch (appId) {
            case 'camera': return { width: 700, height: 500 };
            case 'gallery': return { width: 1200, height: 800 };
            case 'settings': return { width: 900, height: 650 };
            case 'cloud': return { width: 1000, height: 700 };
            case 'eddie': return { width: 400, height: 600 };
            case 'browser': return { width: 1000, height: 700 };
            case 'neuroseek': return { width: 1100, height: 750 };
            case 'notepad': return { width: 600, height: 500 };
            case 'music': return { width: 400, height: 600 };
            case 'image-viewer': return { width: 800, height: 600 };
            case 'video-player': return { width: 800, height: 500 };
            case 'pdf-viewer': return { width: 800, height: 900 };
            case 'trapwatch': return { width: 1000, height: 700 };
            case 'netscope': return { width: 900, height: 600 };
            case 'connect': return { width: 450, height: 700 };
            default: return { width: 800, height: 600 };
        }
    };

    const openWindow = (appId, title, props = {}) => {



        // WhatsApp now opens as a window inside the OS
        // if (appId === 'whatsapp') {
        //     if (window.electron) {
        //         window.electron.send('launch-whatsapp-native');
        //     } else {
        //         window.open('whatsapp://', '_blank');
        //     }
        //     return;
        // }

        // Check for existing window to restore
        // Check for existing window to restore (only for single-instance apps, viewers might need multiple instances but for now let's reuse if same file or just simplistic check)
        // For viewers, we might want multiple. But let's assume single instance per app ID for now to keep it simple, OR if we want multiple we can generate unique IDs for viewers.
        // Let's stick to single instance for main apps, but maybe allow multiple for viewers?
        // Actually, if I open image A then image B, I probably want a new window or replace content.
        // Let's replace content if window exists.

        let existingWindow = windows.find((w) => w.appId === appId);

        // If it's a viewer, we might allow creating a NEW window if the ID is different? 
        // Current logic uses appId to find window. 
        // If we want multiple image viewers, we'd need dynamic appIds or just skip this check for viewers.
        // For simplicity, let's just focus/update existing app if open.

        if (existingWindow) {
            setWindows((prev) =>
                prev.map((w) =>
                    w.id === existingWindow.id
                        ? {
                            ...w,
                            isMinimized: false,
                            zIndex: Math.max(...prev.map((p) => p.zIndex), 0) + 1,
                            props: props, // Update props (e.g. new file to view)
                            title: title || w.title
                        }
                        : w
                )
            );
            setActiveWindowId(existingWindow.id);
            return;
        }

        const component = getAppComponent(appId);

        // Find app details for icon and title fallback
        const appInfo = apps.find(a => a.id === appId);
        const windowTitle = title || (appInfo ? appInfo.name : appId);
        const windowIcon = appInfo ? appInfo.icon : '📄';

        const fullPageApps = ['whatsapp', 'settings', 'camera', 'browser', 'eddie', 'cloud', 'gallery', 'neuroseek'];
        // Force full page for all apps on mobile
        const isFullPage = isMobile || fullPageApps.includes(appId);

        let size, position;

        if (isFullPage) {
            size = {
                width: window.innerWidth,
                height: window.innerHeight - 48 // Subtract taskbar height (48px)
            };
            position = { x: 0, y: 0 };
        } else {
            size = getAppSize(appId);
            position = { x: 50 + windows.length * 20, y: 50 + windows.length * 20 };
        }

        const newWindow = {
            id: Date.now(),
            appId,
            title: windowTitle,
            icon: windowIcon,
            component,
            props,
            onOpenApp: openWindow, // Pass the openWindow function to the app
            isMinimized: false,
            isMaximized: isFullPage,
            position,
            size,
            zIndex: windows.length + 1,
            noPadding: ['whatsapp', 'browser', 'camera', 'eddie', 'cloud', 'gallery', 'neuroseek', 'notepad', 'music', 'image-viewer', 'video-player', 'pdf-viewer', 'trapwatch', 'netscope', 'connect'].includes(appId),
        };

        setWindows([...windows, newWindow]);
        setActiveWindowId(newWindow.id);
    };

    const closeWindow = (id) => {
        setWindows(windows.filter((w) => w.id !== id));
    };

    const focusWindow = (id) => {
        setActiveWindowId(id);
        setWindows((prevWindows) =>
            prevWindows.map((w) =>
                w.id === id ? { ...w, zIndex: Math.max(...prevWindows.map((pw) => pw.zIndex)) + 1 } : w
            )
        );
    };

    const updateWindowPosition = (id, position) => {
        setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)));
    };

    const handleAppToggle = (appId, appName) => {
        const existingWindow = windows.find((w) => w.appId === appId);

        if (existingWindow) {
            if (activeWindowId === existingWindow.id && !existingWindow.isMinimized) {
                // If active and visible, minimize it
                minimizeWindow(existingWindow.id);
            } else {
                // If minimized or background, restore and focus
                setWindows((prev) =>
                    prev.map((w) =>
                        w.id === existingWindow.id
                            ? { ...w, isMinimized: false, zIndex: Math.max(...prev.map((p) => p.zIndex), 0) + 1 }
                            : w
                    )
                );
                setActiveWindowId(existingWindow.id);
            }
        } else {
            openWindow(appId, appName);
        }
    };

    const apps = [
        { id: 'files', name: 'Files', icon: '📁' },
        { id: 'cloud', name: 'Cloud Storage', icon: '☁️' },
        {
            id: 'browser',
            name: 'Google Chrome',
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" alt="Chrome" className="w-10 h-10 object-contain drop-shadow-lg" />
        },

        { id: 'camera', name: 'Camera', icon: '📸' },
        { id: 'gallery', name: 'Gallery', icon: '🖼️' },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10 object-contain drop-shadow-lg" />
        },
        { id: 'eddie', name: 'Eddie AI', icon: '🤖' },
        { id: 'settings', name: 'Settings', icon: '⚙️' },
        { id: 'neuroseek', name: 'NeuroSeek', icon: '🧠' },
        { id: 'notepad', name: 'Notepad', icon: '📝' },
        { id: 'music', name: 'Music', icon: '🎵' },
        { id: 'trapwatch', name: 'TrapWatch', icon: '🛡️' },
        { id: 'netscope', name: 'NetScope', icon: '📡' },
        { id: 'connect', name: 'Connect', icon: '🔗' },
        // Viewers don't need to be in the main app menu necessarily, but good to have registered
    ];

    const handleAppClick = (app) => {
        openWindow(app.id, app.name);
    };

    const minimizeWindow = (id) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
        );
        if (activeWindowId === id) setActiveWindowId(null);
    };

    const maximizeWindow = (id) => {
        setWindows((prev) =>
            prev.map((w) => {
                if (w.id !== id) return w;
                // If on mobile, disallow restoring to windowed mode (always keep full)
                if (isMobile) return w;

                if (w.isMaximized) {
                    return {
                        ...w,
                        isMaximized: false,
                        size: w.restoredSize || getAppSize(w.appId),
                        position: w.restoredPosition || { x: 50, y: 50 },
                    };
                } else {
                    return {
                        ...w,
                        isMaximized: true,
                        restoredSize: w.size,
                        restoredPosition: w.position,
                        size: { width: window.innerWidth, height: window.innerHeight - 48 },
                        position: { x: 0, y: 0 },
                    };
                }
            })
        );
    };

    return (
        <div
            className="absolute inset-0 bg-cover bg-center overflow-hidden text-white"
            style={{
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Desktop Icons Area */}
            <div className={`absolute inset-0 p-6 ${isMobile ? 'grid grid-cols-4 gap-2 content-start' : 'flex flex-col flex-wrap content-start gap-4'} pointer-events-none`}>
                {apps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => handleAppToggle(app.id, app.name)}
                        className={`flex flex-col items-center justify-center rounded-lg hover:bg-white/10 transition-colors group pointer-events-auto cursor-pointer ${isMobile ? 'w-full h-auto py-2' : 'w-24 h-24'}`}
                    >
                        <span className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-2 filter drop-shadow-lg`}>{app.icon}</span>
                        <span className={`text-sm font-medium text-white drop-shadow-md text-center px-1 truncate w-full group-hover:text-blue-200 ${isMobile ? 'text-xs' : ''}`}>
                            {app.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Window Manager */}
            <WindowManager
                windows={windows}
                activeWindowId={activeWindowId}
                onClose={closeWindow}
                onFocus={focusWindow}
                onMinimize={minimizeWindow}
                onMaximize={maximizeWindow}
                onMove={updateWindowPosition}
                isMobile={isMobile}
            />

            {/* Taskbar */}
            <Taskbar onOpenApp={handleAppToggle} windows={windows} activeWindowId={activeWindowId} onFocus={focusWindow} allApps={apps} isMobile={isMobile} />
        </div>
    );
};

export default Desktop;
