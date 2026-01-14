import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Resolves the API key and creates a fresh client instance.
     * Mandatory for ensuring up-to-date keys from the UI dialog.
     */
    private static async getClient(): Promise<GoogleGenAI> {
        const win = window as any;

        // 1. Mandatory Handshake for Google AI Studio environments
        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await win.aistudio.openSelectKey();
            }
        }

        // 2. Strict key retrieval
        const apiKey = process.env.API_KEY;

        if (!apiKey || apiKey.length < 5) {
            throw new Error("Connectivity Identity missing. Please ensure API_KEY is set in Vercel or connected via the AI Status button.");
        }

        return new GoogleGenAI({ apiKey });
    }

    private static async handleError(error: any): Promise<never> {
        console.error("[Gemini SDK Exception]", error);
        
        const win = window as any;
        const isAuthError = error.message?.includes("entity was not found") || 
                           error.message?.includes("API key not valid") ||
                           error.message?.includes("401");

        // If the key is invalid or lost, trigger the selection dialog again
        if (isAuthError && win.aistudio) {
            await win.aistudio.openSelectKey();
        }

        throw new Error(error.message || "The AI engine encountered a critical communication error.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Analyze student ${student.name} (Level ${student.level}). Proficiency: ${student.overallGrowth}%. Growth Velocity: ${student.growthVelocity}%. Provide 'report_card' (for parents) and 'trend_insights' (for teachers).`,
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
            return JSON.parse(sanitizeJson(response.text || '{}'));
        } catch (error: any) { 
            return this.handleError(error);
        }
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Write an 'Executive Performance Briefing' for a class of ${studentCount} at Level ${gradeLevel}. Avg: ${stats.classAvg}%. Velocity: ${stats.avgVelocity}%.`
            });
            return response.text || "Analysis complete.";
        } catch (error: any) { 
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
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Generate an intervention focus for Level ${level} students struggling with ${domain} (Avg: ${avgScore}%).`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create practice for ${domain}`; }
    }
}