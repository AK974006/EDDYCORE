import React, { useState, useEffect } from 'react';
import { api } from '../api';

const CloudFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.storage.list();
            setFiles(data);
        } catch (err) {
            console.error('Failed to load files:', err);
            setError('Failed to load cloud files');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            await api.storage.upload(file);
            await loadFiles(); // Refresh list
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!confirm(`Delete ${filename}?`)) return;

        try {
            await api.storage.delete(filename);
            await loadFiles(); // Refresh list
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Delete failed: ' + err.message);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    ☁️ Cloud Storage
                </h1>
                <p className="text-blue-100 mt-2">Your files synced across devices</p>
            </div>

            {/* Upload Section */}
            <div className="p-4 bg-gray-800/50 border-b border-gray-700">
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors">
                    <span className="text-xl">📤</span>
                    <span className="font-semibold">Upload File</span>
                    <input
                        type="file"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                {uploading && (
                    <span className="ml-4 text-blue-400 animate-pulse">Uploading...</span>
                )}
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4 animate-bounce">☁️</div>
                            <p className="text-gray-400">Loading files...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-red-400">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p>{error}</p>
                            <button
                                onClick={loadFiles}
                                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                            <div className="text-6xl mb-4">📁</div>
                            <p>No files yet</p>
                            <p className="text-sm mt-2">Upload your first file to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {/* File Icon */}
                                <div className="text-center mb-3">
                                    {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <div className="w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={api.storage.downloadUrl(file.name)}
                                                alt={file.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-6xl">📄</div>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-white truncate" title={file.name}>
                                        {file.name}
                                    </h3>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <p>📦 {formatSize(file.size)}</p>
                                        <p>🕒 {formatDate(file.updated_at || file.created_at)}</p>
                                        {file.source && (
                                            <p className="flex items-center gap-1">
                                                {file.source === 'cloud' ? '☁️ Cloud' : '💾 Local'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <a
                                        href={api.storage.downloadUrl(file.name)}
                                        download
                                        className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
                                    >
                                        📥 Download
                                    </a>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            {!loading && !error && files.length > 0 && (
                <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
                        <span>
                            Total: {formatSize(files.reduce((sum, f) => sum + (f.size || 0), 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudFiles;
