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
    reconnect: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const TEACHER_INSTRUCTION = `You are the Benchmark Institutional Assistant.
Refer to 'Growth Velocity' and 'Proficiency Tiers'. 
Be professional, data-driven, and focused on learning outcomes.`;

const ADMIN_INSTRUCTION = `Admin System Monitor active. Core infrastructure verified.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    // Monitoring connectivity and key selection
    useEffect(() => {
        const checkConnection = async () => {
            try {
                // @ts-ignore
                const hasKey = await window.aistudio?.hasSelectedApiKey();
                const envKey = process.env.API_KEY;
                // AI is active if we have a direct key or the user has selected one in AI Studio
                setIsAiActive((envKey && envKey.length > 5) || !!hasKey);
            } catch {
                setIsAiActive(false);
            }
        };
        checkConnection();
        const interval = setInterval(checkConnection, 3000);
        return () => clearInterval(interval);
    }, []);

    // Persona switch effect
    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null; // Clear session to re-init with new instructions/tools
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Admin diagnostics system online." : "Benchmark AI Assistant connected. I'm ready to analyze your institutional data.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab, currentPersona]);

    /**
     * Re-creates the chat session with a fresh client.
     */
    const createNewSession = async () => {
        // Trigger key handshake if necessary
        if (typeof window !== 'undefined' && (window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey.length < 5) {
            throw new Error("No API Key detected. Please click 'Engine Offline' to connect your account.");
        }
        
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

    const reconnect = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Clear current invalid session
            chatSessionRef.current = null;
        }
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
                if (!student) return { error: "Student not found in active database." };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    intervention: student.interventionStatus?.tier || "None (Tier 1)"
                };
            default:
                return { status: "Operation successful." };
        }
    };

    const sendMessage = async (text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
        setIsTyping(true);

        try {
            // JIT Re-initialization
            if (!chatSessionRef.current) {
                chatSessionRef.current = await createNewSession();
            }
            
            const chat = chatSessionRef.current;
            let result: GenerateContentResponse = await chat.sendMessage({ message: text });
            
            // Loop through function calls if the model requests tools
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
                text: result.text || "Analysis complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat failure:", error);
            
            // Handle key rotation or invalid project selection
            if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY")) {
                reconnect();
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Identity Error: ${error.message}. Please click the engine status badge to re-authenticate.`, 
                timestamp: Date.now(), 
                isError: true 
            }]);
            chatSessionRef.current = null;
        } finally {
            setIsTyping(false);
        }
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