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
Think like a senior administrator or pedagogical head.
Optimize for growth velocity and teacher sustainability.
Always use Benchmark terminology: 'Growth Velocity', 'Intervention Tiers'.
You have access to class data through your tools.
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
        setIsAiActive(!!process.env.API_KEY);
    }, []);

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Guardian Institutional Audit online. How can I assist with system oversight?" : "Benchmark Intelligence Engine engaged. I'm ready to analyze your classroom trajectory.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    const getChatSession = async () => {
        if (chatSessionRef.current) return chatSessionRef.current;
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY not configured.");
        
        const ai = new GoogleGenAI({ apiKey });
        const session = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + (currentPersona === 'Admin' ? " (Admin/Principal Mode: Focus on high-level institutional health)" : " (Teacher Mode: Focus on classroom outcomes)"),
                tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
            }
        });
        chatSessionRef.current = session;
        return session;
    };

    const reconnect = async () => {
        chatSessionRef.current = null;
        setIsAiActive(!!process.env.API_KEY);
        setMessages(prev => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'model',
            text: "Re-establishing connection with the Intelligence Engine...",
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
                text: result.text || "Processing complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Connectivity Alert: ${error.message}. Please check API configuration.`, 
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