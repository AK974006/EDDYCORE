import React from 'react';

const VideoPlayerApp = ({ fileUrl, fileName }) => {
    return (
        <div className="h-full w-full bg-black flex flex-col items-center justify-center relative group">
            {fileUrl ? (
                <video
                    src={fileUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain w-full h-full"
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="text-gray-400">No video selected</div>
            )}
            {fileName && (
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {fileName}
                </div>
            )}
        </div>
    );
};

export default VideoPlayerApp;
