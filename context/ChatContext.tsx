
import React, { createContext, useContext, useState, useEffect } from 'react';
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
    isAiActive: boolean;
    reconnect: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SYSTEM_INSTRUCTION = `You are the Benchmark AI Co-pilot, an elite pedagogical intelligence engine for ESL schools.
You have access to real-time classroom data through tools. 
When asked about students or performance, ALWAYS use a tool first to get accurate data.
Be concise, professional, and focus on "Growth Velocity" and "Intervention Tiers".
If a student is regressing, suggest specific domains for focus.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { domains } = useBenchmarks();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isAiActive, setIsAiActive] = useState(false);

    // Verify if API Key is present on boot
    useEffect(() => {
        const key = process.env.API_KEY;
        setIsAiActive(!!key && key !== "undefined" && key !== "");
    }, []);

    // Tool Implementation Logic
    const executeTool = (name: string, args: any) => {
        switch (name) {
            case 'get_class_summary':
                const avg = students.length ? Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length) : 0;
                return {
                    className: classProfile?.className || "General",
                    studentCount: students.length,
                    averageVelocity: `${avg}%`,
                    atRiskCount: students.filter(s => s.hasAnomaly).length
                };
            case 'list_at_risk_students':
                return students
                    .filter(s => s.hasAnomaly)
                    .map(s => ({ name: s.name, reason: s.interventionStatus?.triggerReason, tier: s.interventionStatus?.tier }));
            case 'get_student_details':
                const student = students.find(s => s.name.toLowerCase().includes(args.studentName.toLowerCase()));
                if (!student) return { error: "Student not found in roster." };
                return {
                    name: student.name,
                    velocity: `${student.growthVelocity}%`,
                    latestScores: student.assessments[student.assessments.length - 1]?.scores || "No assessments recorded",
                    tier: student.interventionStatus?.tier || 1
                };
            default:
                return { error: "Tool not implemented" };
        }
    };

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Initial call to see if model wants to use tools
            let response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: text,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: teacherTools }],
                }
            });

            let finalContent = response.text;

            // Handle Function Calls (Loop for potential multi-turn tools)
            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResults = response.functionCalls.map(fc => ({
                    id: fc.id,
                    name: fc.name,
                    response: { result: executeTool(fc.name, fc.args) }
                }));

                // Get final text response with the tool data
                const secondResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: [
                        { role: 'user', parts: [{ text }] },
                        { role: 'model', parts: response.candidates[0].content.parts },
                        { role: 'user', parts: toolResults.map(tr => ({
                            functionResponse: tr
                        }))}
                    ],
                    config: { systemInstruction: SYSTEM_INSTRUCTION }
                });
                finalContent = secondResponse.text;
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: finalContent || "Analysis complete.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `Engine Offline: ${error.message || "Ensure VITE_API_KEY is configured."}`, 
                timestamp: Date.now(), 
                isError: true 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const reconnect = async () => {
        const key = process.env.API_KEY;
        if (key && key !== "undefined") {
            setIsAiActive(true);
            showSystemMessage("Engine synchronized successfully.");
        } else if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setIsAiActive(true);
        }
    };

    const showSystemMessage = (text: string) => {
        setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'model', text, timestamp: Date.now() }]);
    };

    const toggleChat = () => setIsOpen(!isOpen);
    const clearHistory = () => setMessages([]);

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, messages, isTyping, sendMessage, clearHistory, isAiActive, reconnect }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) throw new Error('useChat must be used within a ChatProvider');
    return context;
};
