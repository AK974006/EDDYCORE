import React, { useState, useEffect } from 'react';
import { Activity, Mic, Battery, Wifi, Calendar, Clock } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ children, status, micLevel }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-text">EDDIE AI <span className="version">v2.0</span></div>
                </div>
                <div className="header-center">
                    <div className={`status-indicator ${status}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">{status.toUpperCase()}</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="system-stat">
                        <Wifi size={16} />
                        <span>ONLINE</span>
                    </div>
                    <div className="system-stat">
                        <Battery size={16} />
                        <span>100%</span>
                    </div>
                    <div className="datetime-display">
                        <div className="date-display">
                            <Calendar size={14} />
                            <span>{formatDate(currentTime)}</span>
                        </div>
                        <div className="time-display">
                            <Clock size={14} />
                            <span>{formatTime(currentTime)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">
                {children}
            </main>

            <div className="scan-line"></div>
            <div className="vignette"></div>
        </div>
    );
}
