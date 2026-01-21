
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { TABS } from '../../constants';

const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-indigo-900 font-extrabold">{part.slice(2, -2)}</strong>;
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

    const getSuggestions = () => {
        if (selectedStudentId) return ["What is their velocity?", "Latest scores?", "Focus areas?"];
        if (activeTab === TABS.INSIGHTS) return ["Top performers?", "Class summary", "At risk students?"];
        return ["Class summary", "Who is at risk?", "Reading performance?"];
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-8 z-[110000] flex flex-col items-end pointer-events-none">
            <div 
                className={`
                    pointer-events-auto bg-white/95 backdrop-blur-2xl w-[92vw] md:w-[450px] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right mb-6 flex flex-col
                    ${isOpen ? 'opacity-100 scale-100 h-[700px] max-h-[85vh]' : 'opacity-0 scale-75 h-0 overflow-hidden translate-y-20'}
                `}
            >
                <div className="bg-slate-900 px-8 py-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="p-3 bg-indigo-600 rounded-[1.2rem] shadow-lg shadow-indigo-500/20">
                                <Icon name="robot" className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-slate-900 bg-emerald-400 shadow-sm"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-md tracking-tight leading-none mb-1">Benchmark AI</h3>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Online</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clearHistory} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/10 transition">
                            <Icon name="refresh" className="w-5 h-5" />
                        </button>
                        <button onClick={toggleChat} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/10 transition">
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20 px-10">
                            <Icon name="brain" className="w-16 h-16 text-indigo-200 mb-6" />
                            <h4 className="text-xl font-black text-slate-900 mb-2">Academic Intelligence</h4>
                            <p className="text-sm font-bold text-slate-400">Ask about growth velocity, skill gaps, or intervention strategies.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-10 h-10 rounded-[1rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mr-4 mt-1 shadow-sm">
                                    <Icon name="robot" className="w-5 h-5 text-indigo-600" />
                                </div>
                            )}
                            <div className={`max-w-[85%] p-5 rounded-[2.2rem] text-sm leading-relaxed shadow-sm font-medium ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'} ${msg.isError ? 'bg-rose-50 border-rose-100 text-rose-800 font-bold' : ''}`}>
                                {msg.role === 'user' ? msg.text : formatText(msg.text)}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="w-10 h-10 rounded-[1rem] bg-indigo-50 flex items-center justify-center shrink-0 mr-4 shadow-sm animate-pulse">
                                <Icon name="robot" className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-5 rounded-[1.8rem] flex gap-1.5 items-center shadow-sm">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-white border-t border-slate-50">
                    {!isTyping && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-6 pb-2">
                            {getSuggestions().map((s, i) => (
                                <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap px-5 py-2.5 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm uppercase tracking-widest active:scale-95">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex items-center gap-4">
                        <input 
                            type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Inquire with data engine..."
                            className="flex-1 bg-slate-50 border-2 border-slate-50 text-slate-800 text-sm rounded-2xl px-6 py-5 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold shadow-inner"
                            disabled={isTyping}
                        />
                        <button 
                            type="submit" disabled={!inputValue.trim() || isTyping}
                            className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-xl active:scale-90 border-b-4 border-indigo-900"
                        >
                            <Icon name="arrowUp" className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>

            <button 
                onClick={toggleChat}
                className={`
                    pointer-events-auto transition-all duration-500 flex items-center justify-center relative shadow-2xl active:scale-90
                    ${isOpen ? 'w-14 h-14 rounded-full bg-slate-800 text-slate-300' : 'w-24 h-24 rounded-[2.8rem] bg-indigo-600 text-white hover:bg-indigo-700 border-b-8 border-indigo-900'}
                `}
            >
                {isOpen ? <Icon name="close" className="w-6 h-6" /> : (
                    <div className="flex flex-col items-center">
                        <Icon name="chat" className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Co-pilot</span>
                    </div>
                )}
            </button>
        </div>
    );
};
