import React, { useState } from 'react';
import { Smartphone, Wifi, QrCode, Monitor } from 'lucide-react';

const Connect = () => {
    const [ipAddress, setIpAddress] = useState('');
    const [showQr, setShowQr] = useState(false);

    const generateQrUrl = () => {
        // Using a public API for QR generation for simplicity in this demo
        // In a real prod app, use a local library like qrcode.react
        const cleanIp = ipAddress.replace(/\/$/, '');
        const targetUrl = cleanIp.startsWith('http') ? cleanIp : `http://${cleanIp}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
    };

    return (
        <div className="h-full bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 flex flex-col items-center justify-center">

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center">

                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/50">
                    <Smartphone size={40} className="text-white" />
                </div>

                <h2 className="text-3xl font-bold mb-2">Connect Device</h2>
                <p className="text-indigo-200 mb-8">Access EDDYCORE from your mobile or tablet via local network.</p>

                {!showQr ? (
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl text-left border border-white/10">
                            <div className="flex items-start gap-4 mb-2">
                                <Monitor size={20} className="text-indigo-400 mt-1" />
                                <div>
                                    <div className="text-sm font-bold text-gray-300">STEP 1: Check Terminal</div>
                                    <div className="text-xs text-gray-400">Look at the terminal where you started the OS. Find the "Network" URL.</div>
                                    <div className="mt-2 font-mono bg-black/50 p-2 rounded text-green-400 text-xs">
                                        ➜  Network: http://192.168.1.5:5173/
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl text-left border border-white/10">
                            <div className="flex items-center gap-4">
                                <Wifi size={20} className="text-indigo-400" />
                                <div>
                                    <div className="text-sm font-bold text-gray-300">STEP 2: Enter URL</div>
                                    <input
                                        type="text"
                                        placeholder="e.g. 192.168.1.5:5173"
                                        className="mt-2 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (ipAddress) setShowQr(true);
                            }}
                            disabled={!ipAddress}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                                ${ipAddress ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            Generate Link QR
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="bg-white p-4 rounded-xl inline-block mb-6">
                            <img src={generateQrUrl()} alt="Connection QR" className="w-48 h-48" />
                        </div>

                        <p className="text-sm text-indigo-200 mb-6">
                            Scan this with your phone's camera to open EDDYCORE immediately.
                        </p>

                        <button
                            onClick={() => setShowQr(false)}
                            className="text-sm text-gray-400 hover:text-white underline"
                        >
                            Back to input
                        </button>
                    </div>
                )}

            </div>

            <div className="mt-8 flex gap-4 text-xs text-indigo-300/50">
                <span className="flex items-center gap-1"><Wifi size={12} /> Same Wi-Fi Required</span>
                <span className="flex items-center gap-1"><QrCode size={12} /> Secure Link</span>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Connect;
