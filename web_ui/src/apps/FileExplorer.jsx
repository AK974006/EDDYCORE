import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { openLocalSystemFiles } from '../utils/fileSystem';

const FileExplorer = ({ onSetWallpaper, onOpenApp }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await api.storage.list();
            setFiles(data);
        } catch (err) {
            console.error("Failed to load files", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    // Close context menu when clicking anywhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await api.storage.upload(file);
            loadFiles();
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const handleOpenSystemFiles = async () => {
        const localFiles = await openLocalSystemFiles();
        if (localFiles && localFiles.length > 0) {
            // Merge system files into the view.
            // Note: These files are not uploaded to cloud storage, just viewed.
            // We adding a flag 'isSystem' to distinguish them.
            const systemFileObjects = localFiles.map(f => ({
                ...f,
                isSystem: true
            }));

            // Optionally, we could choose to upload them immediately or just list them.
            // For this implementation, let's append them to the current list so the user can interact.
            // If the user wants to persist them to cloud, they might need an explicit 'upload' action
            // or we upload them automatically. Given the context "allow to open", listings seems appropriate.

            // However, since handleClick logic expects cloud files for some actions, 
            // we will simply add them to the state.

            setFiles(prev => [...prev, ...systemFileObjects]);
        }
    };

    const handleDelete = async (filename) => {
        try {
            await api.storage.delete(filename);
            loadFiles();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleContextMenu = (e, file) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            file: file
        });
    };

    const handleSetWallpaper = async (filename) => {
        try {
            const wallpaperUrl = api.storage.downloadUrl(filename);
            await api.settings.setWallpaper(wallpaperUrl);
            if (onSetWallpaper) {
                onSetWallpaper(wallpaperUrl);
            }
            setContextMenu(null);
            alert('Wallpaper set successfully!');
        } catch (err) {
            console.error("Failed to set wallpaper", err);
            alert('Failed to set wallpaper');
        }
    };

    const isImageFile = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isVideoFile = (filename) => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
        return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isPdfFile = (filename) => {
        return filename.toLowerCase().endsWith('.pdf');
    };

    const isMusicFile = (filename) => {
        const musicExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
        return musicExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const [installing, setInstalling] = useState(false);
    const [installProgress, setInstallProgress] = useState(0);
    const [installingAppName, setInstallingAppName] = useState('');

    const [installingAppIcon, setInstallingAppIcon] = useState('');
    const installIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (installIntervalRef.current) {
                clearInterval(installIntervalRef.current);
            }
        };
    }, []);

    const handleFileClick = async (file) => {
        let fileUrl;
        let isTempUrl = false;

        // 1. Get URL
        if (file.isSystem && file.localHandle) {
            try {
                const systemFile = await file.localHandle.getFile();
                fileUrl = URL.createObjectURL(systemFile);
                isTempUrl = true;
            } catch (err) {
                console.error("Error opening system file:", err);
                alert("Could not open system file.");
                return;
            }
        } else {
            // For Cloud Files
            fileUrl = api.storage.downloadUrl(file.name);
        }

        // 2. Determine App to Open
        if (file.name.toLowerCase().endsWith('.exe')) {
            if (isTempUrl) URL.revokeObjectURL(fileUrl); // Clean up if it was a system exe (though we probably won't run system exes this way)

            if (file.name === 'ChromeSetup.exe') {
                runInstaller(file.name, 'Google Chrome', 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg');
            } else if (file.name === 'MicrosoftEdgeSetup.exe') {
                runInstaller(file.name, 'Microsoft Edge', 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg');
            } else if (file.name === 'WhatsAppSetup.exe') {
                runInstaller(file.name, 'WhatsApp', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg');
            } else {
                alert(`Cannot run ${file.name} in this environment.`);
            }
            return;
        }

        if (isImageFile(file.name)) {
            if (onOpenApp) onOpenApp('image-viewer', file.name, { fileUrl, fileName: file.name });
        } else if (isVideoFile(file.name)) {
            if (onOpenApp) onOpenApp('video-player', file.name, { fileUrl, fileName: file.name });
        } else if (isPdfFile(file.name)) {
            if (onOpenApp) onOpenApp('pdf-viewer', file.name, { fileUrl, fileName: file.name });
        } else if (isMusicFile(file.name)) {
            // For music, we might want to just play it in the music app or a simple player?
            // The Music App is currently a full player with playlist. 
            // Ideally we'd pass this track to it. For now, let's just open standard player if available.
            // Or maybe use Video Player for audio too? 
            // Let's us Video Player for now as it handles audio elements too usually, or duplicate.
            if (onOpenApp) onOpenApp('video-player', file.name, { fileUrl, fileName: file.name });
        } else {
            // Default: New Tab
            window.open(fileUrl, '_blank');
        }

        // Cleanup Note: 
        // If we opened an app with a Blob URL (isTempUrl), we CANNOT revoke it immediately 
        // because the app needs to load it. We have to rely on garbage collection or browser cleanup 
        // when the tab/window closes? Ideally we track these URLs. 
        // Since this is a single page app, memory might grow if we open TONS of system files.
        // But for typical use it's fine.
    };

    const runInstaller = (filename, appName, appIcon) => {
        setInstalling(true);
        setInstallProgress(0);
        setInstallingAppName(appName);
        setInstallingAppIcon(appIcon);

        // Simulate installation
        const interval = setInterval(() => {
            setInstallProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setInstalling(false);
                        alert(`${appName} has been successfully installed on EDDYCORE!`);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
        installIntervalRef.current = interval;
    };

    return (
        <div className="h-full flex flex-col text-white relative">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-white/10">
                <label className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded cursor-pointer text-sm transition-colors">
                    Upload
                    <input type="file" className="hidden" onChange={handleUpload} />
                </label>
                <button
                    onClick={handleOpenSystemFiles}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded cursor-pointer text-sm transition-colors flex items-center gap-2"
                >
                    📂 Open System Files
                </button>
                <button onClick={loadFiles} className="p-1 hover:bg-white/10 rounded">
                    🔄
                </button>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto p-2">
                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Loading...</div>
                ) : files.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">No files found</div>
                ) : (
                    <div className="grid grid-cols-1 gap-1">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="flex items-center justify-between p-2 hover:bg-white/5 rounded group cursor-pointer"
                                onClick={() => handleFileClick(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {file.isSystem ? '💻 ' : ''}
                                        {isImageFile(file.name) ? '🖼️' : isVideoFile(file.name) ? '🎬' : file.name.endsWith('.exe') ? '📦' : '📄'}
                                    </span>
                                    <div>
                                        <div className="font-medium">{file.name}</div>
                                        <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={api.storage.downloadUrl(file.name)}
                                        download
                                        className="p-1 hover:bg-white/10 rounded text-blue-400"
                                        title="Download"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        ⬇️
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(file.name);
                                        }}
                                        className="p-1 hover:bg-white/10 rounded text-red-400"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Installer Simulation Modal */}
            {installing && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#202124] p-6 rounded-lg shadow-2xl w-96 border border-[#3c4043]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
                                <img src={installingAppIcon} alt={installingAppName} className="w-full h-full" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Installing {installingAppName}</h3>
                                <p className="text-sm text-[#9aa0a6]">Verifying...</p>
                            </div>
                        </div>

                        <div className="w-full h-1 bg-[#3c4043] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#8ab4f8] transition-all duration-300 ease-out"
                                style={{ width: `${installProgress}%` }}
                            />
                        </div>
                        <div className="text-right mt-2 text-xs text-[#9aa0a6]">{installProgress}%</div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-slate-800 border border-white/20 rounded-lg shadow-xl py-1 z-50"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isImageFile(contextMenu.file.name) && (
                        <button
                            onClick={() => handleSetWallpaper(contextMenu.file.name)}
                            className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2"
                        >
                            🖼️ Set as Wallpaper
                        </button>
                    )}
                    {contextMenu.file.name.endsWith('.exe') && (
                        <button
                            onClick={() => {
                                const file = contextMenu.file;
                                if (file.name === 'ChromeSetup.exe') {
                                    runInstaller(file.name, 'Google Chrome', 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg');
                                } else if (file.name === 'MicrosoftEdgeSetup.exe') {
                                    runInstaller(file.name, 'Microsoft Edge', 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg');
                                } else if (file.name === 'WhatsAppSetup.exe') {
                                    runInstaller(file.name, 'WhatsApp', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg');
                                } else {
                                    alert(`Cannot run ${file.name} in this environment.`);
                                }
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2 text-green-400"
                        >
                            🚀 Run Installer
                        </button>
                    )}
                    {contextMenu.file.isSystem && (
                        <div className="px-4 py-2 text-xs text-gray-400 italic border-t border-white/10">
                            Local System File
                        </div>
                    )}
                    {!contextMenu.file.isSystem && (
                        <a
                            href={api.storage.downloadUrl(contextMenu.file.name)}
                            download
                            className="block w-full px-4 py-2 text-left hover:bg-white/10"
                        >
                            ⬇️ Download
                        </a>
                    )}
                    {!contextMenu.file.isSystem && (
                        <button
                            onClick={() => {
                                handleDelete(contextMenu.file.name);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-white/10 text-red-400"
                        >
                            🗑️ Delete
                        </button>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default FileExplorer;
