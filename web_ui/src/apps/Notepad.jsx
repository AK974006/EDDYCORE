import React, { useState, useEffect } from 'react';
import { Save, Trash2, Download } from 'lucide-react';

const Notepad = () => {
    const [text, setText] = useState('');

    useEffect(() => {
        const savedText = localStorage.getItem('notepad_content');
        if (savedText) {
            setText(savedText);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('notepad_content', text);
        alert('Note saved successfully!');
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear your note?')) {
            setText('');
            localStorage.removeItem('notepad_content');
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "note.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
            <div className="flex items-center justify-between p-2 bg-[#252526] border-b border-white/10">
                <div className="flex gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded transition-colors text-sm">
                        <Save size={16} /> Save
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded transition-colors text-sm">
                        <Download size={16} /> Export
                    </button>
                </div>
                <button onClick={handleClear} className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
            <textarea
                className="flex-1 w-full bg-[#1e1e1e] text-gray-200 p-4 outline-none resize-none font-mono text-sm leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your notes here..."
                spellCheck={false}
            />
            <div className="px-4 py-1 bg-[#007acc] text-white text-xs flex justify-end">
                {text.length} characters
            </div>
        </div>
    );
};

export default Notepad;
