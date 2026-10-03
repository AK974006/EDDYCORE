import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Zap, Shield, AlertTriangle } from 'lucide-react';
import { queryNeuralNetwork } from '../services/neuralLink';

const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
        .replace(/#{1,6}\s?/g, '') // Remove headers
        .replace(/\*\*/g, '')      // Remove bold
        .replace(/^\s*\*\s/gm, '• ') // Replace list bullets
        .replace(/\*/g, '');       // Remove remaining italics/stars
};

const SearchMode = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [debugLog, setDebugLog] = useState('');

    // Load key from storage on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('neuroseek_api_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    const saveKey = (key) => {
        setApiKey(key);
        localStorage.setItem('neuroseek_api_key', key);
        setShowKeyInput(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        // URL Navigation Feature
        // If the user types a URL (e.g. "google.com", "https://example.com"), open it directly.
        let targetStart = query.trim();
        let isUrl = false;

        // 1. Explicit Protocol
        if (targetStart.startsWith('http://') || targetStart.startsWith('https://')) {
            isUrl = true;
        }
        // 2. Domain-like pattern (no spaces, has dot)
        else if (targetStart.includes('.') && !targetStart.includes(' ')) {
            targetStart = 'https://' + targetStart;
            isUrl = true;
        }

        if (isUrl) {
            try {
                // Validate generic URL structure
                new URL(targetStart);
                window.open(targetStart, '_blank');
                setQuery(''); // Clear bar after navigation
                return;
            } catch (e) {
                // Not a valid URL, proceed to AI search
                console.log("Not a valid URL, searching AI...");
            }
        }

        setIsSearching(true);
        setResults(null);
        setDebugLog('');

        try {
            if (!apiKey) {
                setShowKeyInput(true);
                throw new Error("Neural Link Key Missing.");
            }
            // Use the separated Neural Link Service
            const answer = await queryNeuralNetwork(query, apiKey);
            setResults({ content: answer });

        } catch (error) {
            setResults({ error: error.message });
            setDebugLog(error.stack || error.toString());
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="search-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            position: 'relative',
            zIndex: 1,
            padding: '2rem'
        }}>

            {/* Key Configuration Config */}
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
                <button
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="btn-icon"
                    title="Configure Neural Link (API Key)"
                >
                    <Shield size={18} color={apiKey ? 'var(--primary)' : 'var(--text-muted)'} />
                </button>
            </div>

            {showKeyInput && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '10px',
                    padding: '1rem',
                    zIndex: 100,
                    width: '300px',
                    border: '1px solid var(--secondary)',
                    background: '#0a0a12'
                }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        OPENROUTER API KEY
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.7rem' }}>GET KEY ↗</a>
                    </div>
                    <input
                        type="password"
                        placeholder="sk-or-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => saveKey(apiKey)} className="btn-primary" style={{ padding: '0.2rem 1rem', fontSize: '0.8rem' }}>Save Link</button>
                        <button onClick={() => setShowKeyInput(false)} className="btn-icon" style={{ fontSize: '0.8rem' }}>Close</button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="neon-text" style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-2px', marginBottom: '0.5rem' }}>
                    NEURO<span style={{ color: '#fff' }}>SEEK</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    Serial Intelligence Engine
                </p>
            </div>

            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '2px' }}>
                    <Zap size={14} /> NEURAL INDEX PROTOCOL
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', border: '1px solid var(--primary-glow)', boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)' }}>
                    <Search size={24} style={{ margin: '0 1rem', color: isSearching ? 'var(--secondary)' : 'var(--primary)' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Initialize neural query..."
                        style={{
                            border: 'none',
                            background: 'transparent',
                            flex: 1,
                            fontSize: '1.2rem',
                            padding: '0.5rem'
                        }}
                    />
                    <button type="submit" className="btn-icon">
                        <ArrowRight size={24} color="var(--primary)" />
                    </button>
                </div>
            </form>


            {/* Loading Indicator */}
            {isSearching && (
                <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{
                                width: '4px',
                                height: '24px',
                                background: 'var(--secondary)',
                                animation: `pulse 0.8s infinite ${i * 0.1}s`
                            }} />
                        ))}
                    </div>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', letterSpacing: '2px' }}>PROCESSING NEURAL PATHWAYS...</span>
                </div>
            )}

            {/* Results Display */}
            {results && !isSearching && (
                <div className="glass-panel" style={{
                    marginTop: '3rem',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '2rem',
                    animation: 'scanline 0.5s ease-out'
                }}>
                    {results.error ? (
                        <div style={{ color: '#ff4444', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <AlertTriangle size={24} />
                                <span style={{ fontWeight: 'bold' }}>ACCESS DENIED: NEURAL LINK KEY MISSING</span>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', borderRadius: '8px', marginTop: '0.5rem' }}>
                                To initialize the Neural Index, you must provide an OpenRouter API key.
                                <button
                                    onClick={() => setShowKeyInput(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #ff4444',
                                        color: '#ff4444',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        marginLeft: '10px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    CONFIGURE LINK NOW
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                color: 'var(--primary)',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                paddingBottom: '0.5rem'
                            }}>
                                <Zap size={16} /> <span>NEURAL RESPONSE</span>
                            </div>
                            <div style={{
                                lineHeight: '1.6',
                                color: '#e0e0e0',
                                whiteSpace: 'pre-wrap',
                                fontFamily: "'Inter', sans-serif"
                            }}>
                                {cleanMarkdown(results.content)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchMode;
