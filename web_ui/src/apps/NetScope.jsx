import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Activity, Globe, Shield, Radio, Server, Smartphone, Laptop, Tv, Search, RefreshCw, Zap } from 'lucide-react';

const NetScope = () => {
    const [scanning, setScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [traffic, setTraffic] = useState([]);
    const [globalIp, setGlobalIp] = useState('192.168.1.105');
    const [networkStrength, setNetworkStrength] = useState(85);
    const canvasRef = useRef(null);

    // Initial load
    useEffect(() => {
        startScan();
        const interval = setInterval(() => {
            // Update traffic data simulation
            setTraffic(prev => {
                const newValue = Math.floor(Math.random() * 100);
                const newData = [...prev, newValue];
                if (newData.length > 50) newData.shift();
                return newData;
            });
            // Update signal strength slightly
            setNetworkStrength(prev => Math.min(100, Math.max(50, prev + (Math.random() * 10 - 5))));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const startScan = () => {
        setScanning(true);
        setDevices([]); // Clear previous

        // Simulate finding devices over time
        let count = 0;
        const maxDevices = 5 + Math.floor(Math.random() * 5);

        const scanInterval = setInterval(() => {
            count++;
            if (count > maxDevices) {
                clearInterval(scanInterval);
                setScanning(false);
            } else {
                addRandomDevice();
            }
        }, 800);
    };

    const addRandomDevice = () => {
        const types = ['mobile', 'desktop', 'server', 'iot'];
        const names = ['iPhone 15 Pro', 'MacBook Air', 'Unknown Device', 'Smart TV', 'Gateway', 'Android_X', 'Neural_Node_01'];
        const type = types[Math.floor(Math.random() * types.length)];

        const newDevice = {
            id: Date.now(),
            ip: `192.168.1.${10 + Math.floor(Math.random() * 200)}`,
            mac: Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
            name: names[Math.floor(Math.random() * names.length)],
            type: type,
            latency: Math.floor(Math.random() * 100) + 'ms',
            status: Math.random() > 0.8 ? 'suspicious' : 'safe'
        };
        setDevices(prev => [...prev, newDevice]);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'mobile': return <Smartphone size={16} />;
            case 'desktop': return <Laptop size={16} />;
            case 'server': return <Server size={16} />;
            case 'iot': return <Tv size={16} />;
            default: return <Zap size={16} />;
        }
    };

    return (
        <div className="h-full bg-slate-900 text-cyan-400 font-mono flex flex-col overflow-hidden relative border-2 border-cyan-900/50 shadow-[0_0_50px_rgba(0,255,255,0.05)]">

            {/* Header */}
            <div className="h-12 border-b border-cyan-800/30 bg-cyan-950/20 flex items-center justify-between px-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Globe size={20} className="text-cyan-400 animate-pulse-slow" />
                        <div className="absolute inset-0 border border-cyan-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="font-bold tracking-widest text-lg">NET_SCOPE // V4.2</span>
                </div>
                <div className="flex gap-6 text-xs text-cyan-300/70">
                    <span className="flex items-center gap-2">
                        <Wifi size={14} className={networkStrength > 80 ? "text-green-400" : "text-yellow-400"} />
                        SIGNAL: {Math.floor(networkStrength)}%
                    </span>
                    <span className="flex items-center gap-2">
                        <Shield size={14} /> FIREWALL: ACTIVE
                    </span>
                    <span className="font-bold text-cyan-400">
                        IP: {globalIp}
                    </span>
                </div>
            </div>

            {/* Main Dashboard */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Device List */}
                <div className="w-80 border-r border-cyan-800/30 bg-slate-950/50 flex flex-col">
                    <div className="p-3 border-b border-cyan-800/30 flex justify-between items-center bg-cyan-900/10">
                        <span className="text-xs font-bold opacity-70">DETECTED DEVICES ({devices.length})</span>
                        <button
                            onClick={!scanning ? startScan : undefined}
                            className={`p-1 rounded hover:bg-cyan-900/50 transition-colors ${scanning ? 'animate-spin text-cyan-200' : 'text-cyan-500'}`}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {devices.map(device => (
                            <div key={device.id} className={`p-2 rounded border transition-all hover:bg-cyan-900/20 cursor-pointer
                                ${device.status === 'suspicious' ? 'border-red-500/50 bg-red-900/10' : 'border-cyan-900/30 bg-slate-900/50'}
                            `}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-cyan-100">
                                        {getTypeIcon(device.type)}
                                        {device.name}
                                    </div>
                                    {device.status === 'suspicious' && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                                </div>
                                <div className="text-[10px] text-cyan-500/70 font-mono space-y-0.5">
                                    <div className="flex justify-between"><span>IP:</span> <span className="text-cyan-300">{device.ip}</span></div>
                                    <div className="flex justify-between"><span>MAC:</span> <span>{device.mac}</span></div>
                                    <div className="flex justify-between"><span>LATENCY:</span> <span>{device.latency}</span></div>
                                </div>
                            </div>
                        ))}
                        {scanning && (
                            <div className="text-center py-4 text-xs text-cyan-500/50 animate-pulse">
                                Scanning frequencies...
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Visualization & Stats */}
                <div className="flex-1 flex flex-col p-4 gap-4 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30">

                    {/* Top Row: Graphs */}
                    <div className="h-1/3 flex gap-4">
                        {/* Traffic Graph */}
                        <div className="flex-1 border border-cyan-800/30 rounded bg-black/40 p-3 relative flex flex-col">
                            <div className="text-xs font-bold text-cyan-400/50 mb-2 flex items-center gap-2">
                                <Activity size={14} /> NETWORK_TRAFFIC_MONITOR
                            </div>
                            <div className="flex-1 flex items-end gap-1 overflow-hidden">
                                {traffic.map((val, i) => (
                                    <div key={i} className="flex-1 bg-cyan-500/50 hover:bg-cyan-400 transition-colors rounded-t-sm relative group" style={{ height: `${val}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                            {val} MB/s
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>
                        </div>

                        {/* Radar / Map Placeholder */}
                        <div className="w-1/3 border border-cyan-800/30 rounded bg-black/40 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
                            <div className="w-[150%] h-[150%] border border-cyan-500/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent to-cyan-500/10" style={{ transformOrigin: 'bottom right' }}></div>
                            </div>
                            <div className="w-48 h-48 border border-cyan-500/30 rounded-full absolute"></div>
                            <div className="w-32 h-32 border border-cyan-500/30 rounded-full absolute"></div>
                            <div className="w-16 h-16 border border-cyan-500/30 rounded-full absolute bg-cyan-500/10"></div>
                            <div className="absolute text-[10px] text-cyan-500/50 bottom-2 right-2">RADAR_MODE: LOCAL_AREA</div>
                        </div>
                    </div>

                    {/* Bottom: Console / Terminal */}
                    <div className="flex-1 border border-cyan-800/30 rounded bg-black/60 p-2 font-mono text-xs overflow-auto">
                        <div className="text-cyan-600 mb-1 border-b border-cyan-900/50 pb-1">{">>"} SYSTEM_LOG // NETWORK_EVENTS</div>
                        <div className="space-y-1">
                            {devices.map((d, i) => (
                                <div key={i} className="opacity-80">
                                    <span className="text-cyan-700">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="text-cyan-400"> NEW_DEVICE_HANDSHAKE:</span>
                                    <span className="text-cyan-200"> {d.ip} ({d.name})</span>
                                </div>
                            ))}
                            {traffic.length > 0 && traffic[traffic.length - 1] > 80 && (
                                <div className="text-yellow-400 animate-pulse">
                                    <span className="text-yellow-700">[{new Date().toLocaleTimeString()}]</span>
                                    WARNING: HIGH BANDWIDTH USAGE DETECTED ON PORT 8080
                                </div>
                            )}
                        </div>
                        <div className="mt-2 animate-pulse text-cyan-500">_</div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-pulse-slow {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

// Missing Import Fix
const AlertTriangle = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export default NetScope;
