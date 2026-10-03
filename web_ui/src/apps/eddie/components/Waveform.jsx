import React, { useEffect, useRef } from 'react';
import './Waveform.css';

export default function Waveform({ micLevel }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        // Bar configuration
        const barWidth = 6;
        const gap = 2;
        const barCount = Math.floor(canvas.width / (barWidth + gap));

        // State for smooth transitions
        const bars = new Array(barCount).fill(0);

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            // Update bar heights based on micLevel
            // We create a "fake" spectrum effect by varying heights based on micLevel and some randomness/noise
            for (let i = 0; i < barCount; i++) {
                // Calculate target height
                // Center bars are higher
                const distanceFromCenter = Math.abs(i - barCount / 2);
                const centerFactor = 1 - (distanceFromCenter / (barCount / 2));

                let targetHeight = (micLevel * 0.8 * centerFactor) + (Math.random() * 10);
                if (targetHeight < 2) targetHeight = 2; // Minimum height

                // Smoothly interpolate current height to target height
                bars[i] += (targetHeight - bars[i]) * 0.2;

                const x = i * (barWidth + gap);
                const y = height - bars[i];

                // Gradient for bars
                const gradient = ctx.createLinearGradient(x, height, x, y);
                gradient.addColorStop(0, 'rgba(0, 243, 255, 0.1)');
                gradient.addColorStop(1, '#00f3ff');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, bars[i]);

                // Reflection
                ctx.fillStyle = 'rgba(0, 243, 255, 0.1)';
                ctx.fillRect(x, height, barWidth, bars[i] * 0.3);
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [micLevel]);

    return (
        <div className="waveform-wrapper">
            <canvas ref={canvasRef} width={600} height={100} className="waveform-canvas" />
        </div>
    );
}
