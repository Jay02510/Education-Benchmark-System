import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, Student, Domain, Resource } from '../types.ts';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { teacherTools, adminTools } from '../services/agentTools.ts';
import { useStudents } from './StudentContext.tsx';
import { useNavigation } from './NavigationContext.tsx';
import { useBenchmarks } from './BenchmarkContext.tsx';
import { useResources } from './ResourceContext.tsx';
import { TABS } from '../constants.ts';

interface ChatContextType {
    isOpen: boolean;
    toggleChat: () => void;
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
    currentPersona: 'Teacher' | 'Admin';
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper to get AI instance safely
const getAI = () => {
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).process?.env?.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
};

const TEACHER_INSTRUCTION = `You are the Benchmark AI Assistant for teachers. Assist with class data and resources.`;
const ADMIN_INSTRUCTION = `You are the Benchmark System Administrator. Assist with technical configuration.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();
    const { benchmarks } = useBenchmarks();
    const { resources } = useResources();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Admin Console active." : "How can I help with your class today?",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    const getChatSession = () => {
        if (!chatSessionRef.current) {
            const ai = getAI();
            const isTeacher = currentPersona === 'Teacher';
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: isTeacher ? TEACHER_INSTRUCTION : ADMIN_INSTRUCTION,
                    tools: [{ functionDeclarations: isTeacher ? teacherTools : adminTools }],
                }
            });
        }
        return chatSessionRef.current;
    };

    const toggleChat = () => setIsOpen(prev => !prev);
    const clearHistory = () => {
        setMessages([{ id: `reset-${Date.now()}`, role: 'model', text: "Chat cleared.", timestamp: Date.now() }]);
        chatSessionRef.current = null;
    };

    const executeTool = async (name: string, args: any): Promise<any> => {
        if (currentPersona === 'Admin') return { status: "Feature restricted in demo" };
        
        switch (name) {
            case 'get_class_summary':
                return { count: students.length, avg: 75 };
            case 'list_at_risk_students':
                return { risky: students.filter(s => s.hasAnomaly).map(s => s.name) };
            default:
                return { message: "Data available in student profiles." };
        }
    };

    const sendMessage = async (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
        setIsTyping(true);

        try {
            const chat = getChatSession();
            let result: GenerateContentResponse = await chat.sendMessage({ message: text });
            
            while (result.functionCalls && result.functionCalls.length > 0) {
                const functionResponseParts = await Promise.all(
                    result.functionCalls.map(async (call) => {
                        const toolResult = await executeTool(call.name, call.args);
                        return { functionResponse: { name: call.name, response: { result: toolResult }, id: call.id } };
                    })
                );
                result = await chat.sendMessage({ message: functionResponseParts });
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.text || "No response.", timestamp: Date.now() }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Service error.", timestamp: Date.now(), isError: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory, currentPersona }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
    return context;
};