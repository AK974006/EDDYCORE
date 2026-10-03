import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { useUser } from '../contexts/UserContext';

const SecuritySettings = () => {
    const { currentUser, updateUserData } = useUser();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCamera, setShowCamera] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const faceRegistered = !!currentUser?.faceDescriptor;

    useEffect(() => {
        // Load face-api models
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error('Error loading face-api models:', err);
            }
        };
        loadModels();
    }, []);

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (currentPassword !== currentUser.password) {
            setMessage({ type: 'error', text: 'Current password is incorrect' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ type: 'error', text: 'New password must be at least 4 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        updateUserData({ password: newPassword });
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setShowCamera(true);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Unable to access camera. Please check permissions.' });
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    const captureFace = async () => {
        if (!modelsLoaded) {
            setMessage({ type: 'error', text: 'Face recognition models are still loading...' });
            return;
        }

        setCapturing(true);
        setMessage({ type: '', text: '' });

        try {
            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setMessage({ type: 'error', text: 'No face detected. Please position your face clearly in the camera.' });
                setCapturing(false);
                return;
            }

            // Store the face descriptor in user profile
            const descriptor = Array.from(detections.descriptor);
            updateUserData({ faceDescriptor: descriptor });

            setMessage({ type: 'success', text: 'Face registered successfully! You can now use Face ID to login.' });

            // Stop camera after successful registration
            setTimeout(() => {
                stopCamera();
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to capture face. Please try again.' });
            console.error('Face capture error:', err);
        }

        setCapturing(false);
    };

    const removeFace = () => {
        if (confirm('Are you sure you want to remove your registered face?')) {
            updateUserData({ faceDescriptor: null });
            setMessage({ type: 'success', text: 'Face data removed successfully.' });
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Settings</h2>
                <p className="text-gray-600">Manage your password and face recognition settings</p>
                {currentUser?.authMethod === 'google' && (
                    <div className="mt-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
                        Logged in via Google: {currentUser.email}
                    </div>
                )}
            </div>

            {/* Password Change Section - Only for local accounts or if they want to set a local password */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        🔑
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                        <p className="text-sm text-gray-600">Update your login password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        Update Password
                    </button>
                </form>
            </div>

            {/* Face Recognition Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Face Recognition</h3>
                        <p className="text-sm text-gray-600">
                            {faceRegistered ? 'Face ID is enabled' : 'Register your face for quick login'}
                        </p>
                    </div>
                </div>

                {faceRegistered && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="text-2xl">✅</div>
                        <div className="flex-1">
                            <p className="font-medium text-green-800">Face ID Active</p>
                            <p className="text-sm text-green-600">You can use face recognition to login</p>
                        </div>
                    </div>
                )}

                {!showCamera ? (
                    <div className="space-y-3">
                        <button
                            onClick={startCamera}
                            disabled={!modelsLoaded}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {faceRegistered ? '🔄 Update Face ID' : '📸 Register Face ID'}
                        </button>

                        {faceRegistered && (
                            <button
                                onClick={removeFace}
                                className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
                            >
                                🗑️ Remove Face ID
                            </button>
                        )}

                        {!modelsLoaded && (
                            <p className="text-sm text-gray-500 text-center">Loading face recognition models...</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full h-80 object-cover"
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.play();
                                    }
                                }}
                            />

                            {/* Capture overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border-4 border-white/50 rounded-full"></div>
                            </div>

                            {capturing && (
                                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                                    <div className="bg-black/70 text-white px-6 py-3 rounded-full">
                                        Capturing...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-800">
                                📌 Position your face in the center circle and click "Capture Face" when ready
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={captureFace}
                                disabled={capturing}
                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                {capturing ? 'Capturing...' : '📸 Capture Face'}
                            </button>
                            <button
                                onClick={stopCamera}
                                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`rounded-xl p-4 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    <p className="font-medium">{message.text}</p>
                </div>
            )}
        </div>
    );
};

export default SecuritySettings;
