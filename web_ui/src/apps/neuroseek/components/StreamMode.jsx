import React, { useState } from 'react';
import YouTubeApp from './apps/YouTubeApp';
import ChromeApp from './apps/ChromeApp';
import { Youtube, Film, MonitorPlay, Globe } from 'lucide-react';

// Real YouTube Video IDs
const YOUTUBE_VIDEOS = [
    { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to relax/study to" },
    { id: "SqcY0GlETPk", title: "React Tutorial for Beginners" },
    { id: "0pThnRneDjw", title: "The Future of AI" },
    { id: "M7lc1UVf-VE", title: "YouTube Developers" }
];

const StreamMode = () => {
    const [activePlatform, setActivePlatform] = useState('youtube'); // 'youtube' | 'netmirror'

    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex' }}>

            {/* Sidebar / Platform Selector */}
            <div className="glass-panel" style={{
                width: '80px',
                margin: '1rem 0 1rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem 0',
                gap: '2rem',
                borderRadius: '16px'
            }}>
                <button
                    onClick={() => setActivePlatform('youtube')}
                    title="YouTube Stream"
                    style={{
                        background: activePlatform === 'youtube' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                        border: activePlatform === 'youtube' ? '1px solid #ff0000' : 'none',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    <Youtube size={24} color={activePlatform === 'youtube' ? '#ff0000' : 'var(--text-muted)'} />
                </button>

                <button
                    onClick={() => setActivePlatform('netmirror')}
                    title="NetMirror Movies"
                    style={{
                        background: activePlatform === 'netmirror' ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                        border: activePlatform === 'netmirror' ? '1px solid #E50914' : 'none',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    <Film size={24} color={activePlatform === 'netmirror' ? '#E50914' : 'var(--text-muted)'} />
                </button>
            </div>

            {/* Main Content Feed */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="neon-text" style={{
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textTransform: 'uppercase',
                        margin: 0
                    }}>
                        {activePlatform === 'youtube' ? <MonitorPlay /> : <Film />}
                        {activePlatform.toUpperCase()} LIVE
                    </h2>
                </div>

                {/* YOUTUBE LAYOUT */}
                {activePlatform === 'youtube' && (
                    <div style={{ height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <YouTubeApp />
                    </div>
                )}

                {/* NETMIRROR LAYOUT (Chrome Engine) */}
                {activePlatform === 'netmirror' && (
                    <div style={{ height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <ChromeApp initialUrl="https://net20.cc/home" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreamMode;
