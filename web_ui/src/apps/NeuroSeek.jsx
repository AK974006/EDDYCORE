import React, { useState } from 'react';
import { Search, Code, LayoutGrid, Settings, Power, Tv, Globe } from 'lucide-react';
import SearchMode from './neuroseek/components/SearchMode';
import StreamMode from './neuroseek/components/StreamMode';
import './neuroseek/NeuroSeek.css';

const NeuroSeek = () => {
    const [activeMode, setActiveMode] = useState('search'); // 'search' | 'stream'

    return (
        <div className="neuroseek-app">
            <div className="scanline-overlay"></div>

            {/* Navigation / Header - Stripped of Drag Region */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="neon-border" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)'
                    }}>
                        <Power size={20} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>
                        NEURO<span style={{ color: 'var(--primary)' }}>SEEK</span>
                    </span>
                </div>

                {/* Persistent Global Search Bar */}
                <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const chromeQuery = e.target.chromeSearch.value;
                        if (chromeQuery) {
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(chromeQuery)}`, '_blank');
                            e.target.chromeSearch.value = '';
                        }
                    }} style={{ position: 'relative' }}>
                        <div className="glass-panel" style={{
                            padding: '0.4rem 1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '30px',
                            border: '1px solid rgba(66, 133, 244, 0.3)',
                            background: 'rgba(0,0,0,0.3)',
                            boxShadow: '0 0 15px rgba(66, 133, 244, 0.1)'
                        }}>
                            <Globe size={16} color="#4285F4" style={{ marginRight: '0.8rem' }} />
                            <input
                                name="chromeSearch"
                                type="text"
                                placeholder="PROCEED TO GLOBAL INDEX..."
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    flex: 1,
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    letterSpacing: '1px',
                                    fontWeight: '600'
                                }}
                            />
                            <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', marginLeft: '0.5rem', opacity: 0.7 }}>
                                <Search size={14} color="#4285F4" />
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '30px' }}>
                    <button
                        onClick={() => setActiveMode('search')}
                        style={{
                            background: activeMode === 'search' ? 'var(--primary)' : 'transparent',
                            color: activeMode === 'search' ? '#000' : 'var(--text-muted)',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Search size={16} /> Search
                    </button>

                    <button
                        onClick={() => setActiveMode('stream')}
                        style={{
                            background: activeMode === 'stream' ? 'var(--secondary)' : 'transparent',
                            color: activeMode === 'stream' ? '#fff' : 'var(--text-muted)',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Tv size={16} /> Stream
                    </button>

                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-icon"><Settings size={20} /></button>
                    <button className="btn-icon"><LayoutGrid size={20} /></button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
                {activeMode === 'search' && <SearchMode />}
                {activeMode === 'stream' && <StreamMode />}
            </main>

            {/* Floating Status Bar / Footer */}
            <footer style={{
                position: 'absolute', // Changed to absolute relative to App div
                bottom: 0,
                width: '100%',
                padding: '0.5rem 2rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.8)'
            }}>
                <span>SYSTEM: ONLINE</span>
                <span>NEUROSEEK v1.0.4 // SERIAL ENGINE ACTIVE</span>
            </footer>
        </div>
    );
}

export default NeuroSeek;
