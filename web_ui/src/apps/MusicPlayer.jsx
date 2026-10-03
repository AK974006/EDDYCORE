import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';

const TRACKS = [
    {
        id: 1,
        title: "Ambient Chill",
        artist: "EDDYCORE",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Example public domain or creative commons
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80"
    },
    {
        id: 2,
        title: "Synthwave Vibes",
        artist: "Neon Runner",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80"
    },
    {
        id: 3,
        title: "Deep Focus",
        artist: "Neural Net",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=300&q=80"
    }
];

const MusicPlayer = () => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);

    const audioRef = useRef(new Audio(TRACKS[0].url));

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            handleNext();
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        // Handle track changes
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = TRACKS[currentTrackIndex].url;
        audio.volume = volume;
        if (isPlaying) {
            audio.play().catch(e => console.error("Playback failed", e));
        }
    }, [currentTrackIndex]);

    useEffect(() => {
        // Handle Play/Pause
        if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Cleanup on unmount
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                // We do NOT set audioRef.current = null here because React 18 strict mode
                // will unmount and remount, and if we nullify it, the next effect run will crash.
                // The Garbage Collector will handle the Audio object when the component instance is destroyed.
            }
        };
    }, []);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const currentTrack = TRACKS[currentTrackIndex];

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black text-white p-6">
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <img
                        src={currentTrack.cover}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1">{currentTrack.title}</h2>
                    <p className="text-gray-400">{currentTrack.artist}</p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-1/4">
                        <Volume2 size={16} className="text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={handlePrev} className="text-gray-300 hover:text-white transition-colors">
                            <SkipBack size={24} fill="currentColor" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-white/20"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" ml={1} />}
                        </button>
                        <button onClick={handleNext} className="text-gray-300 hover:text-white transition-colors">
                            <SkipForward size={24} fill="currentColor" />
                        </button>
                    </div>

                    <div className="w-1/4 flex justify-end">
                        <button className="text-gray-400 hover:text-white">
                            <Music size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;
