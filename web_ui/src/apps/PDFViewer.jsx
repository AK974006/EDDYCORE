import React from 'react';

const PDFViewer = ({ fileUrl, fileName }) => {
    return (
        <div className="h-full w-full bg-slate-900 flex flex-col">
            {fileUrl ? (
                <iframe
                    src={fileUrl}
                    title={fileName || 'Document'}
                    className="flex-1 w-full h-full border-none bg-white"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    No document selected
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
