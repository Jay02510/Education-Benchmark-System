
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
You are the Benchmark Institutional Intelligence Engine. 
You act as a pedagogical consultant for teachers and a strategic advisor for principals.
Your goal is to optimize 'Growth Velocity' and identify 'Intervention Tier' requirements.
Be concise, data-driven, and highly professional.
`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTab } = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    const verifyKey = () => !!process.env.API_KEY;

    useEffect(() => {
        setIsAiActive(verifyKey());
    }, []);

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Guardian Institutional Audit online. I am prepared to analyze school-wide performance metrics." : "Benchmark Intelligence Engine engaged. How can I assist with your classroom strategy today?",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    const getChatSession = async () => {
        if (chatSessionRef.current) return chatSessionRef.current;
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("The Engine is currently locked. Please verify system configuration.");
        
        const ai = new GoogleGenAI({ apiKey });
        const session = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + ` Current View: ${currentPersona} Mode.`,
                tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
            }
        });
        chatSessionRef.current = session;
        return session;
    };

    const reconnect = async () => {
        chatSessionRef.current = null;
        const active = verifyKey();
        setIsAiActive(active);
        if (!active) {
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'model',
                text: "Alert: API Key not detected in environment. Intelligence features remain offline.",
                timestamp: Date.now(),
                isError: true
            }]);
        } else {
             setMessages(prev => [...prev, {
                id: `sys-${Date.now()}`,
                role: 'model',
                text: "Handshake successful. Engine re-calibrated.",
                timestamp: Date.now()
            }]);
        }
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
                text: result.text || "Data inquiry complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Connectivity Alert: ${error.message}`, 
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
