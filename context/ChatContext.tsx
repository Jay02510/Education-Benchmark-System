import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types.ts';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { teacherTools, adminTools } from '../services/agentTools.ts';
import { useStudents } from './StudentContext.tsx';
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

const TEACHER_INSTRUCTION = `You are the Benchmark Institutional Assistant. Refer to 'Growth Velocity' and 'Proficiency Tiers'. Be professional, data-driven, and focused on learning outcomes.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    // Live Monitoring of API Key presence across all potential storage points
    useEffect(() => {
        const monitor = setInterval(() => {
            const win = window as any;
            const key = process.env.API_KEY || win.process?.env?.API_KEY || win.API_KEY;
            setIsAiActive(!!key && key.length > 5);
        }, 2000);
        return () => clearInterval(monitor);
    }, []);

    // Persona Logic
    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Admin diagnostics online." : "Benchmark AI Assistant connected. Ready for data analysis.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab, currentPersona]);

    const createNewSession = async () => {
        const win = window as any;
        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) await win.aistudio.openSelectKey();
        }

        const apiKey = process.env.API_KEY || win.process?.env?.API_KEY || win.API_KEY;
        if (!apiKey) throw new Error("Connectivity identity missing. Please connect your engine.");
        
        const ai = new GoogleGenAI({ apiKey });
        return ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: currentPersona === 'Teacher' ? TEACHER_INSTRUCTION : "Admin diagnostics mode.",
                tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
            }
        });
    };

    const reconnect = async () => {
        const win = window as any;
        if (win.aistudio) {
            await win.aistudio.openSelectKey();
            chatSessionRef.current = null;
        } else {
            // Manual check for standard environment variable injection
            const key = process.env.API_KEY || win.process?.env?.API_KEY || win.API_KEY;
            if (key && key.length > 5) {
                setIsAiActive(true);
                chatSessionRef.current = null;
            }
        }
    };

    const sendMessage = async (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
        setIsTyping(true);

        try {
            if (!chatSessionRef.current) chatSessionRef.current = await createNewSession();
            
            const chat = chatSessionRef.current;
            const result: GenerateContentResponse = await chat.sendMessage({ message: text });

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "Analysis complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat Failure:", error);
            
            const isAuthError = error.message?.includes("API key not valid") || error.message?.includes("identity missing");
            
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Identity Error: ${error.message}. ${isAuthError ? "Please ensure your API_KEY is set in Vercel or click 'Engine Offline' to reconnect." : ""}`, 
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