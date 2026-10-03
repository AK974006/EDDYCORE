import React from 'react';
import './Hologram.css';

export default function Hologram({ micLevel = 0, listening = false }) {
    return (
        <div className={`hologram-wrapper ${listening ? 'listening' : ''}`}>
            <div className="hologram-container">
                <div className="hologram-circle-outer"></div>
                <div className="hologram-circle-inner"></div>
                <div className="core-reactor">
                    <div className="reactor-ring"></div>
                    <div className="reactor-core"></div>
                </div>
            </div>
        </div>
    );
}
