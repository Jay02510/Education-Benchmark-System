
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
    const { isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory } = useChat();
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

    const getSuggestions = () => {
        switch (activeTab) {
            case TABS.STUDENTS: return ["Who is at risk?", "Summarize class performance", "Show me top students"];
            case TABS.BENCHMARK: return ["What is the target for Reading?", "Explain Level 5 standards"];
            case TABS.ANALYTICS: return ["What is the weakest domain?", "Analyze recent trends"];
            case TABS.RESOURCE_BANK: return ["Find resources for inference", "Create a phonics worksheet"];
            case TABS.ADMIN: return ["Check system health", "Show system stats"];
            default: return ["How is the class doing?", "Who is at risk?"];
        }
    };

    const suggestions = getSuggestions();

    if (!user) return null;

    return (
        <div className="fixed bottom-6 left-8 z-[10000] flex flex-col items-start pointer-events-none">
            <div 
                className={`
                    pointer-events-auto bg-white/95 backdrop-blur-2xl w-[90vw] md:w-[420px] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-left mb-6 flex flex-col
                    ${isOpen ? 'opacity-100 scale-100 h-[650px] max-h-[85vh]' : 'opacity-0 scale-75 h-0 overflow-hidden translate-y-12'}
                `}
            >
                <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-indigo-500 rounded-2xl blur opacity-40 animate-pulse"></div>
                            <div className="relative p-2.5 bg-indigo-600 rounded-2xl shadow-lg">
                                <Icon name="robot" className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm tracking-tight">Benchmark AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Contextual Layer</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                         <button onClick={clearHistory} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition" title="Clear Context">
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
                                <div className="w-8 h-8 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 mr-3 mt-1 border border-indigo-200 shadow-sm">
                                    <Icon name="robot" className="w-4 h-4 text-indigo-600" />
                                </div>
                            )}
                            <div 
                                className={`
                                    max-w-[85%] p-4 rounded-[1.8rem] text-sm leading-relaxed shadow-sm transition-all
                                    ${msg.role === 'user' 
                                        ? 'bg-slate-900 text-white rounded-bl-none shadow-indigo-900/10' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none ring-1 ring-black/5'
                                    }
                                    ${msg.isError ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                                `}
                            >
                                {msg.role === 'user' ? msg.text : formatText(msg.text)}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 mr-3 mt-1">
                                <Icon name="robot" className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isTyping && (
                    <div className="px-6 py-4 bg-white/50 border-t border-slate-50 flex gap-2 overflow-x-auto scrollbar-none">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-[10px] font-black text-slate-600 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm uppercase tracking-widest">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                    <input 
                        type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Analyze roster..."
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                        disabled={isTyping}
                    />
                    <button 
                        type="submit" disabled={!inputValue.trim() || isTyping}
                        className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-xl shadow-indigo-200 active:scale-90"
                    >
                        <Icon name="arrowRight" className="w-6 h-6" />
                    </button>
                </form>
            </div>

            <button 
                onClick={toggleChat}
                className={`
                    pointer-events-auto transition-all duration-700 flex items-center justify-center relative
                    ${isOpen ? 'w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-900 text-slate-300' : 'w-24 h-24 rounded-[3rem] bg-indigo-600 hover:bg-indigo-500 hover:scale-110 hover:-translate-y-2 text-white shadow-2xl'}
                `}
            >
                {!isOpen && hasCriticalInsight && (
                    <div className="absolute -inset-4 bg-indigo-500/30 rounded-[4rem] blur-2xl animate-pulse -z-10"></div>
                )}
                
                {isOpen ? (
                     <Icon name="close" className="w-7 h-7" />
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {hasCriticalInsight && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-400 rounded-full border-2 border-indigo-600 z-10 animate-pulse shadow-sm"></div>
                            )}
                            <Icon name="robot" className="w-12 h-12" />
                        </div>
                        <span className="text-[10px] font-black uppercase mt-1 tracking-widest opacity-80">AI Guide</span>
                    </div>
                )}
            </button>
        </div>
    );
};
