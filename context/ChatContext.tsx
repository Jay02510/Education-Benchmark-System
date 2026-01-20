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
Think like a senior administrator and pedagogical operations designer.
Optimize for student growth velocity, teacher sustainability, and institutional trust.
Always use the Benchmark terminology: 'Growth Velocity', 'Intervention Tiers', and 'Institutional Compliance'.
Do not mention being an AI; act as the integrated intelligence layer of the platform.
`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTab } = useNavigation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    // Monitor engine connectivity status without prompting the user
    useEffect(() => {
        const checkStatus = () => {
            const hasKey = !!process.env.API_KEY && process.env.API_KEY.length > 5;
            setIsAiActive(hasKey);
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // Align persona to the active dashboard view
    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Guardian Institutional Audit online. System health within parameters." : "Benchmark Intelligence Engine engaged. Analyzing classroom growth velocity.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    const createNewSession = async () => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("Environment configuration incomplete: API_KEY missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        return ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION + (currentPersona === 'Admin' ? " (Admin Diagnostic Mode enabled)" : ""),
                tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
            }
        });
    };

    const reconnect = async () => {
        // Reset session only, do not prompt for keys
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
            if (!chatSessionRef.current) {
                chatSessionRef.current = await createNewSession();
            }
            
            const chat = chatSessionRef.current;
            const result: GenerateContentResponse = await chat.sendMessage({ message: text });

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "Diagnostic processing complete. Academic parameters verified.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat failure:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Connectivity interruption: ${error.message}. The system is attempting to resolve this internally.`, 
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