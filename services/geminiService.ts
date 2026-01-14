
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Resolves the API key and creates a fresh client.
     * Prioritizes the environment variable but falls back to the system handshake.
     */
    private static async getClient(): Promise<GoogleGenAI> {
        // Check for high-tier key selection handshake
        if (typeof window !== 'undefined' && (window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                // Mandatory step for production/Vercel environments
                await (window as any).aistudio.openSelectKey();
                // Proceed immediately per instructions (mitigate race condition)
            }
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey.length < 5) {
            throw new Error("Connectivity Identity required. Please click the status badge to connect your engine.");
        }

        return new GoogleGenAI({ apiKey });
    }

    /**
     * Common error handler to detect when a key needs to be re-selected.
     * Fix: Explicitly typed as Promise<never> to satisfy TS return requirements in calling functions.
     */
    private static async handleError(error: any): Promise<never> {
        console.error("Gemini Service Error:", error);
        
        // Specific requirement: if "entity not found", re-trigger key selection
        if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY")) {
            if (typeof window !== 'undefined' && (window as any).aistudio) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        throw new Error(error.message || "The AI engine encountered a communication error.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = await this.getClient();
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
            Constraint: Use professional academic terminology. Focus on learning acceleration.`;
            
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
        } catch (error: any) { 
            // Fix: Calling async handleError which returns Promise<never>
            return this.handleError(error);
        }
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        try {
            const ai = await this.getClient();
            const model = 'gemini-3-flash-preview';

            const prompt = `Write an 'Executive Performance Briefing' for school leadership.
            Class: Level ${gradeLevel} | Cohort Size: ${studentCount}
            Avg Proficiency: ${stats.classAvg}% | Velocity: ${stats.avgVelocity}%
            Risk Profile: ${stats.interventionCount} students requiring support.
            
            Structure: 1. Institutional Health, 2. Growth Forecast, 3. Strategic Recommendations.`;

            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Briefing analysis completed.";
        } catch (error: any) { 
            // Fix: Calling async handleError which returns Promise<never>
            return this.handleError(error);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = await this.getClient();
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
        } catch (error) { 
            console.error("Resource Gen Error:", error);
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Class average is ${avgScore}% in ${domain}. Generate a professional intervention focus for Level ${level}.`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create practice for ${domain}`; }
    }
}
