import React, { useState, useEffect } from 'react';
import { api } from '../api';

const Gallery = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [viewMode, setViewMode] = useState('all'); // 'all', 'images', 'videos'

    const loadMedia = async () => {
        setLoading(true);
        try {
            const data = await api.storage.list();
            // Filter only images and videos
            const mediaFiles = data.filter(file => isMediaFile(file.name));
            setMedia(mediaFiles);
        } catch (err) {
            console.error("Failed to load media", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
    }, []);

    const isImageFile = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.jfif'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isVideoFile = (filename) => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
        return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isMediaFile = (filename) => {
        return isImageFile(filename) || isVideoFile(filename);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if it's a media file
        if (!isMediaFile(file.name)) {
            alert('Please upload only images or videos');
            return;
        }

        try {
            await api.storage.upload(file);
            loadMedia();
        } catch (err) {
            console.error("Upload failed", err);
            alert('Upload failed');
        }
    };

    const handleDelete = async (filename) => {
        if (!confirm(`Delete ${filename}?`)) return;
        try {
            await api.storage.delete(filename);
            loadMedia();
            setSelectedMedia(null);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredMedia = media.filter(file => {
        if (viewMode === 'images') return isImageFile(file.name);
        if (viewMode === 'videos') return isVideoFile(file.name);
        return true;
    });

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🖼️</span>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Gallery
                            </h1>
                            <p className="text-xs text-gray-400">
                                {filteredMedia.length} {viewMode === 'images' ? 'images' : viewMode === 'videos' ? 'videos' : 'items'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Filters */}
                        <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-3 py-1.5 rounded text-sm transition-all ${viewMode === 'all'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setViewMode('images')}
                                className={`px-3 py-1.5 rounded text-sm transition-all ${viewMode === 'images'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                📷 Images
                            </button>
                            <button
                                onClick={() => setViewMode('videos')}
                                className={`px-3 py-1.5 rounded text-sm transition-all ${viewMode === 'videos'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                🎬 Videos
                            </button>
                        </div>

                        <label className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all shadow-lg hover:shadow-purple-500/50">
                            📤 Upload
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleUpload}
                                accept="image/*,video/*"
                            />
                        </label>

                        <button
                            onClick={loadMedia}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            🔄
                        </button>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin text-6xl mb-4">⏳</div>
                            <div className="text-gray-400">Loading media...</div>
                        </div>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <div className="text-xl text-gray-400 mb-2">No media found</div>
                            <div className="text-sm text-gray-500">Upload some images or videos to get started</div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredMedia.map((file) => (
                            <div
                                key={file.name}
                                className="group relative aspect-square bg-black/30 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                                onClick={() => setSelectedMedia(file)}
                            >
                                {/* Media Preview */}
                                {isImageFile(file.name) ? (
                                    <img
                                        src={api.storage.downloadUrl(file.name)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={api.storage.downloadUrl(file.name)}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <span className="text-3xl">▶️</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <div className="text-sm font-medium truncate">{file.name}</div>
                                        <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                                    </div>
                                </div>

                                {/* Media Type Badge */}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                                    {isImageFile(file.name) ? '📷' : '🎬'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox/Preview Modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div
                        className="relative max-w-6xl max-h-full w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors text-4xl"
                        >
                            ✕
                        </button>

                        {/* Media Display */}
                        <div className="bg-black/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                            {isImageFile(selectedMedia.name) ? (
                                <img
                                    src={api.storage.downloadUrl(selectedMedia.name)}
                                    alt={selectedMedia.name}
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            ) : (
                                <video
                                    src={api.storage.downloadUrl(selectedMedia.name)}
                                    controls
                                    autoPlay
                                    className="w-full h-auto max-h-[80vh]"
                                />
                            )}

                            {/* Info Bar */}
                            <div className="bg-black/60 backdrop-blur-sm p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-lg">{selectedMedia.name}</div>
                                    <div className="text-sm text-gray-400">
                                        {formatFileSize(selectedMedia.size)} • {isImageFile(selectedMedia.name) ? 'Image' : 'Video'}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={api.storage.downloadUrl(selectedMedia.name)}
                                        download
                                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        ⬇️ Download
                                    </a>
                                    <button
                                        onClick={() => handleDelete(selectedMedia.name)}
                                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
