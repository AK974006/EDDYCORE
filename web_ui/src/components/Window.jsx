import React, { useState, useEffect, useRef } from 'react';

const Window = ({ id, title, children, isActive, onClose, onFocus, onMinimize, onMaximize, onMove, isMinimized, position, size, zIndex, noPadding = false, isMobile }) => {
    const windowRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


    const handleMouseDown = (e) => {
        // Only allow dragging from title bar (and ensure not clicking buttons)
        if (e.target.closest('button')) return;
        if (isMobile) return; // Disable dragging on mobile

        onFocus(id);
        setIsDragging(true);
        const rect = windowRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;

            onMove(id, { x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, id, onMove]);

    if (isMinimized) return null;

    return (
        <div
            ref={windowRef}
            className={`absolute flex flex-col bg-os-bg border border-white/20 shadow-2xl overflow-hidden transition-shadow duration-200 ${isMobile ? 'rounded-none border-x-0 border-t-0' : 'rounded-lg'} ${isActive ? 'ring-1 ring-os-accent shadow-blue-500/20' : 'opacity-90'}`}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                zIndex: zIndex,
                transition: isDragging ? 'none' : 'all 0.1s ease-out' // Disable transition during drag for performance
            }}
            onMouseDown={() => onFocus(id)}
        >
            {/* Title Bar */}
            <div
                className={`h-10 bg-white/5 flex items-center justify-between px-3 select-none shrink-0 active:cursor-grabbing ${isMobile ? '' : 'cursor-move'}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-sm font-medium text-gray-200">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); onMaximize(id); }}
                                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400"
                            />
                        </>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(id); }}
                        className={`rounded-full bg-red-500 hover:bg-red-400 ${isMobile ? 'w-5 h-5' : 'w-3 h-3'}`} // Make close button bigger on mobile
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-auto bg-os-bg/95 relative ${noPadding ? '' : 'p-4'}`}>
                {children}
            </div>
        </div>
    );
};

export default Window;
