import React, { useEffect, useState } from 'react';

const GoogleLoginButton = ({ onSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
                    callback: handleCredentialResponse,
                });
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCredentialResponse = (response) => {
        try {
            // Decode JWT token to get user info
            const userInfo = parseJwt(response.credential);

            const userData = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                authMethod: 'google',
                googleId: userInfo.sub,
            };

            onSuccess(userData);
        } catch (error) {
            console.error('Error processing Google login:', error);
            onError && onError(error);
        }
    };

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        if (window.google) {
            window.google.accounts.id.prompt((notification) => {
                setIsLoading(false);
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to manual button click
                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-button'),
                        {
                            theme: 'filled_blue',
                            size: 'large',
                            width: '100%',
                        }
                    );
                }
            });
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
            <div id="google-signin-button" className="mt-2"></div>
        </div>
    );
};

export default GoogleLoginButton;
