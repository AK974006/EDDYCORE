const API_BASE = `http://${window.location.hostname}:8000/api`;

export const api = {
    storage: {
        list: async () => {
            const res = await fetch(`${API_BASE}/storage/files`);
            return res.json();
        },
        upload: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/storage/upload`, {
                method: 'POST',
                body: formData,
            });
            return res.json();
        },
        delete: async (filename) => {
            const res = await fetch(`${API_BASE}/storage/files/${filename}`, {
                method: 'DELETE',
            });
            return res.json();
        },
        downloadUrl: (filename) => `${API_BASE}/storage/download/${filename}`,
    },
    eddie: {
        chat: async ({ message, history }) => {
            console.log('[API] eddie.chat called');
            console.log('[API] window.electron exists:', !!window.electron);
            console.log('[API] message:', message);
            console.log('[API] history length:', history ? history.length : 0);

            try {
                if (window.electron) {
                    // Use Electron IPC if available
                    console.log('[API] Using Electron IPC');
                    const response = await window.electron.invoke('chat', { text: message, history });
                    console.log('[API] IPC Response:', response);
                    return { response: response.content };
                } else {
                    // Fallback to REST API
                    console.log('[API] Using REST API fallback');
                    const res = await fetch(`${API_BASE}/eddie/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, history }),
                    });

                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    }

                    return res.json();
                }
            } catch (error) {
                console.error('[API] Chat error:', error);
                console.error('[API] Error stack:', error.stack);
                throw error;
            }
        },
        transcribe: async (blob) => {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.wav');
            try {
                const res = await fetch(`${API_BASE}/eddie/transcribe`, {
                    method: 'POST',
                    body: formData,
                });
                return await res.json();
            } catch (error) {
                console.error('[API] Transcribe error:', error);
                throw error;
            }
        },
    },
    settings: {
        getWallpaper: async () => {
            const res = await fetch(`${API_BASE}/settings/wallpaper`);
            return res.json();
        },
        setWallpaper: async (wallpaper) => {
            const res = await fetch(`${API_BASE}/settings/wallpaper`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallpaper }),
            });
            return res.json();
        },
        saveAll: async (payload) => {
            const res = await fetch(`${API_BASE}/settings/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            return res.json();
        },
        getAll: async () => {
            const res = await fetch(`${API_BASE}/settings/all`);
            return res.json();
        },
    },
};
