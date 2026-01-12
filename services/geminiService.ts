import { Student, Domain, Resource, ResourceType, TestPeriod } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";

// Lazy-load AI client to prevent top-level process.env access crashes
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
                student: { name: student.name, level: student.level, current_avg: avg },
                history: sortedAssessments.map(a => ({ period: a.type, date: a.date, scores: a.scores })),
                intervention: student.interventionStatus ? { active: true, reason: student.interventionStatus.triggerReason, goal: student.interventionStatus.goal } : { active: false }
            };

            const prompt = `Write a progress report for parents in plain English. Data: ${JSON.stringify(dataPayload)}`;
            
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING }, 
                            trend_insights: { type: Type.STRING } 
                        },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { 
            console.error("AI Analysis failed:", error);
            return { report_card: "Student is making steady progress.", trend_insights: "System fallback triggered." }; 
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
                contents: `Executive briefing for level ${gradeLevel}. Total students: ${studentCount}, At risk: ${atRiskCount}.`
            });
            return response.text || "Briefing unavailable.";
        } catch (error) { return "Unable to generate briefing."; }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create ${type} for Level ${level} in ${domain}: ${promptText}`,
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
                contents: `Level: ${level}, Subject: ${domain}, Avg: ${avgScore}. Write a request for a practice activity.`
            });
            return response.text?.trim() || "";
        } catch (error) { return `Create practice for ${domain}`; }
    }

    static async getRecommendedResources(domain: Domain, subdomain: string, level: string): Promise<Resource[]> {
        return []; // Fallback for stability
    }
}