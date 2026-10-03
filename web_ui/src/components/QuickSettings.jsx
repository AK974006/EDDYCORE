import React, { useState, useEffect } from 'react';
import {
    Wifi, Bluetooth, Monitor, Plane, Battery,
    WifiOff, BatteryCharging, Share2,
    Smartphone, Download, Tablet, Laptop,
    Radio, Settings, Sliders
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const QuickSettings = ({ isOpen, onClose, onOpenSettings, isMobile }) => {
    const { currentUser } = useUser();
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [isCharging, setIsCharging] = useState(false);

    // Toggles state
    const [toggles, setToggles] = useState({
        wifi: true,
        bluetooth: true,
        airplane: false,
        cast: false,
        hotspot: false,
        nearby: false
    });

    // Simulated nearby devices for sharing
    const [nearbyDevices, setNearbyDevices] = useState([]);

    useEffect(() => {
        // Battery API
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                setBatteryLevel(Math.floor(battery.level * 100));
                setIsCharging(battery.charging);

                battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
                battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
            });
        }
    }, []);

    useEffect(() => {
        if (toggles.nearby) {
            // Simulate scanning for generic sharing devices
            setTimeout(() => {
                setNearbyDevices([
                    { id: 1, name: "Akash's Phone", type: 'mobile' },
                    { id: 2, name: "Living Room TV", type: 'tv' }
                ]);
            }, 1000);
        } else {
            setNearbyDevices([]);
        }
    }, [toggles.nearby]);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>

            <div className={`absolute bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-slide-up-fade text-white 
                ${isMobile ? 'bottom-14 left-2 right-2 w-auto' : 'bottom-16 right-4 w-80'}`}>

                {/* Grid of Toggles */}
                <div className="grid grid-cols-3 gap-3 mb-6">

                    {/* Wifi */}
                    <button
                        onClick={() => handleToggle('wifi')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.wifi ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {toggles.wifi ? <Wifi size={24} /> : <WifiOff size={24} />}
                        <span className="text-xs font-medium mt-2">{toggles.wifi ? 'Tech_5G' : 'Wi-Fi'}</span>
                    </button>

                    {/* Bluetooth */}
                    <button
                        onClick={() => handleToggle('bluetooth')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.bluetooth ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        <Bluetooth size={24} />
                        <span className="text-xs font-medium mt-2">Bluetooth</span>
                    </button>

                    {/* Airplane Mode */}
                    <button
                        onClick={() => handleToggle('airplane')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.airplane ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        <Plane size={24} />
                        <span className="text-xs font-medium mt-2">Airplane</span>
                    </button>

                    {/* Cast */}
                    <button
                        onClick={() => handleToggle('cast')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.cast ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        <Monitor size={24} />
                        <span className="text-xs font-medium mt-2">Cast</span>
                    </button>

                    {/* Hotspot */}
                    <button
                        onClick={() => handleToggle('hotspot')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.hotspot ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        <Radio size={24} />
                        <span className="text-xs font-medium mt-2">Hotspot</span>
                    </button>

                    {/* Nearby Share */}
                    <button
                        onClick={() => handleToggle('nearby')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${toggles.nearby ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        <Share2 size={24} />
                        <span className="text-xs font-medium mt-2">Share</span>
                    </button>
                </div>

                {/* Sliders Area (Brightness / Volume) */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400"><Monitor size={18} /></span>
                        <input type="range" className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400"><Sliders size={18} /></span>
                        <input type="range" className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>

                {/* File Sharing / Nearby Drop Zone */}
                {toggles.nearby && (
                    <div className="mb-4 bg-white/5 rounded-xl p-3 border border-white/10 animate-fade-in">
                        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nearby Devices</div>
                        {nearbyDevices.length === 0 ? (
                            <div className="text-center py-4 text-xs text-gray-500 animate-pulse">Scanning...</div>
                        ) : (
                            <div className="space-y-2">
                                {nearbyDevices.map(dev => (
                                    <div key={dev.id} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group">
                                        <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-full">
                                            {dev.type === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{dev.name}</div>
                                            <div className="text-[10px] text-gray-400">Ready to receive</div>
                                        </div>
                                        <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                        {isCharging ? <BatteryCharging size={18} className="text-green-400" /> : <Battery size={18} className={batteryLevel < 20 ? "text-red-400" : "text-gray-300"} />}
                        <span className={batteryLevel < 20 ? "text-red-400" : "text-gray-300"}>{batteryLevel}%</span>
                    </div>

                    <button onClick={() => { onClose(); onOpenSettings && onOpenSettings(); }} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default QuickSettings;
