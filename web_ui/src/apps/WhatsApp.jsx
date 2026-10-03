import React, { useState } from 'react';
import { MessageCircle, ExternalLink, Shield } from 'lucide-react';

const WhatsApp = () => {
    // Force embed in webview for "in-OS" experience
    // Switching to latest Chrome User Agent to bypass "Update Chrome" error.
    const [key, setKey] = React.useState(0); // Used to force reload
    const webviewRef = React.useRef(null);
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    const handleReload = () => {
        setKey(prev => prev + 1);
    };

    const handleOpenExternal = () => {
        window.open("https://web.whatsapp.com", "_blank");
    };

    return (
        <div className="h-full w-full bg-[#111b21] relative flex flex-col">
            {/* Control Bar */}
            <div className="h-10 bg-[#202c33] flex items-center px-4 justify-between shrink-0 border-b border-[#2a3942]">
                <div className="flex items-center gap-2 text-[#aebac1]">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReload}
                        className="p-1.5 hover:bg-[#374248] rounded text-[#aebac1] hover:text-white transition-colors"
                        title="Reload"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                    </button>
                    <button
                        onClick={handleOpenExternal}
                        className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] text-xs font-bold rounded-full transition-colors flex items-center gap-1"
                    >
                        <span>Open in Chrome</span>
                        <ExternalLink size={12} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-[#111b21]">
                <webview
                    key={key}
                    ref={webviewRef}
                    src="https://web.whatsapp.com"
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                    useragent={userAgent}
                    allowpopups="true"
                    partition="persist:whatsapp"
                />
            </div>
        </div>
    );
};

export default WhatsApp;
