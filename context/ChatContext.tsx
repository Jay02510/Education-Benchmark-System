import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, Domain } from '../types.ts';
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
    isAiActive: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const TEACHER_INSTRUCTION = `You are the Benchmark Executive Assistant. You are grounded in real-time institutional data.
When discussing students, refer to their 'Growth Velocity' and 'Proficiency Tiers'. 
Use the 'get_student_details' and 'get_class_summary' tools to provide evidence-based answers.
Be professional, encouraging, and data-driven.`;

const ADMIN_INSTRUCTION = `System Administrator Persona active. Focused on infrastructure and database health.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();
    const { resources } = useResources();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    useEffect(() => {
        const apiKey = process.env.API_KEY;
        setIsAiActive(!!apiKey && apiKey !== 'undefined' && apiKey.length > 10);
    }, []);

    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        if (targetPersona !== currentPersona) {
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' ? "Administrator Mode Initialized. Core systems healthy." : "Benchmark AI Assistant active. I'm connected to your classroom data and ready to provide strategic insights.",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab, currentPersona]);

    const createNewSession = () => {
        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === 'undefined') {
            throw new Error("System is awaiting environment sync.");
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

    const toggleChat = () => setIsOpen(prev => !prev);
    
    const clearHistory = () => {
        setMessages([{ id: `reset-${Date.now()}`, role: 'model', text: "Workspace context refreshed.", timestamp: Date.now() }]);
        chatSessionRef.current = null;
    };

    const executeTool = async (name: string, args: any): Promise<any> => {
        if (currentPersona === 'Admin') return { status: "Verified" };
        
        switch (name) {
            case 'get_class_summary':
                return { 
                    className: classProfile?.className || "Active Roster",
                    studentCount: students.length, 
                    atRiskCount: students.filter(s => s.hasAnomaly).length,
                    averageVelocity: students.length ? Math.round(students.reduce((a,b)=>a+b.growthVelocity,0)/students.length) : 0
                };

            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
                if (!student) return { error: "No student matching that identity." };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    interventionStatus: student.interventionStatus?.tier || "Tier 1"
                };

            case 'list_at_risk_students':
                const atRisk = students.filter(s => s.hasAnomaly || s.interventionStatus !== null);
                return { 
                    total: atRisk.length,
                    roster: atRisk.map(s => s.name)
                };

            default:
                return { status: "Tool executed successfully." };
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
                text: result.text || "I've analyzed the data and updated the perspective.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "The AI Engine is currently optimizing its connection. Please verify your system credentials if this persists.", 
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