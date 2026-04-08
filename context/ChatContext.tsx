
import React, { createContext, useContext, useState } from 'react';
import { ChatMessage, Domain } from '../types.ts';
import { GoogleGenAI } from "@google/genai";
import { logger } from '../services/logger';
import { teacherTools } from '../services/agentTools.ts';
import { useStudents } from './StudentContext.tsx';
import { useBenchmarks } from './BenchmarkContext.tsx';
import { useResources } from './ResourceContext.tsx';

interface ChatContextType {
    isOpen: boolean;
    toggleChat: () => void;
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SYSTEM_INSTRUCTION = `You are the Benchmark AI Co-pilot, an elite pedagogical intelligence engine.
PRIVACY PROTOCOL: You operate in a strict zero-knowledge sandbox. Never mention student data from previous conversations.
DATA ACCESS: You have real-time classroom tools. Use them to get actual metrics before responding.
STYLE: Respond as a professional educational consultant. 
PRIORITY: Focus on "Growth Velocity" and "Intervention Tiers".
Follow every answer with a specific pedagogical "next step".
If a tool returns "not found", suggest checking the institutional roster.`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { benchmarks } = useBenchmarks();
    const { resources } = useResources();
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
                const studentNameQuery = args.studentName?.toLowerCase() || "";
                const student = students.find(s => s.name.toLowerCase().includes(studentNameQuery));
                if (!student) return { error: `Student context matching "${args.studentName}" not found in current roster.` };
                return {
                    name: student.name,
                    level: student.level,
                    velocity: `${student.growthVelocity}%`,
                    latestScores: student.assessments[student.assessments.length - 1]?.scores || "No data logged.",
                    tier: student.interventionStatus?.tier || 1
                };
            case 'get_benchmark_standards':
                const found = benchmarks.find(b => b.level_name === args.level && b.domain === args.domain);
                return found || { error: "Instructional standard not found for this calibration." };
            case 'get_domain_performance':
                const domain = args.domain as Domain;
                let total = 0, count = 0;
                students.forEach(s => {
                    const latest = s.assessments[s.assessments.length - 1];
                    if (latest?.scores && latest.scores[domain] !== undefined) {
                        total += latest.scores[domain];
                        count++;
                    }
                });
                return {
                    domain,
                    averageScore: count > 0 ? `${Math.round(total / count)}%` : "No data",
                    studentCount: count
                };
            case 'search_resources':
                const queryStr = args.query.toLowerCase();
                const filtered = resources.filter(r => 
                    r.title.toLowerCase().includes(queryStr) || 
                    r.description.toLowerCase().includes(queryStr)
                );
                return filtered.map(r => ({ title: r.title, domain: r.domain, level: r.level }));
            default:
                return { error: "Logic node not implemented." };
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
            const model = 'gemini-3-flash-preview';
            
            let response = await ai.models.generateContent({
                model,
                contents: text,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ functionDeclarations: teacherTools }],
                }
            });

            let finalContent = response.text;

            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResults = response.functionCalls.map(fc => ({
                    id: fc.id,
                    name: fc.name,
                    response: { result: executeTool(fc.name, fc.args) }
                }));

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
                text: finalContent || "Logic synthesis complete. Please review the roster for specific student trends.", 
                timestamp: Date.now() 
            }]);
        } catch (error: any) {
            logger.error("Chat Node Failure", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "Safety protocols or reasoning pathways are currently saturated. Please re-initiate in a moment.", 
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
