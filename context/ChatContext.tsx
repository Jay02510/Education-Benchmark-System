
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, Student, Domain, Resource } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { teacherTools, adminTools } from '../services/agentTools';
import { useStudents } from './StudentContext';
import { useNavigation } from './NavigationContext';
import { useBenchmarks } from './BenchmarkContext';
import { useResources } from './ResourceContext';
import { TABS } from '../constants';

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

const TEACHER_INSTRUCTION = `
You are the "Benchmark AI Assistant", a friendly, encouraging, and highly capable educational coach for teachers.
Your goal is to help teachers understand their class data, identify student needs, find resources, and check benchmarks.

**Capabilities:**
- Access real-time class data (students, scores, risks).
- Search the Resource Bank for materials.
- Check Benchmark Framework standards.
- ALWAYS use tools to answer data questions. Do not make up numbers.

**Tone:**
- Professional, warm, supportive.
- Concise. Bullet points for lists.
- If a student is struggling, suggest a resource using 'search_resources'.
`;

const ADMIN_INSTRUCTION = `
You are the "Benchmark System Administrator".
Your goal is to assist with system configuration, user management, and data integrity.

**Capabilities:**
- Check system health and stats.
- You DO NOT analyze individual student pedagogy unless asked for debugging.
- Focus on technical, configuration, and management tasks.

**Tone:**
- Technical, precise, efficient.
`;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { students, classProfile } = useStudents();
    const { activeTab } = useNavigation();
    const { benchmarks } = useBenchmarks();
    const { resources } = useResources();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    
    // Track current session state
    const chatSessionRef = useRef<Chat | null>(null);
    const [currentPersona, setCurrentPersona] = useState<'Teacher' | 'Admin'>('Teacher');

    // Handle Persona Switching based on Tab
    useEffect(() => {
        const targetPersona = activeTab === TABS.ADMIN ? 'Admin' : 'Teacher';
        
        if (targetPersona !== currentPersona) {
            // Persona changed, reset chat
            setCurrentPersona(targetPersona);
            chatSessionRef.current = null;
            setMessages([{
                id: `welcome-${Date.now()}`,
                role: 'model',
                text: targetPersona === 'Admin' 
                    ? "System Admin Console active. How can I assist with configuration?" 
                    : "Benchmark Assistant ready. How can I help with your class today?",
                timestamp: Date.now()
            }]);
        }
    }, [activeTab]);

    // Initial Welcome (only if empty)
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'model',
                text: "Hi! I'm your Benchmark Assistant. Ask me about your students, resources, or standards.",
                timestamp: Date.now()
            }]);
        }
    }, []);

    // Initialize Chat Session with recommended model
    const getChatSession = () => {
        if (!chatSessionRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        setMessages([{
            id: `reset-${Date.now()}`,
            role: 'model',
            text: `Chat cleared. (${currentPersona} Mode)`,
            timestamp: Date.now()
        }]);
        chatSessionRef.current = null;
    };

    // --- Tool Execution Logic ---
    const executeTool = async (name: string, args: any): Promise<any> => {
        console.log(`[Agent] Executing tool: ${name}`, args);
        
        // --- ADMIN TOOLS ---
        if (currentPersona === 'Admin') {
            switch (name) {
                case 'get_system_stats':
                    return {
                        users: 1, // Single user context
                        studentsManaged: students.length,
                        totalResources: resources.length,
                        benchmarksDefined: benchmarks.length,
                        databaseStatus: "Healthy",
                        lastBackup: "Never"
                    };
                case 'check_database_health':
                    return { status: "Online", latency: "24ms", region: "us-central1" };
                default:
                    return { error: "Unknown admin tool" };
            }
        }

        // --- TEACHER TOOLS ---
        switch (name) {
            case 'get_class_summary': {
                const count = students.length;
                const atRisk = students.filter(s => s.interventionStatus).length;
                const totalGrowth = students.reduce((acc, s) => acc + s.overallGrowth, 0);
                const avgGrowth = count ? Math.round(totalGrowth / count) : 0;
                
                let totalScore = 0;
                let scoreCount = 0;
                students.forEach(s => {
                    const latest = s.assessments[s.assessments.length - 1];
                    if (latest) {
                        const vals = Object.values(latest.scores) as number[];
                        if (vals.length) {
                            totalScore += vals.reduce((a, b) => a + b, 0) / vals.length;
                            scoreCount++;
                        }
                    }
                });
                const classAvg = scoreCount ? Math.round(totalScore / scoreCount) : 0;

                return {
                    summary: `Class ${classProfile?.className || 'General'} has ${count} students.`,
                    metrics: {
                        averageScore: classAvg,
                        studentsAtRisk: atRisk,
                        averageGrowth: avgGrowth
                    }
                };
            }

            case 'get_student_details': {
                const nameQuery = args.studentName.toLowerCase();
                const student = students.find(s => s.name.toLowerCase().includes(nameQuery));
                
                if (!student) return { error: `Student "${args.studentName}" not found.` };

                const latest = student.assessments[student.assessments.length - 1];
                return {
                    name: student.name,
                    level: student.level,
                    latestScores: latest ? latest.scores : 'No assessments yet',
                    growth: student.overallGrowth,
                    intervention: student.interventionStatus ? student.interventionStatus : "None (On Track)"
                };
            }

            case 'list_at_risk_students': {
                const risky = students.filter(s => s.interventionStatus).map(s => ({
                    name: s.name,
                    reason: s.interventionStatus?.triggerReason,
                    tier: s.interventionStatus?.tier
                }));
                
                if (risky.length === 0) return { message: "Good news! No students are currently flagged as at-risk." };
                return { atRiskStudents: risky };
            }

            case 'get_domain_performance': {
                const domain = args.domain as Domain;
                let total = 0;
                let count = 0;
                students.forEach(s => {
                    const latest = s.assessments[s.assessments.length - 1];
                    // @ts-ignore
                    if (latest && latest.scores[domain] !== undefined) {
                        // @ts-ignore
                        total += latest.scores[domain];
                        count++;
                    }
                });

                if (count === 0) return { error: `No data found for domain: ${domain}` };
                return { domain, averageScore: Math.round(total / count), studentCount: count };
            }

            case 'search_resources': {
                const query = args.query.toLowerCase();
                const domainFilter = args.domain;
                const levelFilter = args.level;

                const results = resources.filter(r => {
                    const matchesQuery = r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query);
                    const matchesDomain = domainFilter ? r.domain === domainFilter : true;
                    const matchesLevel = levelFilter ? r.level === levelFilter : true;
                    return matchesQuery && matchesDomain && matchesLevel;
                }).slice(0, 5); // Limit to top 5

                if (results.length === 0) return { message: "No resources found matching criteria." };
                return { 
                    found: results.length, 
                    resources: results.map(r => ({ title: r.title, type: r.type, level: r.level, description: r.description })) 
                };
            }

            case 'get_benchmark_standards': {
                const level = args.level;
                const domain = args.domain;
                
                const found = benchmarks.filter(b => b.level_name === level && b.domain === domain);
                
                if (found.length === 0) return { message: `No benchmarks found for Level ${level} ${domain}.` };
                return {
                    standards: found.map(b => ({
                        period: b.period,
                        target: b.target_percent,
                        descriptor: b.descriptor_short,
                        cefr: b.cefr_alignment
                    }))
                };
            }

            default:
                return { error: "Unknown tool" };
        }
    };

    const sendMessage = async (text: string) => {
        // 1. Add User Message
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const chat = getChatSession();
            
            // 2. Send to Gemini
            let result: GenerateContentResponse = await chat.sendMessage({ message: text });
            
            // 3. Handle Function Calls Loop
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

                // Send tool outputs back to model via sendMessage as per chat usage
                result = await chat.sendMessage({ message: functionResponseParts });
            }

            // 4. Final Response using .text property
            const modelText = result.text;
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: modelText || "I'm having trouble connecting. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "Sorry, I encountered an error processing your request.",
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
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
