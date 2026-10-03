import React, { useState, useEffect } from 'react';
import QuickSettings from './QuickSettings';
import { Battery, Wifi } from 'lucide-react';

const Taskbar = ({ onOpenApp, windows, activeWindowId, onFocus, allApps = [], isMobile }) => {
    const [time, setTime] = useState(new Date());
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close start menu when clicking outside (simple implementation: click on desktop closes it via other means, but here we just toggle)
    // For better experience, we could add a transparent overlay or window click listener, but simple toggle is okay for now.

    const handleAppClick = (appId, appName) => {
        onOpenApp(appId, appName, null);
        setIsStartMenuOpen(false);
    };

    const pinnedApps = [
        { id: 'files', name: 'Files', icon: '📁' },
        { id: 'browser', name: 'Chrome', icon: '🌐' },
        { id: 'camera', name: 'Camera', icon: '📸' },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
        { id: 'eddie', name: 'Eddie AI', icon: '🤖' },
        { id: 'settings', name: 'Settings', icon: '⚙️' },
    ];

    // Helper to check if an app is open
    const isAppOpen = (appId) => windows.some(w => w.appId === appId);
    const isAppActive = (appId) => {
        const win = windows.find(w => w.appId === appId);
        return win && win.id === activeWindowId && !win.isMinimized;
    };

    // Find open windows that are NOT in pinnedApps
    const unpinnedWindows = windows.filter(w => !pinnedApps.find(p => p.id === w.appId));

    // Dedup unpinned windows
    const uniqueUnpinnedApps = unpinnedWindows.reduce((acc, curr) => {
        if (!acc.find(a => a.id === curr.appId)) {
            acc.push({ id: curr.appId, name: curr.title, icon: curr.icon || '📄' });
        }
        return acc;
    }, []);

    // Filter displayed pinned apps on mobile to save space if needed, or keep them all if they fit.
    // 6 Icons + Start + Tray might crowd 360px. 
    // 360px / 40px ~= 9 icons. We have ~7 + tray. It might be tight.
    const displayedPinnedApps = isMobile ? pinnedApps.slice(0, 4) : pinnedApps;

    return (
        <>
            {/* Start Menu */}
            {isStartMenuOpen && (
                <div
                    className={`absolute z-50 bg-os-panel/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col p-4 animate-slide-up-fade origin-bottom-left
                    ${isMobile
                            ? 'inset-x-0 bottom-12 rounded-t-2xl w-full h-[70vh]'
                            : 'bottom-14 left-2 w-[500px] h-[400px] rounded-xl'
                        }`}
                >
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Type here to search"
                            className="w-full bg-white/10 border-none rounded-md px-4 py-3 text-sm text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="text-xs font-semibold text-gray-400 mb-2 px-1">Pinned & Recommended</div>

                    <div className={`grid gap-2 overflow-y-auto pr-1 flex-1 content-start ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
                        {allApps.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => handleAppClick(app.id, app.name)}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors gap-2 group text-center"
                            >
                                <span className="text-2xl filter drop-shadow-md group-hover:scale-110 transition-transform">{app.icon}</span>
                                <span className="text-[10px] text-gray-300 truncate w-full group-hover:text-white leading-tight">
                                    {app.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                AK
                            </div>
                            <span className="text-sm font-medium">Akash</span>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <span className="text-md">⏻</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-os-panel backdrop-blur-md border-t border-white/10 flex items-center px-4 justify-between z-50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                    <button
                        onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
                        className={`p-2 rounded-md transition-colors shrink-0 ${isStartMenuOpen ? 'bg-white/15' : 'hover:bg-white/10'}`}
                    >
                        <img src="/start_icon.png" alt="Start" className="w-6 h-6 object-contain filter drop-shadow-lg" />
                    </button>

                    <div className="h-8 w-[1px] bg-white/20 mx-2 shrink-0"></div>

                    {/* Pinned Apps */}
                    {displayedPinnedApps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => handleAppClick(app.id, app.name)}
                            className={`p-2 rounded-md transition-all relative group flex flex-col items-center justify-center shrink-0 ${isAppActive(app.id) ? 'bg-white/20' : 'hover:bg-white/10'
                                }`}
                        >
                            <span className="text-xl">{app.icon}</span>
                            {/* Tooltip - Hide on mobile */}
                            {!isMobile && (
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {app.name}
                                </span>
                            )}
                            {/* Active Indicator Dot */}
                            {isAppOpen(app.id) && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400"></div>
                            )}
                        </button>
                    ))}

                    {/* Separator if there are unpinned apps */}
                    {uniqueUnpinnedApps.length > 0 && <div className="h-6 w-[1px] bg-white/10 mx-1 shrink-0"></div>}

                    {/* Unpinned Running Apps */}
                    {uniqueUnpinnedApps.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => handleAppClick(app.id, app.name)}
                            className={`p-2 rounded-md transition-all relative group flex flex-col items-center justify-center shrink-0 ${isAppActive(app.id) ? 'bg-white/20' : 'hover:bg-white/10'
                                }`}
                        >
                            <span className="text-xl">{app.icon}</span>
                            {!isMobile && (
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {app.name}
                                </span>
                            )}
                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400"></div>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {/* System Tray Area */}
                    <button
                        onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
                        className="flex items-center gap-3 px-2 py-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <div className="flex items-center gap-2 text-gray-300">
                            <Wifi size={16} />
                            <Battery size={16} />
                        </div>
                        {!isMobile && (
                            <div className="text-sm font-medium">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        {isMobile && (
                            <div className="text-xs font-medium">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <QuickSettings
                isOpen={isQuickSettingsOpen}
                onClose={() => setIsQuickSettingsOpen(false)}
                onOpenSettings={() => handleAppClick('settings', 'Settings')}
                isMobile={isMobile}
            />
        </>
    );
};

export default Taskbar;
