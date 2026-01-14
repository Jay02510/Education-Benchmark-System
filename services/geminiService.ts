import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Direct retrieval of the API key from environment.
     * In Vercel, ensures the build-time variable is accessible.
     */
    private static getApiKey(): string {
        // Standard check for the injected environment variable
        const key = process.env.API_KEY;
        
        if (!key || key === 'undefined' || key.length < 5) {
            console.error("Critical: API_KEY is missing from environment.");
            throw new Error("AI_SYNC_PENDING");
        }
        return key;
    }

    private static handleAiError(error: any): never {
        console.error("Gemini API Error:", error);
        const msg = error.message || "";
        
        if (msg === "AI_SYNC_PENDING") {
            throw new Error("The AI Engine is awaiting final environment synchronization. Please verify Vercel 'API_KEY' settings and redeploy.");
        }
        
        if (msg.includes("API_KEY") || msg.includes("401") || msg.includes("unauthorized")) {
             throw new Error("Security handshake in progress. Please refresh the dashboard in a moment.");
        }
        
        throw new Error("Strategic analysis engine is optimizing. Please re-run the request.");
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
            1. 'report_card': A formal, professional summary for parents.
            2. 'trend_insights': A technical analysis for teachers focusing on velocity and intervention efficacy.
            Constraint: Use 'Outstanding' (90%+) or 'Excellent' (80%+). Focus on learning acceleration.`;
            
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

            const prompt = `Write an 'Executive Performance Briefing' for school leadership.
            Class: Level ${gradeLevel} | Cohort Size: ${studentCount}
            Avg Proficiency: ${stats.classAvg}% | Velocity: ${stats.avgVelocity}%
            Risk Profile: ${stats.interventionCount} students requiring support.
            
            Structure: 1. Institutional Health, 2. Growth Forecast, 3. Strategic Recommendations. 
            Use sophisticated, data-driven language. Mention high-velocity students for recognition.`;

            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Briefing compilation incomplete.";
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
                contents: `Create academic material (${type}) for Level ${level} ${domain}. Context: ${promptText}.`,
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
                contents: `Class average is ${avgScore}% in ${domain}. Generate a professional intervention focus for Level ${level}.`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create practice for ${domain}`; }
    }
}