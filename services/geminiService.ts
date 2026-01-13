import { Student, Domain, Resource, ResourceType, TestPeriod } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).process?.env?.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
};

export class GeminiService {
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = getAI();
            const model = 'gemini-3-flash-preview';
            const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const latest = sortedAssessments[sortedAssessments.length - 1];
            const scores = latest ? Object.values(latest.scores) as number[] : [];
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            const dataPayload = {
                student: { 
                    name: student.name, 
                    level: student.level, 
                    current_avg: avg,
                    velocity: student.growthVelocity,
                    intervention: student.interventionStatus 
                },
                history: sortedAssessments.map(a => ({ period: a.type, date: a.date, scores: a.scores }))
            };

            const prompt = `Perform a deep pedagogical analysis and write a progress report. Data: ${JSON.stringify(dataPayload)}`;
            
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 2000 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { 
                                type: Type.STRING, 
                                description: "A warm, professional report for parents." 
                            }, 
                            trend_insights: { 
                                type: Type.STRING, 
                                description: "Internal teacher notes on specific skill regressions or plateaus." 
                            } 
                        },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { 
            console.error("AI Analysis failed:", error);
            return { report_card: "Steady progress observed.", trend_insights: "System fallback active." }; 
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        focusAreas: string,
        growthAssets: string,
        atRiskCount: number
    ): Promise<string> {
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Executive briefing for level ${gradeLevel}. Total students: ${studentCount}, At risk: ${atRiskCount}. Highlight institutional health and resource efficacy.`,
                config: { thinkingConfig: { thinkingBudget: 1000 } }
            });
            return response.text || "Briefing unavailable.";
        } catch (error) { return "Unable to generate briefing."; }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create high-quality ${type} for Level ${level} in ${domain}: ${promptText}. Ensure it is curriculum-ready.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "description", "content"] }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { return null; }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Level: ${level}, Subject: ${domain}, Avg Score: ${avgScore}%. Write a natural language request for a practice activity that addresses the specific needs of students at this level.`
            });
            return response.text?.trim() || "";
        } catch (error) { return `Create practice for ${domain}`; }
    }
}