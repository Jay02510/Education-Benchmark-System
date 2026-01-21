
import React, { createContext, useContext, useState } from 'react';
import { ChatMessage } from '../types.ts';
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
When asked about students or performance, ALWAYS use a tool first to get accurate data.
Be concise, professional, and focus on "Growth Velocity" and "Intervention Tiers".
Always conclude your data-heavy answers with a 1-sentence pedagogical "next step".`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks } = useBenchmarks();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const executeTool = (name: string, args: any) => {
        switch (name) {
            case 'get_class_summary':
                const avgVel = students.length ? Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length) : 0;
                return {
                    className: classProfile?.className || "General",
                    studentCount: students.length,
                    averageVelocity: `${avgVel}%`,
                    atRiskCount: students.filter(s => s.hasAnomaly).length
                };
            case 'list_at_risk_students':
                return students
                    .filter(s => s.hasAnomaly)
                    .map(s => ({ name: s.name, reason: s.interventionStatus?.triggerReason, tier: s.interventionStatus?.tier }));
            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName?.toLowerCase() || ""));
                if (!student) return { error: "Student not found in institutional roster." };
                return {
                    name: student.name,
                    velocity: `${student.growthVelocity}%`,
                    latestScores: student.assessments[student.assessments.length - 1]?.scores || "No assessment data on file.",
                    tier: student.interventionStatus?.tier || 1
                };
            case 'get_benchmark_standards':
                const found = benchmarks.find(b => b.level_name === args.level && b.domain === args.domain);
                return found || { error: "No benchmark standard found for this combination." };
            default:
                return { error: "Execution Protocol: Tool not found." };
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Priority Check for API Key
            const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
            
            if (!apiKey) {
                throw new Error("Logic Engine Fault: API Key is missing. Check deployment VITE_API_KEY.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const model = 'gemini-3-flash-preview';
            
            // Turn 1: Check for Tool Calls
            let response = await ai.models.generateContent({
                model,
                contents: text,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: teacherTools }],
                }
            });

            let finalContent = response.text;

            // Handle Multi-Turn Tool Execution
            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResults = response.functionCalls.map(fc => ({
                    id: fc.id,
                    name: fc.name,
                    response: { result: executeTool(fc.name, fc.args) }
                }));

                // Turn 2: Synthesize final answer with tool data
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
                text: finalContent || "Instructional analysis complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("Benchmark AI Fault:", error);
            let displayError = "Request failed. Please verify your connection or API key settings.";
            
            if (error.message?.includes("API Key is missing")) {
                displayError = "Security Fault: VITE_API_KEY not detected in engine environment. Please verify project environment variables.";
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: displayError, 
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
