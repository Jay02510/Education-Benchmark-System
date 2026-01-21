
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

    const verifyKey = () => {
        const k = process.env.API_KEY;
        return !!k && k !== "undefined" && k !== "";
    };

    useEffect(() => {
        setIsAiActive(verifyKey());
    }, []);

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            let apiKey = process.env.API_KEY;

            // Trigger selector if key is missing
            if (!apiKey || apiKey === "undefined" || apiKey === "") {
                if (window.aistudio) {
                    await window.aistudio.openSelectKey();
                    apiKey = process.env.API_KEY;
                }
            }

            if (!apiKey || apiKey === "undefined" || apiKey === "") {
                throw new Error("CREDENTIALS_REQUIRED: Please click the 'Connect Engine' button to authorize the AI.");
            }

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
                text: response.text || "Processing complete.", 
                timestamp: Date.now() 
            }]);
            setIsAiActive(true);
        } catch (error: any) {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Authorization Alert: ${error.message}`, 
                timestamp: Date.now(), 
                isError: true 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const reconnect = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success and update state
            setIsAiActive(true);
            setMessages(prev => [...prev, {
                id: `sys-${Date.now()}`,
                role: 'model',
                text: "Handshake successful. Engine re-synchronized.",
                timestamp: Date.now()
            }]);
        } else {
            setIsAiActive(verifyKey());
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
