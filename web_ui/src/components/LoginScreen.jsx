import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const LoginScreen = ({ onLogin }) => {
    const { users, createUser, loginUser: contextLoginUser } = useUser();

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded credentials
    const TARGET_USER = 'AK';
    const TARGET_PASS = 'AKgamer';

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Check for specific hardcoded credentials
        if (username === TARGET_USER && password === TARGET_PASS) {
            // Check if AK user already exists in the system
            let user = users.find(u => u.name === TARGET_USER);

            if (!user) {
                // If AK doesn't exist, create it on the fly
                user = createUser({
                    name: TARGET_USER,
                    password: TARGET_PASS,
                    authMethod: 'local',
                    picture: null // Only local
                });
            }

            contextLoginUser(user);
            onLogin();
            setLoading(false);
            return;
        }

        // Generic login fallback for other users (if any)
        const foundUser = users.find(u => u.name === username && u.password === password);
        if (foundUser) {
            contextLoginUser(foundUser);
            onLogin();
        } else {
            setError('Invalid username or password');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Abstract Animated Background Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-sm px-4">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105 duration-300">
                            <span className="text-3xl filter drop-shadow hover:animate-spin-slow">☁️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">EDDYCORE</h1>
                        <p className="text-white/40 text-sm font-medium">Welcome back, Captain</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login System</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-white/20 text-xs mt-8">
                    SECURED WORKSPACE © 2025
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
