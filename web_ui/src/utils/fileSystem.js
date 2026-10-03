/**
 * Checks if the browser supports the File System Access API.
 * This API is used to access local system files directly.
 */
export const isFileSystemAccessSupported = () => {
    return 'showOpenFilePicker' in window;
};

/**
 * Request the user to select files from their local system.
 */
export const openLocalSystemFiles = async () => {
    if (!isFileSystemAccessSupported()) {
        alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.");
        return [];
    }

    try {
        const handles = await window.showOpenFilePicker({
            multiple: true,
            types: [
                {
                    description: 'All Files',
                    accept: {
                        '*/*': []
                    }
                }
            ]
        });

        const files = await Promise.all(handles.map(async (handle) => {
            const file = await handle.getFile();
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                localHandle: handle // Store handle for potential future read/write if needed
            };
        }));

        return files;
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error selecting system files:', err);
        }
        return [];
    }
};
