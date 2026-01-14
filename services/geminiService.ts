import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    private static getApiKey(): string {
        const key = process.env.API_KEY;
        if (!key || key === 'undefined' || key.length < 5) {
            throw new Error("ENVIRONMENT_CONFIG_MISSING");
        }
        return key;
    }

    private static handleAiError(error: any): never {
        console.error("Gemini API Error:", error);
        const msg = error.message || "";
        
        if (msg === "ENVIRONMENT_CONFIG_MISSING") {
            throw new Error("The AI Engine is awaiting final environment synchronization. Please verify Vercel 'API_KEY' settings.");
        }
        
        if (msg.includes("API_KEY") || msg.includes("unauthorized") || msg.includes("401")) {
             throw new Error("Authentication synchronization in progress. Please refresh the dashboard.");
        }
        
        throw new Error("The intelligence engine is currently optimizing. Please try again in 10 seconds.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const model = 'gemini-3-pro-preview';
            
            const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const latest = sortedAssessments[sortedAssessments.length - 1];
            const scores = latest ? Object.values(latest.scores) as number[] : [];
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            const prompt = `Persona: Senior Pedagogical Consultant. 
            Analyze student ${student.name} (Level ${student.level}).
            Current Proficiency: ${avg}%. Growth Velocity: ${student.growthVelocity}%.
            Task: 
            1. 'report_card': A formal, encouraging summary for parents.
            2. 'trend_insights': A technical analysis for teachers focusing on velocity and intervention efficacy.
            Constraint: NEVER use the word 'mastery'. Use 'Outstanding' (90%+) or 'Excellent' (80%+). 
            Context: This report is for a high-level academic review.`;
            
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { report_card: { type: Type.STRING }, trend_insights: { type: Type.STRING } },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            
            return JSON.parse(sanitizeJson(response.text || '{}'));
        } catch (error) { 
            return this.handleAiError(error);
        }
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const model = 'gemini-3-flash-preview';

            const prompt = `Write an 'Executive Performance Briefing' for a School Director.
            Class: Level ${gradeLevel} | Cohort Size: ${studentCount}
            Class Average Proficiency: ${stats.classAvg}%
            Aggregate Velocity: ${stats.avgVelocity}% / cycle
            Risk Profile: ${stats.interventionCount} students requiring Tier 2/3 support.
            
            Focus Areas: ${stats.weakest || 'Universal progression'}.
            
            Instructions: 
            - Use sophisticated institutional language (e.g., 'pedagogical milestones', 'learning acceleration', 'risk mitigation').
            - Structure with: 1. Institutional Health Summary, 2. Growth Forecast, 3. Strategic Recommendations.
            - Ensure names of high performers are mentioned to celebrate success.`;

            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Briefing calculation incomplete.";
        } catch (error) { 
            return this.handleAiError(error);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Generate specialized material (${type}) for Level ${level} in ${domain}. Focus: ${promptText}. Ensure high academic rigor.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, content: { type: Type.STRING } }, 
                        required: ["title", "description", "content"] 
                    }
                }
            });
            return JSON.parse(sanitizeJson(response.text || '{}'));
        } catch (error) { return null; }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Class is at ${avgScore}% in ${domain}. Suggest a remediation focus for Level ${level}.`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create practice for ${domain}`; }
    }
}