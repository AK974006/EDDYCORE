import React, { useState } from 'react';
import { Search, Home, Menu, Bell, User, Play, ArrowLeft } from 'lucide-react';

const YouTube = () => {
    const [view, setView] = useState('home'); // 'home', 'player'
    const [currentVideo, setCurrentVideo] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data for Home Feed
    const recommendedVideos = [
        { id: 'LXb3EKWsInQ', title: 'COSTA RICA IN 4K 60fps HDR (ULTRA HD)', channel: 'Jacob + Katie Schwarz', views: '105M views' },
        { id: 'ysz5S6P_ks0', title: 'Aloha! - A Hawaiian Relaxation Video', channel: 'Scenic Relaxation', views: '2.3M views' },
        { id: '7PIji8OubXU', title: 'Best of Lo-Fi Hip Hop 2024', channel: 'Lofi Girl', views: '50K watching' },
        { id: 'tQ0yjYUFKAE', title: 'Top Gear - The best of the specials', channel: 'Top Gear', views: '12M views' },
        { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', views: 'Live' },
        { id: 'Bey4XXJAqS8', title: 'Beautiful Nature - 4K Video Ultra HD', channel: 'Nature Relaxation', views: '8.1M views' },
        { id: 'P7d1H83IcjE', title: 'Relaxing Jazz Music - Background Music', channel: 'Cafe Music BGM', views: '15M views' },
        { id: 'K4TOrB7at0Y', title: 'Deep Focus Music To Improve Concentration', channel: 'Quiet Quest', views: '45M views' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setCurrentVideo({ type: 'search', query: searchQuery });
            setView('player');
        }
    };

    const playVideo = (video) => {
        setCurrentVideo({ type: 'video', id: video.id, title: video.title });
        setView('player');
    };

    const goHome = () => {
        setView('home');
        setSearchQuery('');
    };

    return (
        <div className="h-full flex flex-col bg-[#0f0f0f] text-white overflow-hidden">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-[#272727] shrink-0">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-[#272727] rounded-full" onClick={goHome}>
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={goHome}>
                        <div className="w-8 h-5 bg-red-600 rounded-lg flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                        </div>
                        <span className="font-bold text-lg tracking-tighter">YouTube</span>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-xl flex items-center ml-10">
                    <div className="flex flex-1 items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 focus-within:border-blue-500 ml-10">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400"
                        />
                    </div>
                    <button type="submit" className="bg-[#222222] border border-l-0 border-[#303030] px-5 py-2 rounded-r-full hover:bg-[#303030]">
                        <Search size={20} className="text-gray-400" />
                    </button>
                </form>

                <div className="flex items-center gap-3 ml-4">
                    <button className="p-2 hover:bg-[#272727] rounded-full">
                        <Bell size={20} />
                    </button>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                        U
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-20 hidden md:flex flex-col items-center py-4 gap-6 text-[10px] text-gray-400 shrink-0 overflow-y-auto">
                    <div className={`flex flex-col items-center gap-1 hover:bg-[#272727] w-16 py-2 rounded-lg cursor-pointer ${view === 'home' ? 'text-white' : ''}`} onClick={goHome}>
                        <Home size={24} />
                        <span>Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 hover:bg-[#272727] w-16 py-2 rounded-lg cursor-pointer">
                        <div className="w-6 h-6 border-2 border-gray-400 rounded-lg flex items-center justify-center text-[10px] font-bold">S</div>
                        <span>Shorts</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-black relative overflow-y-auto">
                    {view === 'home' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Recommended</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {recommendedVideos.map((video) => (
                                    <div key={video.id} className="group cursor-pointer" onClick={() => playVideo(video)}>
                                        <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden mb-2 relative">
                                            <img
                                                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <Play fill="white" size={32} />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-700 shrink-0"></div>
                                            <div>
                                                <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{video.title}</h3>
                                                <p className="text-xs text-gray-400">{video.channel}</p>
                                                <p className="text-xs text-gray-400">{video.views} • 1 day ago</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'player' && currentVideo && (
                        <div className="w-full h-full flex flex-col">
                            <div className="bg-[#181818] px-4 py-2 flex items-center gap-2">
                                <button onClick={goHome} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
                                    <ArrowLeft size={16} /> Back to Home
                                </button>
                            </div>
                            <div className="flex-1">
                                <iframe
                                    src={
                                        currentVideo.type === 'search'
                                            ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(currentVideo.query)}&autoplay=1`
                                            : `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`
                                    }
                                    className="w-full h-full border-none"
                                    title="YouTube Video Player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YouTube;
