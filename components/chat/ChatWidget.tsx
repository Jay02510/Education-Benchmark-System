import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useStudents } from '../../context/StudentContext';
import { TABS } from '../../constants';

const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-indigo-900 font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const ChatWidget: React.FC = () => {
    const { isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory, isAiActive, reconnect } = useChat();
    const { user } = useAuth();
    const { activeTab } = useNavigation();
    const { students } = useStudents();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const hasCriticalInsight = students.some(s => s.hasAnomaly);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const suggestions = activeTab === TABS.STUDENTS 
        ? ["Who is at risk?", "Class summary", "Top performers"]
        : ["Growth trends?", "Weakest domain?"];

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-8 z-[110000] flex flex-col items-end pointer-events-none">
            <div 
                className={`
                    pointer-events-auto bg-white/95 backdrop-blur-2xl w-[90vw] md:w-[420px] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right mb-6 flex flex-col
                    ${isOpen ? 'opacity-100 scale-100 h-[650px] max-h-[85vh]' : 'opacity-0 scale-75 h-0 overflow-hidden translate-y-12'}
                `}
            >
                <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative p-2.5 bg-indigo-600 rounded-2xl shadow-lg">
                            <Icon name="robot" className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm tracking-tight">Benchmark AI Assistant</h3>
                            <button 
                                onClick={reconnect}
                                className="flex items-center gap-1.5 group cursor-pointer outline-none"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isAiActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isAiActive ? 'text-slate-400 group-hover:text-emerald-400' : 'text-rose-400 group-hover:text-rose-300'}`}>
                                    {isAiActive ? 'Engine Connected' : 'Engine Offline'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-1">
                         <button onClick={clearHistory} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
                            <Icon name="refresh" className="w-4 h-4" />
                        </button>
                        <button onClick={toggleChat} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 mr-3 mt-1 border border-indigo-200">
                                    <Icon name="robot" className="w-4 h-4 text-indigo-600" />
                                </div>
                            )}
                            <div 
                                className={`
                                    max-w-[85%] p-4 rounded-[1.8rem] text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                                    ${msg.isError ? 'bg-rose-50 border-rose-100 text-rose-800' : ''}
                                `}
                            >
                                {msg.role === 'user' ? msg.text : formatText(msg.text)}
                            </div>
                        </div>
                    ))}
                    
                    {!isAiActive && (
                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] text-center">
                            <p className="text-amber-800 font-bold text-sm mb-4">AI engine is currently offline.</p>
                            <button 
                                onClick={reconnect}
                                className="px-6 py-2 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition"
                            >
                                Connect Engine
                            </button>
                        </div>
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 mr-3 mt-1">
                                <Icon name="robot" className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isTyping && isAiActive && (
                    <div className="px-6 py-4 bg-white/50 border-t border-slate-50 flex gap-2 overflow-x-auto scrollbar-none">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-[10px] font-black text-slate-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm uppercase tracking-widest">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                    <input 
                        type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isAiActive ? "Inquire with data co-pilot..." : "Connect engine to start..."}
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isTyping || !isAiActive}
                    />
                    <button 
                        type="submit" disabled={!inputValue.trim() || isTyping || !isAiActive}
                        className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-xl active:scale-90"
                    >
                        <Icon name="arrowRight" className="w-6 h-6" />
                    </button>
                </form>
            </div>

            <button 
                onClick={toggleChat}
                className={`
                    pointer-events-auto transition-all duration-700 flex items-center justify-center relative
                    ${isOpen ? 'w-12 h-12 rounded-full bg-slate-800 text-slate-300' : 'w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl'}
                `}
            >
                {isOpen ? <Icon name="close" className="w-6 h-6" /> : <Icon name="chat" className="w-8 h-8" />}
            </button>
        </div>
    );
};