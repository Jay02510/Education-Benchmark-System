import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types.ts';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { teacherTools, adminTools } from '../services/agentTools.ts';
import { useNavigation } from './NavigationContext.tsx';
import { TABS } from '../constants.ts';

interface ChatContextType {
    isOpen: boolean;
    toggleChat: () => void;
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
    currentPersona: 'Teacher' | 'Admin';
    isAiActive: boolean;
    reconnect: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SYSTEM_INSTRUCTION = `
You are the Benchmark Institutional Intelligence Engine, acting as the Guardian of Academic Health. 
Think like a senior administrator. Optimize for growth velocity and teacher sustainability.
Always use Benchmark terminology: 'Growth Velocity', 'Intervention Tiers'.
`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTab } = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    useEffect(() => {
        const checkStatus = () => {
            setIsAiActive(!!process.env.API_KEY);
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Guardian Institutional Audit online." : "Benchmark Intelligence Engine engaged.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    const getChatSession = async () => {
        if (chatSessionRef.current) return chatSessionRef.current;
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY environment variable is not configured.");
        
        const ai = new GoogleGenAI({ apiKey });
        const session = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + (currentPersona === 'Admin' ? " (Admin Diagnostic Mode)" : ""),
                tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
            }
        });
        chatSessionRef.current = session;
        return session;
    };

    const reconnect = async () => {
        chatSessionRef.current = null;
        setMessages(prev => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'model',
            text: "Re-establishing connection with the Institutional Intelligence Engine...",
            timestamp: Date.now()
        }]);
    };

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const chat = await getChatSession();
            const result: GenerateContentResponse = await chat.sendMessage({ message: text });

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "Diagnostic processing complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat failure:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Connectivity Failure: ${error.message}. Please verify Vercel environment settings.`, 
                timestamp: Date.now(), 
                isError: true 
            }]);
            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);
    const clearHistory = () => {
        setMessages([]);
        chatSessionRef.current = null;
    };

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory, currentPersona, isAiActive, reconnect }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
    return context;
};