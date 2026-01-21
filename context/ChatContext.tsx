
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

const SYSTEM_INSTRUCTION = "You are the Benchmark Institutional Intelligence Engine. Be concise, data-driven, and highly professional.";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTab } = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    const verifyKeyStatus = async () => {
        const envKey = process.env.API_KEY;
        if (envKey && envKey !== "undefined" && envKey !== "") return true;
        
        // If env key is missing, check if one was selected via aistudio protocol
        if ((window as any).aistudio) {
            return await (window as any).aistudio.hasSelectedApiKey();
        }
        return false;
    };

    useEffect(() => {
        verifyKeyStatus().then(setIsAiActive);
    }, []);

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Guidelines: Check selection and trigger if missing
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                }
            }

            const apiKey = process.env.API_KEY;
            if (!apiKey || apiKey === "undefined" || apiKey === "") {
                throw new Error("AUTHORIZATION_REQUIRED: API Key not detected in environment. Please click 'Connect Engine'.");
            }

            // Guidelines: Create instance right before use
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: text,
                config: {
                    systemInstruction: `${SYSTEM_INSTRUCTION} Mode: ${currentPersona}.`,
                    tools: [{ functionDeclarations: currentPersona === 'Teacher' ? teacherTools : adminTools }],
                }
            });

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: response.text || "Diagnostic complete.", 
                timestamp: Date.now() 
            }]);
            setIsAiActive(true);
        } catch (error: any) {
            // Guidelines: Handle Requested entity was not found
            if (error.message?.includes("Requested entity was not found") && (window as any).aistudio) {
                await (window as any).aistudio.openSelectKey();
                setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'model', 
                    text: "Connectivity reset. Please resend your last message.", 
                    timestamp: Date.now() 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'model', 
                    text: `Connectivity Alert: ${error.message}`, 
                    timestamp: Date.now(), 
                    isError: true 
                }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const reconnect = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setIsAiActive(true);
            setMessages(prev => [...prev, {
                id: `sys-${Date.now()}`,
                role: 'model',
                text: "Engine handshake successful. Strategic analysis online.",
                timestamp: Date.now()
            }]);
        } else {
            const active = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
            setIsAiActive(active);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);
    const clearHistory = () => setMessages([]);

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
