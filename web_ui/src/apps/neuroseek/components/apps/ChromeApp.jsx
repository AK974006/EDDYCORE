import React, { useState } from 'react';
import { Search, Globe, ChevronLeft, ChevronRight, RotateCcw, MoreHorizontal, ShieldCheck, X } from 'lucide-react';

const ChromeApp = ({ initialUrl = 'https://www.google.com' }) => {
    const [url, setUrl] = useState(initialUrl);
    const [inputValue, setInputValue] = useState(initialUrl);
    const [isElectron] = useState(typeof window !== 'undefined' && window.process && window.process.type);

    const handleNavigate = (e) => {
        e.preventDefault();
        let target = inputValue.trim();
        if (!target.startsWith('http')) {
            target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
        }
        setUrl(target);
        setInputValue(target);
    };

    return (
        <div style={{
            height: '100%',
            background: '#202124',
            color: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* Tab Bar */}
            <div style={{ background: '#171717', padding: '8px 8px 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                    background: '#202124',
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '200px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: 'none'
                }}>
                    <Globe size={14} color="#4285F4" />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Google Search</span>
                    <X size={12} style={{ cursor: 'pointer', opacity: 0.6 }} />
                </div>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <span style={{ fontSize: '20px' }}>+</span>
                </div>
            </div>

            {/* Address Bar Area */}
            <div style={{
                background: '#202124',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '12px', opacity: 0.6 }}>
                    <ChevronLeft size={18} />
                    <ChevronRight size={18} />
                    <RotateCcw size={18} />
                </div>

                <form onSubmit={handleNavigate} style={{
                    flex: 1,
                    background: '#303134',
                    borderRadius: '20px',
                    padding: '4px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                }}>
                    <ShieldCheck size={14} color="#46d369" />
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'white',
                            width: '100%',
                            padding: 0,
                            fontSize: '14px'
                        }}
                    />
                </form>

                <MoreHorizontal size={18} style={{ opacity: 0.6 }} />
            </div>

            {/* Web Content Area */}
            <div style={{
                flex: 1,
                background: '#fff',
                position: 'relative'
            }}>
                {isElectron ? (
                    <webview
                        src={url}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allowpopups="true"
                    />
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        color: '#000'
                    }}>
                        <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                            <h1 style={{ fontSize: '90px', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ color: '#4285F4' }}>G</span>
                                <span style={{ color: '#EA4335' }}>o</span>
                                <span style={{ color: '#FBBC05' }}>o</span>
                                <span style={{ color: '#4285F4' }}>g</span>
                                <span style={{ color: '#34A853' }}>l</span>
                                <span style={{ color: '#EA4335' }}>e</span>
                            </h1>

                            <form onSubmit={handleNavigate} style={{ position: 'relative' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#fff',
                                    border: '1px solid #dfe1e5',
                                    borderRadius: '24px',
                                    padding: '12px 20px',
                                    boxShadow: '0 1px 6px rgba(32,33,36,0.28)',
                                    transition: 'box-shadow 0.2s'
                                }}>
                                    <Search size={20} color="#9aa0a6" style={{ marginRight: '12px' }} />
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Search Google or type a URL"
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            flex: 1,
                                            fontSize: '16px',
                                            background: 'transparent',
                                            color: '#000',
                                            padding: 0
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #f8f9fa', background: '#f8f9fa', color: '#3c4043', cursor: 'pointer', fontSize: '14px' }}>Google Search</button>
                                    <button type="button" style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #f8f9fa', background: '#f8f9fa', color: '#3c4043', cursor: 'pointer', fontSize: '14px' }}>I'm Feeling Lucky</button>
                                </div>
                            </form>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#f2f2f2', borderTop: '1px solid #dadce0', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#70757a' }}>
                            <div style={{ display: 'flex', gap: '25px' }}>
                                <span>Advertising</span>
                                <span>Business</span>
                                <span>Webview only available in Electron</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChromeApp;
