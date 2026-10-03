import React, { useState, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCw, Home, Star, MoreVertical } from 'lucide-react';

const Browser = () => {
    const [url, setUrl] = useState('https://www.google.com/webhp?igu=1');
    const [inputUrl, setInputUrl] = useState('https://www.google.com/webhp?igu=1');
    const [history, setHistory] = useState(['https://www.google.com/webhp?igu=1']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const webviewRef = useRef(null);

    // Helper to check for Electron
    const useIsElectron = () => {
        return navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
    };
    const isElectron = useIsElectron();

    // Attach listeners to webview
    React.useEffect(() => {
        if (!isElectron) return;
        const node = webviewRef.current;
        if (!node) return;

        const onStartLoad = () => setIsLoading(true);
        const onStopLoad = () => setIsLoading(false);
        const onNavigate = (e) => setInputUrl(e.url);

        // We need to wait for the webview to be ready sometimes, or just attach.
        // In react, the ref might be set after first render.
        // We can use a callback ref or check regularly, but typically ref + useEffect works if dependencies are right.
        // However, standard DOM addEventListener works on the custom element.

        // Note: 'did-start-loading' etc are Electron-specific events.
        // We wrap in try-catch in case element is not upgraded yet.
        try {
            node.addEventListener('did-start-loading', onStartLoad);
            node.addEventListener('did-stop-loading', onStopLoad);
            node.addEventListener('did-navigate', onNavigate);
            node.addEventListener('did-navigate-in-page', onNavigate);
        } catch (e) {
            console.error("Failed to attach webview listeners", e);
        }

        return () => {
            try {
                node.removeEventListener('did-start-loading', onStartLoad);
                node.removeEventListener('did-stop-loading', onStopLoad);
                node.removeEventListener('did-navigate', onNavigate);
                node.removeEventListener('did-navigate-in-page', onNavigate);
            } catch (e) { /* ignore */ }
        };
    }, [isElectron]);

    const handleNavigate = (e) => {
        e.preventDefault();
        let targetUrl = inputUrl;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
        }

        // Prefer declarative navigation via src prop update (using navigateTo)
        // This avoids issues where loadURL is not yet available on the element
        navigateTo(targetUrl);
    };

    const navigateTo = (newUrl) => {
        setIsLoading(true);
        setUrl(newUrl);
        setInputUrl(newUrl);

        // Update history (only for iframe mode, webview handles its own internal history)
        if (!isElectron) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newUrl);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    const handleBack = () => {
        if (isElectron && webviewRef.current && typeof webviewRef.current.goBack === 'function') {
            webviewRef.current.goBack();
        } else if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const newUrl = history[newIndex];
            setUrl(newUrl);
            setInputUrl(newUrl);
        }
    };

    const handleForward = () => {
        if (isElectron && webviewRef.current && typeof webviewRef.current.goForward === 'function') {
            webviewRef.current.goForward();
        } else if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const newUrl = history[newIndex];
            setUrl(newUrl);
            setInputUrl(newUrl);
        }
    };

    const handleRefresh = () => {
        if (isElectron && webviewRef.current && typeof webviewRef.current.reload === 'function') {
            webviewRef.current.reload();
        } else {
            setIsLoading(true);
            const currentUrl = url;
            setUrl('');
            setTimeout(() => setUrl(currentUrl), 10);
        }
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col bg-white text-black">
            {/* Chrome-like Top Bar */}
            <div className="flex flex-col border-b border-gray-300">
                {/* Tabs Area (Visual only for now) */}
                <div className="flex items-end px-2 pt-2 bg-[#dee1e6] gap-1">
                    <div className="bg-white rounded-t-lg px-3 py-2 text-xs flex items-center gap-2 max-w-[200px] shadow-sm">
                        <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                        <span className="truncate">New Tab</span>
                        <button className="ml-auto hover:bg-gray-200 rounded-full p-0.5">×</button>
                    </div>
                    <button className="p-1 hover:bg-gray-300 rounded-full mb-1">
                        <span className="text-lg">+</span>
                    </button>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center gap-2 p-2 bg-white">
                    <div className="flex gap-1">
                        <button
                            onClick={handleBack}
                            disabled={historyIndex === 0}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={handleForward}
                            disabled={historyIndex === history.length - 1}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30"
                        >
                            <ArrowRight size={16} />
                        </button>
                        <button onClick={handleRefresh} className="p-1.5 hover:bg-gray-100 rounded-full">
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <button className="p-1.5 hover:bg-gray-100 rounded-full">
                        <Home size={16} />
                    </button>

                    {/* Address Bar */}
                    <form onSubmit={handleNavigate} className="flex-1">
                        <div className="flex items-center bg-[#f1f3f4] rounded-full px-3 py-1.5 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(26,115,232,1)] border border-transparent">
                            <div className="text-gray-500 mr-2">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm"
                                placeholder="Search Google or type a URL"
                            />
                            <button type="button" className="text-gray-500 hover:bg-gray-200 rounded-full p-1 ml-1">
                                <Star size={14} />
                            </button>
                        </div>
                    </form>

                    <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-full">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 relative bg-white overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 transition-opacity duration-300">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {isElectron ? (
                    <webview
                        ref={webviewRef}
                        src={url}
                        className="w-full h-full border-none"
                        allowpopups="true"
                        partition="persist:browser"
                        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                    />
                ) : (
                    <iframe
                        src={url}
                        className="w-full h-full border-none"
                        title="Browser Content"
                        onLoad={handleIframeLoad}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                )}
            </div>

            {/* Disclaimer Footer */}
            <div className="bg-gray-100 text-gray-500 text-[10px] p-1 text-center border-t">
                Note: Many websites block being embedded in iframes due to security policies (X-Frame-Options).
            </div>
        </div>
    );
};

export default Browser;
