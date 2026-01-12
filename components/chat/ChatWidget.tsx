
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
            return <strong key={index} className="text-indigo-900 font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const ChatWidget: React.FC = () => {
    const { isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory } = useChat();
    const { user } = useAuth();
    const { activeTab } = useNavigation();
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
        switch (activeTab) {
            case TABS.STUDENTS: return ["Who is at risk?", "Summarize class performance", "Show me top students", "Any recent drops?"];
            case TABS.BENCHMARK: return ["What is the target for Reading?", "Explain Level 5 standards", "Compare to CEFR"];
            case TABS.ANALYTICS: return ["What is the weakest domain?", "Analyze recent trends", "Explain Writing drop"];
            case TABS.RESOURCE_BANK: return ["Find resources for inference", "Create a phonics worksheet", "Help with Level 5 Reading"];
            case TABS.ADMIN: return ["Check system health", "Show system stats", "Backup status"];
            default: return ["How is the class doing?", "Who is at risk?", "Find a resource"];
        }
    };

    const suggestions = getSuggestions();

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">
            <div 
                className={`
                    pointer-events-auto bg-white w-[90vw] md:w-[420px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right mb-6 flex flex-col
                    ${isOpen ? 'opacity-100 scale-100 h-[650px] max-h-[85vh]' : 'opacity-0 scale-75 h-0 overflow-hidden translate-y-12'}
                `}
            >
                <div className="bg-slate-900 p-5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/40">
                            <Icon name="brain" className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm tracking-tight">Benchmark AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Online & Syncing</span>
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

                <div className="flex-1 bg-[#FDFDFE] overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {msg.role === 'model' && (
                                <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mr-2.5 mt-1 border border-indigo-200 shadow-sm">
                                    <Icon name="brain" className="w-4 h-4 text-indigo-600" />
                                </div>
                            )}
                            <div 
                                className={`
                                    max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user' 
                                        ? 'bg-slate-900 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none ring-1 ring-black/5'
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
                             <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mr-2.5 mt-1">
                                <Icon name="brain" className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex gap-1.5 items-center ring-1 ring-black/5">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isTyping && messages.length < 3 && (
                    <div className="px-5 py-3 bg-[#FDFDFE] border-t border-slate-50 flex gap-2 overflow-x-auto scrollbar-none">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-[11px] font-black text-indigo-600 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm uppercase tracking-wider">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything about your class..."
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        disabled={isTyping}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || isTyping}
                        className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-indigo-200 active:scale-90"
                    >
                        <Icon name="arrowRight" className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <button 
                onClick={toggleChat}
                className={`
                    pointer-events-auto shadow-[0_15px_40px_-5px_rgba(79,70,229,0.4)] transition-all duration-500 flex items-center justify-center
                    ${isOpen ? 'w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-900 text-slate-300 rotate-180' : 'w-20 h-20 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-500 hover:scale-105 hover:-translate-y-2 text-white'}
                `}
            >
                {isOpen ? (
                     <Icon name="close" className="w-7 h-7" />
                ) : (
                    <div className="flex flex-col items-center">
                        <Icon name="brain" className="w-10 h-10" />
                        <span className="text-[9px] font-black uppercase mt-1 tracking-tighter opacity-80">AI Help</span>
                    </div>
                )}
            </button>
        </div>
    );
};
