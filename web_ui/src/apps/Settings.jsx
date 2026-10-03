import React, { useState, useEffect } from 'react';
import { api } from '../api';
import SecuritySettings from '../components/SecuritySettings';
import { useUser } from '../contexts/UserContext';

const Settings = ({ onSetWallpaper }) => { // onSetWallpaper kept for backward compat but we use context mainly
    const { currentUser, updateUserSettings, logoutUser } = useUser();
    const [activeTab, setActiveTab] = useState('wallpaper');

    // Initialize state from currentUser settings
    const usersSettings = currentUser?.settings || {};

    const [currentWallpaper, setCurrentWallpaper] = useState(usersSettings.wallpaper || '/jarvis-bg.png');
    const [customUrl, setCustomUrl] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Display settings
    const [brightness, setBrightness] = useState(usersSettings.brightness || 100);
    const [autoRotate, setAutoRotate] = useState(usersSettings.autoRotate || false);

    // Lock screen settings
    const [lockTimeout, setLockTimeout] = useState(usersSettings.lockTimeout || 5);
    const [showNotifications, setShowNotifications] = useState(usersSettings.showNotifications ?? true);

    // Sound settings
    const [volume, setVolume] = useState(usersSettings.volume || 70);
    const [vibrate, setVibrate] = useState(usersSettings.vibrate ?? true);
    const [notificationSound, setNotificationSound] = useState(usersSettings.notificationSound ?? true);

    // System info
    const [systemInfo, setSystemInfo] = useState({
        version: '1.2.0',
        lastUpdate: new Date().toLocaleDateString(),
        storage: 'Separated User Storage'
    });

    useEffect(() => {
        // user settings sync
        if (currentUser?.settings) {
            setCurrentWallpaper(currentUser.settings.wallpaper || '/jarvis-bg.png');
            setBrightness(currentUser.settings.brightness || 100);
            setVolume(currentUser.settings.volume || 70);
        }
        loadFiles();
    }, [currentUser]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            // TODO: In real app, pass userId to filter files
            const data = await api.storage.list();
            const imageFiles = data.filter(file => {
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                return imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            });
            setFiles(imageFiles);
        } catch (err) {
            console.error('Failed to load files:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetWallpaper = (wallpaperUrl) => {
        updateUserSettings({ wallpaper: wallpaperUrl });
        setCurrentWallpaper(wallpaperUrl);
        if (onSetWallpaper) {
            onSetWallpaper(wallpaperUrl);
        }
    };

    const handleCustomUrl = () => {
        if (customUrl.trim()) {
            handleSetWallpaper(customUrl);
            setCustomUrl('');
        }
    };

    const handleSaveSettings = () => {
        const payload = {
            brightness,
            autoRotate,
            lockTimeout,
            showNotifications,
            volume,
            vibrate,
            notificationSound,
        };
        updateUserSettings(payload);
        alert('Settings saved to your profile');
    };

    const presetWallpapers = [
        { name: 'Matrix (Default)', url: '/default-wallpaper.jpg' },
        { name: 'Jarvis', url: '/jarvis-bg.png' },
    ];

    const tabs = [
        { id: 'wallpaper', name: 'Wallpaper', icon: '🖼️' },
        { id: 'display', name: 'Display', icon: '💡' },
        { id: 'security', name: 'Security', icon: '🔐' },
        { id: 'lockscreen', name: 'Lock Screen', icon: '🔒' },
        { id: 'sound', name: 'Sound & Vibrate', icon: '🔊' },
        { id: 'system', name: 'System Update', icon: '🔄' },
        { id: 'account', name: 'Account & Sync', icon: '👤' },
    ];

    return (
        <div className="h-full flex text-white">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white/5 border-r border-white/10 p-4 overflow-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Settings</span>
                </h2>
                <div className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-white/5 text-gray-300'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
                {/* Wallpaper Tab */}
                {activeTab === 'wallpaper' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Wallpaper Settings</h3>

                        {/* Current Wallpaper */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3">Current Wallpaper</h4>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-32 h-24 bg-cover bg-center rounded border border-white/20"
                                        style={{ backgroundImage: `url(${currentWallpaper})` }}
                                    ></div>
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-400">URL:</div>
                                        <div className="text-sm break-all">{currentWallpaper}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preset Wallpapers */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3">Preset Wallpapers</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {presetWallpapers.map((preset) => (
                                    <div
                                        key={preset.url}
                                        className="group cursor-pointer"
                                        onClick={() => handleSetWallpaper(preset.url)}
                                    >
                                        <div
                                            className="aspect-video bg-cover bg-center rounded-lg border-2 border-white/20 hover:border-blue-500 transition-all"
                                            style={{ backgroundImage: `url(${preset.url})` }}
                                        ></div>
                                        <div className="text-sm mt-2 text-center">{preset.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Uploaded Images */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3">Your Uploaded Images</h4>
                            {loading ? (
                                <div className="text-gray-400">Loading...</div>
                            ) : files.length === 0 ? (
                                <div className="text-gray-400 text-sm">
                                    No images found. Upload images in File Explorer to use as wallpapers.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {files.map((file) => {
                                        const fileUrl = api.storage.downloadUrl(file.name);
                                        return (
                                            <div
                                                key={file.name}
                                                className="group cursor-pointer"
                                                onClick={() => handleSetWallpaper(fileUrl)}
                                            >
                                                <div
                                                    className="aspect-video bg-cover bg-center rounded-lg border-2 border-white/20 hover:border-blue-500 transition-all"
                                                    style={{ backgroundImage: `url(${fileUrl})` }}
                                                ></div>
                                                <div className="text-xs mt-2 text-center truncate">{file.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Custom URL */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3">Custom Wallpaper URL</h4>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    placeholder="Enter image URL..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomUrl()}
                                />
                                <button
                                    onClick={handleCustomUrl}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                Enter a direct URL to an image (e.g., https://example.com/image.jpg)
                            </div>
                        </div>
                    </div>
                )}

                {/* Display Tab */}
                {activeTab === 'display' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Display Settings</h3>

                        {/* Brightness */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold">Brightness</h4>
                                <span className="text-blue-400">{brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brightness}
                                onChange={(e) => setBrightness(e.target.value)}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="checkbox"
                                    id="autoBrightness"
                                    className="w-4 h-4"
                                />
                                <label htmlFor="autoBrightness" className="text-sm text-gray-300">
                                    Adaptive brightness
                                </label>
                            </div>
                        </div>

                        {/* Auto-rotate */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold">Auto-rotate screen</h4>
                                    <p className="text-sm text-gray-400 mt-1">Rotate screen content when device is rotated</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoRotate}
                                        onChange={(e) => setAutoRotate(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Screen timeout */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Screen timeout</h4>
                            <select className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500">
                                <option>15 seconds</option>
                                <option>30 seconds</option>
                                <option selected>1 minute</option>
                                <option>2 minutes</option>
                                <option>5 minutes</option>
                                <option>Never</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <SecuritySettings />
                )}

                {/* Lock Screen Tab */}
                {activeTab === 'lockscreen' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Lock Screen Settings</h3>

                        {/* Lock timeout */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Automatically lock</h4>
                            <select
                                value={lockTimeout}
                                onChange={(e) => setLockTimeout(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="0">Immediately</option>
                                <option value="1">1 minute</option>
                                <option value="5">5 minutes</option>
                                <option value="10">10 minutes</option>
                                <option value="30">30 minutes</option>
                            </select>
                        </div>

                        {/* Show notifications */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold">Show notifications on lock screen</h4>
                                    <p className="text-sm text-gray-400 mt-1">Display notification content when locked</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showNotifications}
                                        onChange={(e) => setShowNotifications(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Lock screen wallpaper */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Lock screen wallpaper</h4>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                                    Same as home screen
                                </button>
                                <button className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    Choose different
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sound & Vibrate Tab */}
                {activeTab === 'sound' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Sound & Vibrate Settings</h3>

                        {/* Volume */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold">Volume</h4>
                                <span className="text-blue-400">{volume}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Vibrate */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold">Vibrate on touch</h4>
                                    <p className="text-sm text-gray-400 mt-1">Vibrate when interacting with the screen</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={vibrate}
                                        onChange={(e) => setVibrate(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Notification sound */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-semibold">Notification sound</h4>
                                    <p className="text-sm text-gray-400 mt-1">Play sound for notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSound}
                                        onChange={(e) => setNotificationSound(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <select className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500">
                                <option>Default notification sound</option>
                                <option>Chime</option>
                                <option>Bell</option>
                                <option>Ding</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* System Update Tab */}
                {activeTab === 'system' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">System Update</h3>

                        {/* System info */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-lg font-semibold mb-4">System Information</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">EDDYCORE Version</span>
                                    <span className="font-medium">{systemInfo.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Last Updated</span>
                                    <span className="font-medium">{systemInfo.lastUpdate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Storage Used</span>
                                    <span className="font-medium">{systemInfo.storage}</span>
                                </div>
                            </div>
                        </div>

                        {/* Check for updates */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-semibold">Software Update</h4>
                                    <p className="text-sm text-green-400 mt-1">✓ Your system is up to date</p>
                                </div>
                            </div>
                            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium">
                                Check for Updates
                            </button>
                            <div className="mt-4">
                                <button onClick={handleSaveSettings} className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-medium">
                                    Save Settings
                                </button>
                            </div>
                        </div>

                        {/* Auto-update */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold">Automatic updates</h4>
                                    <p className="text-sm text-gray-400 mt-1">Download and install updates automatically</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account & Sync Tab */}
                {activeTab === 'account' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Account & Sync</h3>

                        {/* Account info */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                                    {currentUser?.picture ? (
                                        <img src={currentUser.picture} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>👤</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold">{currentUser?.name || 'Cloud User'}</h4>
                                    <p className="text-sm text-gray-400">{currentUser?.email || 'Local Account'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to logout?')) {
                                        logoutUser();
                                        window.location.reload(); // Force reload to clear any local state/Desktop
                                    }
                                }}
                                className="w-full px-4 py-3 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded-lg transition-colors border border-red-500/30"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Sync settings */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-lg font-semibold mb-4">Sync Settings</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>Sync Files</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sync Settings</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sync Wallpapers</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Last sync */}
                        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="text-lg font-semibold">Last Sync</h4>
                                    <p className="text-sm text-gray-400 mt-1">Just now</p>
                                </div>
                            </div>
                            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium">
                                Sync Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
