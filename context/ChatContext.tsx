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

const getAI = () => {
    const key = process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
};

const TEACHER_INSTRUCTION = `You are the Benchmark AI Assistant. You have access to real-time classroom data through tools. 
When asked about students, use the 'get_student_details' tool. 
When asked about class performance, use 'get_class_summary'. 
Be concise, professional, and pedagogical.`;

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
                text: targetPersona === 'Admin' ? "Admin Console active. System health is stable." : "Hello! I'm grounded in your class data. How can I help you today?",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab, currentPersona]);

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
        setMessages([{ id: `reset-${Date.now()}`, role: 'model', text: "Context refreshed. I'm ready for new questions.", timestamp: Date.now() }]);
        chatSessionRef.current = null;
    };

    const executeTool = async (name: string, args: any): Promise<any> => {
        if (currentPersona === 'Admin') return { status: "Diagnostics: OK. Latency: 42ms." };
        
        switch (name) {
            case 'get_class_summary':
                const avg = students.length > 0 ? Math.round(students.reduce((acc, s) => {
                    const latest = s.assessments[s.assessments.length - 1];
                    if (!latest) return acc;
                    const scores = Object.values(latest.scores) as number[];
                    return acc + (scores.reduce((a, b) => a + b, 0) / scores.length);
                }, 0) / students.length) : 0;
                
                return { 
                    className: classProfile?.className || "Unknown",
                    studentCount: students.length, 
                    classAverage: `${avg}%`,
                    atRiskCount: students.filter(s => s.hasAnomaly).length
                };

            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
                if (!student) return { error: "Student not found in current roster." };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    latestScores: student.assessments[student.assessments.length - 1]?.scores,
                    intervention: student.interventionStatus
                };

            case 'list_at_risk_students':
                const atRisk = students.filter(s => s.hasAnomaly || s.interventionStatus !== null);
                return { 
                    count: atRisk.length,
                    students: atRisk.map(s => ({ name: s.name, reason: s.interventionStatus?.triggerReason || "Performance Anomaly" }))
                };

            case 'get_domain_performance':
                const domain = args.domain as Domain;
                let dTotal = 0;
                let dCount = 0;
                students.forEach(s => {
                    const latest = s.assessments[s.assessments.length - 1];
                    if (latest && latest.scores[domain] !== undefined) {
                        dTotal += latest.scores[domain];
                        dCount++;
                    }
                });
                return { domain, average: dCount > 0 ? Math.round(dTotal / dCount) : "No data" };

            case 'search_resources':
                const query = args.query.toLowerCase();
                const matched = resources.filter(r => 
                    r.title.toLowerCase().includes(query) || 
                    r.description.toLowerCase().includes(query)
                );
                return { count: matched.length, results: matched.map(m => m.title).slice(0, 3) };

            default:
                return { message: "Tool logic not yet implemented." };
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
                        return { 
                            functionResponse: { 
                                name: call.name, 
                                response: { result: toolResult }, 
                                id: call.id 
                            } 
                        };
                    })
                );
                result = await chat.sendMessage({ message: functionResponseParts });
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: result.text || "I've processed your request.", 
                timestamp: Date.now() 
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "I encountered an error processing your request.", 
                timestamp: Date.now(), 
                isError: true 
            }]);
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