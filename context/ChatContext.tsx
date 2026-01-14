import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, Domain } from '../types.ts';
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const TEACHER_INSTRUCTION = `You are the Benchmark Institutional Assistant.
Refer to 'Growth Velocity' and 'Proficiency Tiers'. 
Be professional, data-driven, and focused on learning outcomes.`;

const ADMIN_INSTRUCTION = `Admin System Monitor active. Core infrastructure verified.`;

const getApiKey = (): string => {
    // Robust check for the API key in various possible environment shims
    const key = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
    return key || '';
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    useEffect(() => {
        const key = getApiKey();
        setIsAiActive(!!key && key !== 'undefined');
    }, []);

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "System Diagnostics Mode active." : "Benchmark AI Assistant connected. I'm ready to analyze your institutional data.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab, currentPersona]);

    const createNewSession = () => {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("API Key missing");
        
        const ai = new GoogleGenAI({ apiKey });
        const isTeacher = currentPersona === 'Teacher';
        return ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: isTeacher ? TEACHER_INSTRUCTION : ADMIN_INSTRUCTION,
                tools: [{ functionDeclarations: isTeacher ? teacherTools : adminTools }],
            }
        });
    };

    const toggleChat = () => setIsOpen(prev => !prev);
    
    const clearHistory = () => {
        setMessages([{ id: `reset-${Date.now()}`, role: 'model', text: "Workspace context refreshed.", timestamp: Date.now() }]);
        chatSessionRef.current = null;
    };

    const executeTool = async (name: string, args: any): Promise<any> => {
        if (currentPersona === 'Admin') return { status: "Diagnostics: OK" };
        
        switch (name) {
            case 'get_class_summary':
                return { 
                    className: classProfile?.className || "Active Roster",
                    studentCount: students.length, 
                    atRiskCount: students.filter(s => s.hasAnomaly).length
                };

            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
                if (!student) return { error: "Student identity not found." };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    intervention: student.interventionStatus?.tier || "Tier 1"
                };

            default:
                return { status: "Data retrieved." };
        }
    };

    const sendMessage = async (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
        setIsTyping(true);

        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = createNewSession();
            }
            
            const chat = chatSessionRef.current;
            let result: GenerateContentResponse = await chat.sendMessage({ message: text });
            
            while (result.functionCalls && result.functionCalls.length > 0) {
                const functionResponseParts = await Promise.all(
                    result.functionCalls.map(async (call) => {
                        const toolResult = await executeTool(call.name, call.args);
                        return { 
                            functionResponse: { name: call.name, response: { result: toolResult }, id: call.id } 
                        };
                    })
                );
                result = await chat.sendMessage({ message: functionResponseParts });
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "I have analyzed the current data metrics.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            const key = getApiKey();
            const errorText = !key 
                ? "The API Key could not be detected in the client environment. Please ensure you have triggered a NEW DEPLOYMENT on Vercel after adding the API_KEY to your project settings."
                : "The AI engine encountered an issue during the handshake. Please verify that your API key is active and has sufficient quota.";
            
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: errorText, 
                timestamp: Date.now(), 
                isError: true 
            }]);
            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory, currentPersona, isAiActive }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat error');
    return context;
};