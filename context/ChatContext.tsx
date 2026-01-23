
import React, { createContext, useContext, useState } from 'react';
import { ChatMessage, Domain } from '../types.ts';
import { GoogleGenAI } from "@google/genai";
import { teacherTools } from '../services/agentTools.ts';
import { useStudents } from './StudentContext.tsx';
import { useBenchmarks } from './BenchmarkContext.tsx';

interface ChatContextType {
    isOpen: boolean;
    toggleChat: () => void;
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SYSTEM_INSTRUCTION = `You are the Benchmark AI Co-pilot, an elite pedagogical intelligence engine for ESL schools.
You have access to real-time classroom data through tools. 
When asked about students, performance, or standards, ALWAYS use the relevant tool first to get actual data.
Respond as a professional educational consultant. Focus on "Growth Velocity" and "Intervention Tiers".
Always provide a specific answer followed by one pedagogical "next step".
If a tool returns "not found", inform the user politely and suggest checking the roster.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { benchmarks } = useBenchmarks();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const executeTool = (name: string, args: any) => {
        switch (name) {
            case 'get_class_summary':
                const avgVel = students.length ? Math.round(students.reduce((a, b) => a + (b.growthVelocity || 0), 0) / students.length) : 0;
                return {
                    className: classProfile?.className || "General",
                    studentCount: students.length,
                    averageVelocity: `${avgVel}%`,
                    atRiskCount: students.filter(s => s.hasAnomaly || (s.interventionStatus && s.interventionStatus.tier > 1)).length
                };
            case 'list_at_risk_students':
                return students
                    .filter(s => s.hasAnomaly || (s.interventionStatus && s.interventionStatus.tier > 1))
                    .map(s => ({ name: s.name, reason: s.interventionStatus?.triggerReason || 'Velocity Drop', tier: s.interventionStatus?.tier || 2 }));
            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName?.toLowerCase() || ""));
                if (!student) return { error: `Student "${args.studentName}" not found.` };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    latestScores: student.assessments[student.assessments.length - 1]?.scores || "No data.",
                    tier: student.interventionStatus?.tier || 1
                };
            case 'get_benchmark_standards':
                const found = benchmarks.find(b => b.level_name === args.level && b.domain === args.domain);
                return found || { error: "Standard not found." };
            default:
                return { error: "Tool not implemented." };
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Updated: Always create a fresh instance with the required API key named parameter
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-3-pro-preview';
            
            // Turn 1: Initial tool detection and reasoning turn
            let response = await ai.models.generateContent({
                model,
                contents: text,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: teacherTools }],
                }
            });

            let finalContent = response.text;

            // Handle tool execution loop if the model requested function calls
            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResults = response.functionCalls.map(fc => ({
                    id: fc.id,
                    name: fc.name,
                    response: { result: executeTool(fc.name, fc.args) }
                }));

                // Turn 2: Provide tool results back to the model for final synthesis
                const secondResponse = await ai.models.generateContent({
                    model,
                    contents: [
                        { role: 'user', parts: [{ text }] },
                        { role: 'model', parts: response.candidates[0].content.parts },
                        { 
                          role: 'user', 
                          parts: toolResults.map(tr => ({ functionResponse: tr }))
                        }
                    ],
                    config: { systemInstruction: SYSTEM_INSTRUCTION }
                });
                finalContent = secondResponse.text;
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: finalContent || "Analysis complete. Reviewing context for pedagogical alignment.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Benchmark AI Node Failure:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "My neural pathways are temporarily saturated. Please refresh the connection or retry in a moment.", 
                timestamp: Date.now(), 
                isError: true 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);
    const clearHistory = () => setMessages([]);

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};
