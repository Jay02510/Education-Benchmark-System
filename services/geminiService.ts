import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    private static clientPromise: Promise<GoogleGenAI> | null = null;

    /**
     * Parallel Warm-up: Initiates the client handshake without blocking the UI.
     */
    static warmup() {
        if (!this.clientPromise) {
            this.clientPromise = this.getClient();
        }
    }

    private static async getClient(): Promise<GoogleGenAI> {
        const win = window as any;

        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) await win.aistudio.openSelectKey();
        }

        const apiKey = (win.process && win.process.env && win.process.env.API_KEY) || 
                       (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                       win.API_KEY;

        if (!apiKey || apiKey.length < 5) {
            throw new Error("Connectivity Identity missing.");
        }

        return new GoogleGenAI({ apiKey });
    }

    private static async handleError(error: any): Promise<never> {
        console.error("[Gemini SDK Protocol Error]", error);
        const win = window as any;
        if (win.aistudio && (error.message?.includes("401") || error.message?.includes("403"))) {
            await win.aistudio.openSelectKey();
        }
        throw new Error(error.message || "AI Engine unavailable.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = await (this.clientPromise || this.getClient());
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Perform high-level pedagogical analysis for ${student.name} (Lvl ${student.level}). Proficiency: ${student.overallGrowth}%. Velocity: ${student.growthVelocity}%. Output report_card and trend_insights.`,
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
            const ai = await (this.clientPromise || this.getClient());
            
            // Parallel Execution: We could fetch multiple types of insights here if needed
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Generate an Executive Performance Briefing for a class of ${studentCount} at Benchmark Level ${gradeLevel}. Avg Proficiency: ${stats.classAvg}%. Velocity: ${stats.avgVelocity}%. Strongest: ${stats.strongest}. Weakest: ${stats.weakest}.`
            });
            return response.text || "Analysis complete.";
        } catch (error: any) { 
            return this.handleError(error);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = await (this.clientPromise || this.getClient());
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create academic content (${type}) for Level ${level} ${domain}. Subject: ${subdomain}. Prompt: ${promptText}.`,
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
            const ai = await (this.clientPromise || this.getClient());
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Suggest remedial focus for Level ${level} students struggling with ${domain} (Avg: ${avgScore}%).`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create targeted practice for ${domain}`; }
    }
}