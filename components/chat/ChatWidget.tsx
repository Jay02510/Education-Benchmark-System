import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { TABS } from '../../constants';

const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-[oklch(0.72_0.18_145)] font-mono font-medium">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const ChatWidget: React.FC = () => {
    const { isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory } = useChat();
    const { user } = useAuth();
    const { activeTab, selectedStudentId } = useNavigation();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Draggable Position State (aligned for modern flat UI)
    const [position, setPosition] = useState({ x: window.innerWidth - 180, y: window.innerHeight - 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isTyping, isOpen]);

    // Track dragging bounds cleanly
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setHasMoved(false);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Limit threshold of displacement
        if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
            setHasMoved(true);
        }

        const boundedX = Math.max(20, Math.min(window.innerWidth - 180, newX));
        const boundedY = Math.max(20, Math.min(window.innerHeight - 80, newY));

        setPosition({ x: boundedX, y: boundedY });
    }, [isDragging, dragStart, position]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    const handleButtonClick = (e: React.MouseEvent) => {
        if (hasMoved) {
            e.preventDefault();
            return;
        }
        toggleChat();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const getSuggestions = () => {
        if (selectedStudentId) return ["What is their velocity?", "Latest scores?", "Focus areas?"];
        if (activeTab === TABS.INSIGHTS) return ["Top performers?", "Class summary", "At risk students?"];
        return ["Class summary", "Who is at risk?", "Reading performance?"];
    };

    if (!user) return null;

    const openLeft = position.x > window.innerWidth / 2;
    const openUp = position.y > window.innerHeight / 2;

    return (
        <div 
            className="fixed z-[110000] pointer-events-none font-sans"
            style={{ left: position.x, top: position.y }}
        >
            {/* Chat Frame - Redesigned to be flat-dark minimal */}
            <div 
                id="chat-copilot-window"
                className={`
                    pointer-events-auto absolute bg-zinc-950/98 w-[340px] border border-zinc-900 overflow-hidden transition-all duration-300 flex flex-col rounded-[6px] shadow-2xl
                    ${isOpen ? 'opacity-100 scale-100 h-[480px] max-h-[70vh]' : 'opacity-0 scale-95 h-0 overflow-hidden pointer-events-none'}
                    ${openLeft ? 'right-0' : 'left-0'}
                    ${openUp ? 'bottom-14' : 'top-14'}
                `}
            >
                {/* Header Segment */}
                <div className="bg-zinc-950 px-5 py-4 flex justify-between items-center shrink-0 border-b border-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[oklch(0.72_0.18_145)]/10 border border-[oklch(0.72_0.18_145)]/20 rounded-[4px] flex items-center justify-center">
                            <Icon name="robot" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                        </div>
                        <div>
                            <h3 className="text-zinc-100 font-medium text-xs leading-none">Diagnostic Copilot</h3>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mt-1">active node online</span>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={clearHistory} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-[4px] hover:bg-zinc-900 transition-colors cursor-pointer" title="Refresh session">
                            <Icon name="refresh" className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={toggleChat} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-[4px] hover:bg-zinc-900 transition-colors cursor-pointer" title="Close">
                            <Icon name="close" className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Main Message History Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none bg-zinc-950/40">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                            <Icon name="brain" className="w-8 h-8 text-zinc-650 mb-3" />
                            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1.5">benchmark analysis</h4>
                            <p className="text-[11px] text-zinc-500 leading-normal max-w-[200px]">Query tracking database, student metrics, or specific skill gaps.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-6 h-6 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon name="robot" className="w-3 h-3 text-[oklch(0.72_0.18_145)]" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-[4px] text-xs leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-zinc-900 border border-zinc-850 text-zinc-200' 
                                    : 'bg-zinc-950 border border-zinc-900 text-zinc-300'
                            } ${msg.isError ? 'border-red-950 text-red-400 font-mono text-[10px]' : ''}`}>
                                {msg.role === 'user' ? msg.text : formatText(msg.text)}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-3 justify-start">
                             <div className="w-6 h-6 rounded-[4px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <Icon name="robot" className="w-3 h-3 text-[oklch(0.72_0.18_145)] animate-pulse" />
                            </div>
                            <div className="bg-zinc-950 border border-zinc-900 px-3.5 py-2.5 rounded-[4px] flex gap-1 items-center">
                                <span className="text-[10px] font-mono text-zinc-500 animate-pulse">Analyzing logs...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions & Input Control Footer */}
                <div className="p-3 bg-zinc-950 border-t border-zinc-900 space-y-3">
                    {!isTyping && (
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
                            {getSuggestions().map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => sendMessage(s)} 
                                    className="whitespace-nowrap px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-250 transition-colors cursor-pointer rounded-[4px]"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask copilot..."
                            className="flex-1 bg-zinc-950 border border-zinc-900 text-xs rounded-[4px] px-3 py-2 outline-none text-zinc-150 focus:border-zinc-700 transition-colors placeholder-zinc-700 font-sans"
                            disabled={isTyping}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isTyping}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 rounded-[4px] transition-colors cursor-pointer shrink-0"
                        >
                            <Icon name="arrowUp" className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Flat Trigger Button (strictly aligned structure, no massive purple round circle) */}
            <button 
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onClick={handleButtonClick}
                className={`
                    pointer-events-auto transition-colors duration-300 flex items-center justify-center border select-none rounded-[4px] cursor-pointer
                    ${isOpen 
                        ? 'w-10 h-10 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-250' 
                        : 'px-3 h-10 bg-zinc-950 border-zinc-900 text-zinc-300 hover:text-zinc-100 hover:border-zinc-850 shadow-lg'
                    }
                    ${isDragging ? 'cursor-grabbing scale-102' : 'cursor-grab'}
                `}
            >
                {isOpen ? <Icon name="close" className="w-4 h-4" /> : (
                    <div className="flex items-center gap-2">
                        <Icon name="chat" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                        <span className="text-[10px] font-mono tracking-wider font-medium uppercase">copilot</span>
                    </div>
                )}
            </button>
        </div>
    );
};
