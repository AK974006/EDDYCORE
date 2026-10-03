import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api';
import Dashboard from './eddie/components/Dashboard';
import Hologram from './eddie/components/Hologram';
import Waveform from './eddie/components/Waveform';
import './eddie/Eddie.css';
import { startRecording } from './eddie/utils/wavRecorder';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const EddieChat = ({ onOpenApp, availableApps = [] }) => {
    const [status, setStatus] = useState('idle');
    const [interim, setInterim] = useState('');
    const [listening, setListening] = useState(false);
    const [history, setHistory] = useState([]);
    const [micLevel, setMicLevel] = useState(0);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [micError, setMicError] = useState(null);
    const [micActive, setMicActive] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isRecordingCustom, setIsRecordingCustom] = useState(false);
    const [currentRecorder, setCurrentRecorder] = useState(null);
    const [inputText, setInputText] = useState('');

    // Refs to keep track of state inside event listeners
    const listeningRef = useRef(listening);
    const hasGreetedRef = useRef(hasGreeted);
    const recogRef = useRef(null);
    const onOpenAppRef = useRef(onOpenApp);
    const availableAppsRef = useRef(availableApps);

    useEffect(() => {
        onOpenAppRef.current = onOpenApp;
    }, [onOpenApp]);

    useEffect(() => {
        availableAppsRef.current = availableApps;
    }, [availableApps]);

    useEffect(() => {
        listeningRef.current = listening;
    }, [listening]);

    useEffect(() => {
        hasGreetedRef.current = hasGreeted;
    }, [hasGreeted]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, interim]);

    function speak(text) {
        if (!window.speechSynthesis || !text) return;

        // Strip markdown syntax for cleaner speech
        let cleanText = text
            // Remove headers (###, ##, #)
            .replace(/^#{1,6}\s+/gm, '')
            // Remove bold (**text** or __text__)
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            // Remove italic (*text* or _text_)
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            // Remove inline code (`code`)
            .replace(/`(.+?)`/g, '$1')
            // Remove links [text](url)
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            // Remove horizontal rules
            .replace(/^[-*_]{3,}$/gm, '')
            // Remove list markers (-, *, 1.)
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            // Remove blockquotes
            .replace(/^>\s+/gm, '')
            // Clean up extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        const u = new SpeechSynthesisUtterance(cleanText);
        u.lang = 'en-US';
        u.rate = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    }

    // Voice recognition functions removed due to browser-incompatibility in Electron.
    // Replaced with custom WAV-based backend transcription.

    useEffect(() => {
        // Init logic
        setHistory(h => [{ role: 'assistant', content: "Systems online. How can I help?" }, ...h]);

        return () => {
            // clean up...
            if (recogRef.current) {
                recogRef.current.onend = null;
                recogRef.current.stop();
                recogRef.current = null;
            }
            // STOP THE PROCESS: Stop speaking if window is closed
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setMicLevel(Math.random() * 0.1 + (listening ? 0.4 : 0));
        }, 100);
        return () => clearInterval(interval);
    }, [listening]);

    const handleManualActivate = async () => {
        if (isRecordingCustom) {
            // STOP RECORDING
            if (currentRecorder) {
                const blob = await currentRecorder.stop();
                setIsRecordingCustom(false);
                setCurrentRecorder(null);
                setListening(false);
                setStatus('processing');
                setInterim('Transcribing...');

                try {
                    const result = await api.eddie.transcribe(blob);
                    if (result.text) {
                        setInterim('');
                        handleCommand(result.text);
                    } else if (result.error) {
                        setMicError(result.error);
                        setStatus('idle');
                        setInterim('');
                    }
                } catch (err) {
                    setMicError("Transcription failed");
                    setStatus('idle');
                    setInterim('');
                }
            }
            return;
        }

        // START RECORDING
        try {
            setMicError(null);
            const recorder = await startRecording();
            setCurrentRecorder(recorder);
            setIsRecordingCustom(true);
            setListening(true);
            setStatus('listening');
            // speak("I'm listening."); // Optional: remove speak to avoid audio echo in recording
        } catch (err) {
            console.error('Failed to start recording:', err);
            setMicError("Microphone access blocked.");
        }
    };

    const handleCommand = async (input) => {
        if (!input.trim()) return;

        console.log('[Eddie] Processing command:', input);
        setHistory(h => [{ role: 'user', content: input }, ...h]);
        setStatus('processing');
        setInterim('Thinking...');

        const cleanTranscript = input.toLowerCase();

        // Check for app launch commands
        if (cleanTranscript.includes('open')) {
            const appNameQuery = cleanTranscript.split('open')[1]?.trim();
            if (appNameQuery) {
                const apps = availableAppsRef.current;
                const targetApp = apps.find(app =>
                    app.name.toLowerCase() === appNameQuery ||
                    app.id.toLowerCase() === appNameQuery ||
                    (appNameQuery === 'chrome' && app.id === 'browser')
                );

                if (targetApp) {
                    if (onOpenAppRef.current) {
                        onOpenAppRef.current(targetApp.id, targetApp.name);
                        speak(`Opening ${targetApp.name}`);
                        setStatus('idle');
                        setHistory(h => [{ role: 'assistant', content: `Opening ${targetApp.name}` }, ...h]);
                        setInterim('');
                        return;
                    }
                }
            }
        }

        // AI Chat (OpenRouter)
        try {
            const res = await api.eddie.chat({
                message: input,
                history: history
            });
            const text = res.response;
            speak(text);
            setHistory(h => [{ role: 'assistant', content: text }, ...h]);
            setStatus('idle');
            setInterim('');
        } catch (err) {
            console.error('[Eddie] Chat error:', err);
            speak("I encountered an error connecting to my core systems.");
            setStatus('error');
            setInterim('Connection Error');
            setHistory(h => [{ role: 'assistant', content: `Error: ${err.message}` }, ...h]);
        }
    };

    // Dictation toggle removed in favor of direct WAV upload system.


    return (
        <div className="eddie-app">
            <Dashboard status={status}>
                <div className="main-container">
                    <div className="hologram-section" onClick={handleManualActivate}>
                        <Hologram micLevel={micLevel} listening={listening} />
                        {(micError) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded backdrop-blur-md border border-red-500/50">
                                    {micError}
                                </div>
                            </div>
                        )}
                        {isRecordingCustom && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600/40 px-3 py-1 rounded-full animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-[10px] font-bold text-white uppercase">Recording Audio</span>
                            </div>
                        )}
                    </div>

                    <div className="conversation-section">
                        {interim && (
                            <div className="interim-text">
                                <p>{interim}</p>
                            </div>
                        )}

                        <div className="history">
                            {[...history].reverse().map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`}>
                                    <div className="message-role">{msg.role === 'assistant' ? 'EDDIE' : 'YOU'}</div>
                                    <div className="message-text">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                <div className="waveform-container">
                    <Waveform micLevel={micLevel} />
                </div>

                <div className="text-input-container absolute bottom-4 w-full flex justify-center z-10">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!inputText.trim()) return;

                            const input = inputText;
                            setInputText('');
                            handleCommand(input);
                        }}
                        className="w-full max-w-2xl px-4 flex gap-2"
                    >
                        <button
                            type="button"
                            onClick={handleManualActivate}
                            className={`p-3 rounded-full backdrop-blur-md border transition-all ${isRecordingCustom ? 'bg-red-500/40 border-red-500 animate-pulse' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                            title="Voice Command"
                        >
                            {isRecordingCustom ? '🛑' : '🎙️'}
                        </button>

                        <input
                            name="textInput"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message or use voice..."
                            className="flex-1 bg-black/40 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:border-blue-500 backdrop-blur-md transition-colors"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition-colors">
                            ➤
                        </button>
                    </form>
                </div>
            </Dashboard>
        </div>
    );
};

export default EddieChat;
