import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Crosshair, Map, Terminal, Lock, Unlock, Eye, HardDrive, Cpu, Radio, Hash } from 'lucide-react';

const TrapWatch = () => {
    const [status, setStatus] = useState('secure'); // secure, detecting, breached, counter-attack
    const [logs, setLogs] = useState([]);
    const [hackerInfo, setHackerInfo] = useState(null);
    const videoRef = useRef(null);
    const [cameraAccess, setCameraAccess] = useState(false);
    const logContainerRef = useRef(null);

    // Initial log sequence
    useEffect(() => {
        addLog("TrapWatch Security System v9.0 initialized.");
        addLog("Monitoring system integrity...", "info");

        const interval = setInterval(() => {
            if (status === 'secure') {
                const randomLog = [
                    "Checking port 443...",
                    "Scanning for unauthorized packets...",
                    "Firewall active. No threats detected.",
                    "System core integrity: 100%",
                    "Network traffic normal.",
                    "Encrypted ping sent to proxy..."
                ];
                addLog(randomLog[Math.floor(Math.random() * randomLog.length)], "dim");
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [status]);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (text, type = 'normal') => {
        setLogs(prev => [...prev.slice(-19), { text, type, time: new Date().toLocaleTimeString() }]);
    };

    const triggerBreach = () => {
        setStatus('detecting');
        addLog("WARNING: UNKNOWN PACKET DETECTED!", "warning");
        setTimeout(() => addLog("Signature mismatch on kernel_task.", "warning"), 1000);
        setTimeout(() => {
            setStatus('breached');
            addLog("CRITICAL: UNAUTHORIZED ROOT ACCESS ATTEMPT!", "error");
            addLog("Tracking source IP...", "error");
        }, 3000);
    };

    const startCounterAttack = async () => {
        setStatus('counter-attack');
        addLog("DEPLOYING HONEYPOT SANDBOX...", "success");
        addLog("Isolating threat in virtual container...", "success");

        // Request Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraAccess(true);
            addLog("SANDBOX CAMERA ACTIVE: Monitoring threat activity", "success");
        } catch (e) {
            addLog("ERROR: Sandbox camera access denied.", "error");
        }

        // Simulate hacker data
        setTimeout(() => {
            setHackerInfo({
                ip: "192.168.1." + Math.floor(Math.random() * 255),
                location: "Unknown Proxy / Deep Web Node",
                os: "Tails OS (Emulated)",
                device: "Virtual Machine"
            });
            addLog("THREAT CONTAINED.", "success");
            addLog("Analyzing rootkit signature...", "success");
        }, 1500);
    };

    return (
        <div className="h-full bg-black text-green-500 font-mono flex flex-col overflow-hidden relative border-2 border-green-900 shadow-[0_0_50px_rgba(0,255,0,0.1)]">

            {/* Header */}
            <div className="h-10 border-b border-green-800 bg-green-900/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Shield size={18} className={status === 'breached' ? 'text-red-500 animate-pulse' : 'text-green-500'} />
                    <span className="font-bold tracking-widest">TRAPWATCH // SECURITY_LEVEL_ULTRA</span>
                </div>
                <div className="flex gap-4 text-xs opacity-70">
                    <span className="flex items-center gap-1"><Cpu size={12} /> CPU: 12%</span>
                    <span className="flex items-center gap-1"><Radio size={12} /> NET: {status === 'secure' ? 'IDLE' : 'ACTIVE'}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel - Logs & Status */}
                <div className="w-1/3 border-r border-green-800 p-4 flex flex-col gap-4 bg-black/50 backdrop-blur">

                    {/* Status Box */}
                    <div className={`border p-4 rounded text-center transition-colors duration-500
                        ${status === 'secure' ? 'border-green-500/50 bg-green-500/10' : ''}
                        ${status === 'detecting' ? 'border-yellow-500 bg-yellow-500/10' : ''}
                        ${status === 'breached' ? 'border-red-600 bg-red-900/20 animate-pulse' : ''}
                        ${status === 'counter-attack' ? 'border-orange-500 bg-orange-500/10' : ''}
                    `}>
                        <div className="text-4xl font-black mb-2 flex justify-center">
                            {status === 'secure' && <Lock size={48} />}
                            {status === 'detecting' && <AlertTriangle size={48} className="text-yellow-500" />}
                            {status === 'breached' && <AlertTriangle size={48} className="text-red-600" />}
                            {status === 'counter-attack' && <Crosshair size={48} className="text-orange-500" />}
                        </div>
                        <div className="text-xl font-bold uppercase tracking-widest">
                            {status === 'secure' && "System Secure"}
                            {status === 'detecting' && "Activity Detected"}
                            {status === 'breached' && "INTRUSION ALERT"}
                            {status === 'counter-attack' && "THREAT ISOLATED"}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-auto">
                        {status === 'secure' && (
                            <button
                                onClick={triggerBreach}
                                className="bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700 py-3 rounded uppercase font-bold tracking-wider transition-all hover:scale-[1.02]"
                            >
                                Simulate Vulnerability
                            </button>
                        )}
                        {status === 'breached' && (
                            <button
                                onClick={startCounterAttack}
                                className="bg-orange-900/80 hover:bg-orange-800 text-white border border-orange-500 py-4 rounded uppercase font-black tracking-widest animate-pulse shadow-[0_0_20px_rgba(255,165,0,0.5)]"
                            >
                                DEPLOY HONEYPOT SANDBOX
                            </button>
                        )}
                        {status === 'counter-attack' && (
                            <button
                                onClick={() => setStatus('secure')}
                                className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-700 py-2 rounded uppercase font-bold"
                            >
                                Reset Security Protocol
                            </button>
                        )}
                    </div>

                    {/* Terminal Logs */}
                    <div
                        ref={logContainerRef}
                        className="flex-1 overflow-y-auto font-mono text-xs border border-green-800/50 p-2 bg-black font-thin"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 
                                ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                                ${log.type === 'warning' ? 'text-yellow-500' : ''}
                                ${log.type === 'success' ? 'text-blue-400' : ''}
                                ${log.type === 'dim' ? 'text-green-900' : ''}
                            `}>
                                <span className="opacity-50">[{log.time}]</span> {log.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Visuals */}
                <div className="flex-1 p-4 flex flex-col gap-4 relative">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)',
                            backgroundSize: '50px 50px'
                        }}
                    ></div>

                    {status === 'counter-attack' ? (
                        <div className="grid grid-cols-2 grid-rows-2 h-full gap-4">
                            {/* Webcam Feed (The "Attacker") */}
                            <div className="border border-orange-500/50 bg-black relative flex flex-col">
                                <div className="bg-orange-900/20 p-1 px-2 text-xs font-bold text-orange-400 flex justify-between items-center">
                                    <span>SANDBOX_CONTAINMENT_UNIT</span>
                                    <Lock size={12} className="animate-pulse" />
                                </div>
                                <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 pointer-events-none border-4 border-orange-500/20 m-4 rounded flex items-center justify-center">
                                        <div className="bg-black/80 px-4 py-2 text-orange-500 font-mono font-bold border border-orange-500">
                                            THREAT_ISOLATED
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Malware Analysis */}
                            <div className="border border-orange-500/50 bg-black flex flex-col">
                                <div className="bg-orange-900/20 p-1 px-2 text-xs font-bold text-orange-400">
                                    <span>ROOTKIT_SIGNATURE_ANALYSIS</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4 font-mono text-xs text-orange-300">
                                    <div className="w-full h-full border border-orange-900/50 p-2 overflow-hidden opacity-70">
                                        <div className="mb-2 text-red-500">{">>"} DETECTED PAYLOAD: Trojan.Win32.Generic</div>
                                        <div>00401000  55 8B EC 83 EC 40 53 56  57 8D 7D C0 B9 10 00 00</div>
                                        <div>00401010  B8 CC CC CC CC F3 AB 8B  45 08 89 45 FC 8B 45 0C</div>
                                        <div>00401020  89 45 F8 8B 45 10 89 45  F4 8B 45 FC 03 45 F8 03</div>
                                        <div className="mt-2 text-green-500">{">>"} DECOMPILING... 45%</div>
                                        <div className="mt-1 text-green-500">{">>"} NEUTRALIZING...</div>
                                    </div>
                                </div>
                            </div>

                            {/* System Info */}
                            <div className="border border-orange-500/50 bg-black flex flex-col col-span-2">
                                <div className="bg-orange-900/20 p-1 px-2 text-xs font-bold text-orange-400">
                                    <span>HONEYPOT_ACTIVITY_LOG</span>
                                </div>
                                <div className="flex-1 p-4 font-mono text-xs overflow-auto">
                                    {hackerInfo && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="opacity-50 mb-1">ATTACKER IP (LOGGED)</div>
                                                <div className="text-xl text-white mb-4">{hackerInfo.ip}</div>

                                                <div className="opacity-50 mb-1">REDIRECTED TO</div>
                                                <div className="text-lg text-white mb-4">Honeypot_Cluster_04</div>
                                            </div>
                                            <div>
                                                <div className="opacity-50 mb-1">THREAT ACTION</div>
                                                <div className="text-lg text-white mb-4">Attempted /etc/shadow read</div>

                                                <div className="opacity-50 mb-1">STATUS</div>
                                                <div className="text-orange-400 animate-pulse">
                                                    CONTAINED IN SANDBOX<br />
                                                    NO DATA LEAKED<br />
                                                    CONNECTION TRACED
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Idle Visualization
                        <div className="h-full flex items-center justify-center opacity-20">
                            <div className="w-64 h-64 border-4 border-dashed border-green-500 rounded-full animate-spin-slow flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-green-500 rounded-full animate-reverse-spin"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes reverse-spin {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
                .animate-reverse-spin {
                    animation: reverse-spin 5s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TrapWatch;
