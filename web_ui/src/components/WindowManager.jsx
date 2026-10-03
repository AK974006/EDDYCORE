import React from 'react';
import Window from './Window';

const WindowManager = ({ windows, activeWindowId, onClose, onFocus, onMinimize, onMaximize, onMove, isMobile }) => {
    return (
        <>
            {windows.map((window) => (
                <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    isActive={window.id === activeWindowId}
                    isMinimized={window.isMinimized}
                    onClose={onClose}
                    onFocus={onFocus}
                    onMinimize={onMinimize}
                    onMaximize={onMaximize}
                    onMove={onMove}
                    position={window.position}
                    size={window.size}
                    zIndex={window.zIndex}
                    isMobile={isMobile}
                >
                    {/* Render the component content here. Pass window.props to the component */}
                    {window.component ? <window.component {...window.props} onOpenApp={window.onOpenApp} /> : <div className="text-gray-400">Content for {window.title}</div>}
                </Window>
            ))}
        </>
    );
};

export default WindowManager;
