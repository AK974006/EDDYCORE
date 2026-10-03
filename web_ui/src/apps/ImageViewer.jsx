import React from 'react';

const ImageViewer = ({ fileUrl, fileName }) => {
    return (
        <div className="h-full w-full bg-black/90 flex flex-col items-center justify-center p-4">
            {fileUrl ? (
                <img
                    src={fileUrl}
                    alt={fileName || 'Image'}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                />
            ) : (
                <div className="text-gray-400">No image selected</div>
            )}
        </div>
    );
};

export default ImageViewer;
