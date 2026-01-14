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

const TEACHER_INSTRUCTION = `You are the Benchmark Institutional Assistant. Refer to 'Growth Velocity' and 'Proficiency Tiers'. Be professional, data-driven, and focused on learning outcomes.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTab } = useNavigation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    // Robust Engine Status Monitor
    useEffect(() => {
        const monitor = setInterval(() => {
            const win = window as any;
            const key = (win.process && win.process.env && win.process.env.API_KEY) || 
                       (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                       win.API_KEY;
            // Verify key is non-empty and has plausible length
            setIsAiActive(!!key && String(key).length > 10);
        }, 1500);
        return () => clearInterval(monitor);
    }, []);

    // Automatic Persona Alignment
    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Admin diagnostics protocol online." : "Benchmark Assistant ready for institutional analysis.",
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

        const apiKey = (win.process && win.process.env && win.process.env.API_KEY) || win.API_KEY;

        if (!apiKey) throw new Error("Connectivity identity missing. Please re-deploy or reconnect.");
        
        const ai = new GoogleGenAI({ apiKey });
        return ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: currentPersona === 'Teacher' ? TEACHER_INSTRUCTION : "Admin maintenance mode.",
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
            // Manual fallback if environment fails
            const manualKey = prompt("Enter Benchmark API Key (Leave blank to use environment):");
            if (manualKey) {
                win.API_KEY = manualKey;
                win.process.env.API_KEY = manualKey;
                setIsAiActive(true);
            }
            chatSessionRef.current = null;
        }
    };

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            if (!chatSessionRef.current) chatSessionRef.current = await createNewSession();
            
            const chat = chatSessionRef.current;
            const result: GenerateContentResponse = await chat.sendMessage({ message: text });

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "Protocols complete. No further insights found.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat Protocol Error:", error);
            
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Identity Failure: ${error.message}. Please click 'Engine Offline' to manually connect.`, 
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