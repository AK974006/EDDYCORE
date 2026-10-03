import React, { useState, useEffect } from 'react';
import { Search, Home, Flame, Clock, Play, ThumbsUp, MoreVertical, Menu, Bell, Mic, Grid, Key, Settings } from 'lucide-react';

const YouTubeApp = () => {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [apiKey, setApiKey] = useState(localStorage.getItem('yt_api_key') || 'AIzaSyAIfUqiGGkSwnWickqlKv5KhwtCmuXr0JU');
    const [showKeyInput, setShowKeyInput] = useState(false);

    // Google API Endpoints
    const BASE_URL = 'https://www.googleapis.com/youtube/v3';

    useEffect(() => {
        if (apiKey) {
            fetchVideos('trending');
        }
    }, [apiKey]);

    const saveApiKey = (key) => {
        localStorage.setItem('yt_api_key', key);
        setApiKey(key);
        setShowKeyInput(false);
    };

    const fetchVideos = async (type = 'trending', query = '') => {
        if (!apiKey) return;
        setLoading(true);
        try {
            let url = '';

            if (type === 'trending') {
                // Fetch Popular Videos (includes stats)
                url = `${BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=24&key=${apiKey}`;
            } else if (type === 'search') {
                // 1. Search for video IDs
                url = `${BASE_URL}/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
                alert(`YouTube API Error: ${data.error.message}`);
                return;
            }

            let formattedVideos = [];

            if (type === 'trending') {
                formattedVideos = data.items.map(item => ({
                    id: item.id,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    views: formatViews(item.statistics.viewCount),
                    ago: formatDate(item.snippet.publishedAt),
                    thumbnail: item.snippet.thumbnails.medium.url,
                    avatar: item.snippet.channelTitle[0],
                    description: item.snippet.description
                }));
            } else {
                // For search results, we often need a second call to get stats/avatars, 
                // but for speed we'll use the snippet data available.
                formattedVideos = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    views: 'Watch', // Search endpoint doesn't return viewCount
                    ago: formatDate(item.snippet.publishedAt),
                    thumbnail: item.snippet.thumbnails.medium.url,
                    avatar: item.snippet.channelTitle[0],
                    description: item.snippet.description
                }));
            }

            setVideos(formattedVideos);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatViews = (count) => {
        if (!count) return '0';
        if (count > 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count > 1000) return (count / 1000).toFixed(1) + 'K';
        return count;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleSearch = (e) => {
        if ((e.type === 'keydown' && e.key === 'Enter') || e.type === 'click') {
            if (!searchTerm.trim()) return;
            setCurrentVideo(null);
            fetchVideos('search', searchTerm);
            setActiveCategory('Search');
        }
    };

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        setSearchTerm('');
        setCurrentVideo(null);
        if (cat === 'All' || cat === 'Trending') {
            fetchVideos('trending');
        } else {
            fetchVideos('search', cat);
        }
    };

    if (showKeyInput) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', background: '#0f0f0f' }}>
                <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '16px', border: '1px solid #333', textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '1rem', background: 'red', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Play fill="white" size={24} />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>Enter YouTube API Key</h2>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        To access the full, real-time YouTube database, please enter your Google Data API Key (v3).
                    </p>
                    <input
                        type="password"
                        placeholder="Paste API Key here..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#000', color: 'white', marginBottom: '1rem' }}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(e.target.value); }}
                    />
                    <button
                        onClick={(e) => saveApiKey(e.target.previousSibling.value)}
                        style={{ background: 'white', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                    >
                        Connect to YouTube
                    </button>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555' }}>
                        Key is stored locally in your browser.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f0f', color: 'white', fontFamily: 'Roboto, Arial, sans-serif' }}>

            {/* Navbar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', height: '56px', position: 'sticky', top: 0,
                background: '#0f0f0f', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Menu color="white" size={24} style={{ cursor: 'pointer' }} />
                    <div onClick={() => { fetchVideos('trending'); setCurrentVideo(null); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ background: '#ff0000', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play fill="white" size={14} />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>YouTube</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, maxWidth: '600px', marginLeft: '40px' }}>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flex: 1, borderRadius: '40px', border: '1px solid #303030', background: '#121212', overflow: 'hidden' }}>
                            <input
                                type="text"
                                placeholder="Search"
                                style={{
                                    flex: 1, height: '40px', padding: '0 16px', border: 'none',
                                    background: 'transparent', color: 'white', fontSize: '16px', outline: 'none'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            <button
                                onClick={handleSearch}
                                style={{
                                    width: '64px', background: '#222', border: 'none', borderLeft: '1px solid #303030',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                <Search color="#888" size={20} />
                            </button>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#181818', marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Mic size={20} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => setShowKeyInput(true)} title="Update API Key" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Settings size={24} color="#aaa" />
                    </button>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ab47bc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        U
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Mini Sidebar */}
                <div style={{ width: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', gap: '24px' }}>
                    <NavItem icon={<Home size={24} />} label="Home" active={!currentVideo} onClick={() => { fetchVideos('trending'); setCurrentVideo(null); }} />
                    <NavItem icon={<Flame size={24} />} label="Shorts" />
                    <NavItem icon={<Clock size={24} />} label="You" />
                </div>

                {/* Video Area */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#0f0f0f', padding: '24px' }}>

                    {/* Category Chips (Only on Home) */}
                    {!currentVideo && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {['All', 'Trending', 'Gaming', 'Music', 'Live', 'Technology', 'News'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: activeCategory === cat ? 'white' : '#272727',
                                        color: activeCategory === cat ? 'black' : 'white',
                                        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentVideo ? (
                        // Watch Page
                        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ width: '100%', aspectRatio: '16/9', background: 'black', borderRadius: '12px', overflow: 'hidden' }}>
                                    <iframe
                                        width="100%" height="100%"
                                        src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                                        title={currentVideo.title} frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '12px', marginBottom: '8px' }}>{currentVideo.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {currentVideo.avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{currentVideo.channel}</div>
                                            <div style={{ fontSize: '12px', color: '#aaa' }}>Subscription</div>
                                        </div>
                                        <button style={{ marginLeft: '24px', background: 'white', color: 'black', border: 'none', padding: '0 16px', height: '36px', borderRadius: '18px', fontWeight: '500', cursor: 'pointer' }}>Subscribe</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <ActionBtn icon={<ThumbsUp size={18} />} text="Like" />
                                        <ActionBtn icon={<MoreVertical size={18} />} />
                                    </div>
                                </div>
                            </div>

                            {/* Suggested Videos */}
                            <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {videos.filter(v => v.id !== currentVideo.id).map(video => (
                                    <div key={video.id} onClick={() => setCurrentVideo(video)} style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                                        <img src={video.thumbnail} style={{ width: '168px', borderRadius: '8px', aspectRatio: '16/9', objectFit: 'cover' }} alt="" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', lineHeight: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div>
                                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{video.channel}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Home Grid
                        <>
                            {loading ? (
                                <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>Connecting to YouTube API...</div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                    {videos.length > 0 ? videos.map(video => (
                                        <div key={video.id} onClick={() => setCurrentVideo(video)} style={{ cursor: 'pointer' }}>
                                            <div style={{ aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                                                <img src={video.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#333', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{video.avatar}</div>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '22px', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</div>
                                                    <div style={{ fontSize: '14px', color: '#aaa' }}>{video.channel}</div>
                                                    <div style={{ fontSize: '14px', color: '#aaa' }}>{video.views} • {video.ago}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', marginTop: '50px' }}>
                                            No videos found. Check your API Key or Quota.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: active ? 'white' : '#aaa' }}>
        {icon}
        <span style={{ fontSize: '10px' }}>{label}</span>
    </div>
);

const ActionBtn = ({ icon, text }) => (
    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', borderRadius: '18px', border: 'none', background: '#222', color: 'white', cursor: 'pointer' }}>
        {icon}
        {text && <span>{text}</span>}
    </button>
);

export default YouTubeApp;
