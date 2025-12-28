
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { TABS } from '../../constants';

// Simple Markdown Parser for Bold Text
const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-indigo-900">{part.slice(2, -2)}</strong>;
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
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    // Context-aware suggestions based on the active tab
    const getSuggestions = () => {
        switch (activeTab) {
            case TABS.STUDENTS:
                return [
                    "Who is at risk?",
                    "Summarize class performance",
                    "Show me top students",
                    "Any recent drops?"
                ];
            case TABS.BENCHMARK:
                return [
                    "What is the target for Reading?",
                    "Explain Level 5 standards",
                    "How do I edit benchmarks?",
                    "Compare to CEFR"
                ];
            case TABS.ANALYTICS:
                return [
                    "What is the weakest domain?",
                    "Generate a class report",
                    "Analyze recent trends",
                    "Explain the drop in Writing"
                ];
            case TABS.RESOURCE_BANK:
                return [
                    "Find resources for inference",
                    "Create a phonics worksheet",
                    "Suggest grammar activities",
                    "Help with Level 5 Reading"
                ];
            case TABS.ADMIN:
                return [
                    "Check database health",
                    "Show system stats",
                    "How many users?",
                    "Backup status"
                ];
            default:
                return [
                    "How is the class doing?",
                    "Who is at risk?",
                    "Find a resource",
                    "Check benchmarks"
                ];
        }
    };

    const suggestions = getSuggestions();

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div 
                className={`
                    pointer-events-auto bg-white w-[90vw] md:w-[400px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 origin-bottom-right mb-4 flex flex-col
                    ${isOpen ? 'opacity-100 scale-100 h-[600px] max-h-[80vh]' : 'opacity-0 scale-90 h-0 overflow-hidden'}
                `}
            >
                {/* Header */}
                <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <Icon name="brain" className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Benchmark Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-slate-400 text-xs">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={clearHistory} className="text-slate-400 hover:text-white p-1 rounded transition" title="Clear Chat">
                            <Icon name="close" className="w-4 h-4 rotate-45" /> {/* Using rotate close as a 'plus/clear' metaphor or add refresh icon if available */}
                        </button>
                        <button onClick={toggleChat} className="text-slate-400 hover:text-white p-1 rounded transition">
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                                    <Icon name="brain" className="w-4 h-4 text-indigo-600" />
                                </div>
                            )}
                            <div 
                                className={`
                                    max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
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
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                                <Icon name="brain" className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions (Only show if empty or recent user interaction) */}
                {!isTyping && messages.length < 3 && (
                    <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-none">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => sendMessage(s)}
                                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-indigo-600 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || isTyping}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                        <Icon name="arrowRight" className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button 
                onClick={toggleChat}
                className={`
                    pointer-events-auto shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all duration-300 flex items-center justify-center
                    ${isOpen ? 'w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300' : 'w-16 h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 hover:scale-105 hover:-translate-y-1 text-white'}
                `}
            >
                {isOpen ? (
                     <Icon name="close" className="w-6 h-6" />
                ) : (
                    <Icon name="brain" className="w-8 h-8" />
                )}
            </button>
        </div>
    );
};
