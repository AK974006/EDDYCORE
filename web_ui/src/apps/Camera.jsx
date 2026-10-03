import React, { useRef, useState, useEffect } from 'react';
import { Camera, Video, Circle, Square, RotateCcw, Download, Save, Check } from 'lucide-react';
import { api } from '../api';

const CameraApp = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [mode, setMode] = useState('photo'); // 'photo' or 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedVideo, setCapturedVideo] = useState(null); // URL for video preview
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const chunksRef = useRef([]); // Use ref for chunks to avoid state closure issues
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [mode]); // Restart camera when mode changes (to update audio constraints)

    const startCamera = async () => {
        stopCamera(); // Ensure previous stream is stopped
        try {
            const constraints = {
                video: true,
                audio: mode === 'video'
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            streamRef.current = mediaStream; // Keep ref for cleanup
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please allow camera permissions/Use HTTPS.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
            setMediaRecorder(null);
            setIsRecording(false);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            // Flip horizontal if using user-facing camera (optional, usually standard for mirrors)
            // But usually we just draw it.
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/png');
            setCapturedImage(imageUrl);
        }
    };

    const startRecording = () => {
        if (stream) {
            chunksRef.current = [];

            let options = { mimeType: 'video/webm' };
            if (!MediaRecorder.isTypeSupported('video/webm')) {
                // Fallback options
                if (MediaRecorder.isTypeSupported('video/mp4')) options = { mimeType: 'video/mp4' };
            }

            try {
                const recorder = new MediaRecorder(stream, options);

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: options.mimeType || 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    setCapturedVideo(url);
                    setCapturedImage(null); // Ensure we are in "video review" mode if overlapping logic
                    // We don't auto-save anymore, we let user review.
                };

                recorder.start();
                setMediaRecorder(recorder);
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
            } catch (e) {
                console.error("Failed to start recording", e);
                setError("Failed to start recording: " + e.message);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    const saveToCloud = async () => {
        setSaving(true);
        try {
            let file;
            let filename;

            if (mode === 'photo' && capturedImage) {
                const blob = dataURLtoBlob(capturedImage);
                filename = `photo_${Date.now()}.png`;
                file = new File([blob], filename, { type: 'image/png' });
            } else if (mode === 'video' && capturedVideo) {
                // Fetch the blob from the object URL
                const response = await fetch(capturedVideo);
                const blob = await response.blob();
                const ext = blob.type.split('/')[1] || 'webm';
                filename = `video_${Date.now()}.${ext}`;
                file = new File([blob], filename, { type: blob.type });
            }

            if (file) {
                await api.storage.upload(file);
                // Maybe notification?
                alert("Saved to Cloud Storage!");
                retake(); // Go back to camera
            }
        } catch (err) {
            console.error("Save failed", err);
            setError("Failed to save to cloud.");
        } finally {
            setSaving(false);
        }
    };

    const downloadLocal = async () => {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';

        if (mode === 'photo' && capturedImage) {
            a.href = capturedImage;
            a.download = `photo_${Date.now()}.png`;
            a.click();
        } else if (mode === 'video' && capturedVideo) {
            a.href = capturedVideo;
            a.download = `video_${Date.now()}.webm`; // Extension might need adjusting based on blob
            a.click();
        }

        document.body.removeChild(a);
    };

    const retake = () => {
        if (capturedVideo) {
            URL.revokeObjectURL(capturedVideo);
            setCapturedVideo(null);
        }
        setCapturedImage(null);
    };

    return (
        <div className="h-full flex flex-col bg-black text-white relative overflow-hidden select-none">
            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => startCamera()} className="px-4 py-2 bg-blue-600 rounded">
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                        {!capturedImage && !capturedVideo ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover" // object-cover fills screen
                            />
                        ) : capturedImage ? (
                            <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
                        ) : (
                            <video
                                src={capturedVideo}
                                controls
                                className="h-full w-full object-contain"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Controls */}
                    <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
                        {/* Mode Switcher */}
                        <div className="flex gap-4 w-24">
                            {!capturedImage && !capturedVideo && (
                                <>
                                    <button
                                        onClick={() => !isRecording && setMode('photo')}
                                        className={`p-2 rounded-full transition-all ${mode === 'photo' ? 'bg-white/20 text-white scale-110' : 'text-gray-400 hover:text-white'}`}
                                        disabled={isRecording}
                                    >
                                        <Camera size={24} />
                                    </button>
                                    <button
                                        onClick={() => !isRecording && setMode('video')}
                                        className={`p-2 rounded-full transition-all ${mode === 'video' ? 'bg-white/20 text-white scale-110' : 'text-gray-400 hover:text-white'}`}
                                        disabled={isRecording}
                                    >
                                        <Video size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Shutter / Action Button */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transform">
                            {capturedImage || capturedVideo ? (
                                <div className="flex gap-6">
                                    <button onClick={retake} className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors" disabled={saving}>
                                        <div className="p-3 bg-gray-700/50 rounded-full">
                                            <RotateCcw size={24} />
                                        </div>
                                        <span className="text-xs">Retake</span>
                                    </button>

                                    <button onClick={saveToCloud} className="flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors" disabled={saving}>
                                        <div className="p-3 bg-blue-600/20 rounded-full border border-blue-600/50">
                                            {saving ? <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <Save size={24} />}
                                        </div>
                                        <span className="text-xs">Save Cloud</span>
                                    </button>

                                    <button onClick={downloadLocal} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300 transition-colors" disabled={saving}>
                                        <div className="p-3 bg-green-600/20 rounded-full border border-green-600/50">
                                            <Download size={24} />
                                        </div>
                                        <span className="text-xs">Download</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={mode === 'photo' ? takePhoto : (isRecording ? stopRecording : startRecording)}
                                    className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 
                                        ${isRecording ? 'bg-transparent' : 'bg-white hover:bg-gray-200'}
                                    `}
                                >
                                    {isRecording ? (
                                        <>
                                            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-pulse"></div>
                                            <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                                        </>
                                    ) : (
                                        <div className={`w-14 h-14 rounded-full border-2 ${mode === 'video' ? 'border-red-500 bg-red-500' : 'border-black'}`}></div>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Placeholder for symmetry or gallery link */}
                        <div className="w-24 flex justify-end"></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraApp;
