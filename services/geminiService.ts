import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Resolves the connectivity identity. 
     * Prioritizes process.env.API_KEY as per mandatory guidelines.
     */
    private static async getClient(): Promise<GoogleGenAI> {
        const win = window as any;

        // 1. AI Studio Handshake (Mandatory for Preview)
        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await win.aistudio.openSelectKey();
            }
        }

        // 2. Multi-point Key Resolution
        const apiKey = (win.process && win.process.env && win.process.env.API_KEY) || 
                       (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                       win.API_KEY;

        if (!apiKey || apiKey.length < 5) {
            throw new Error("Connectivity Identity not found. Access Environment Variables in Vercel to verify.");
        }

        return new GoogleGenAI({ apiKey });
    }

    private static async handleError(error: any): Promise<never> {
        console.error("[Gemini SDK Protocol Error]", error);
        
        const win = window as any;
        const isAuthError = 
            error.message?.includes("entity was not found") || 
            error.message?.includes("API key not valid") ||
            error.message?.includes("401") ||
            error.message?.includes("403");

        if (isAuthError && win.aistudio) {
            await win.aistudio.openSelectKey();
        }

        throw new Error(error.message || "Protocol Failure: AI Engine unavailable.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Perform high-level pedagogical analysis for ${student.name} (Lvl ${student.level}). Proficiency: ${student.overallGrowth}%. Velocity: ${student.growthVelocity}%. Output report_card and trend_insights.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING, description: "Professional summary for parents." }, 
                            trend_insights: { type: Type.STRING, description: "Strategic insight for teachers." } 
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
                contents: `Generate an Executive Performance Briefing for a class of ${studentCount} at Benchmark Level ${gradeLevel}. Avg Proficiency: ${stats.classAvg}%. Velocity: ${stats.avgVelocity}%.`
            });
            return response.text || "Diagnostic summary complete.";
        } catch (error: any) { 
            return this.handleError(error);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create academic content (${type}) for Level ${level} in the ${domain} domain. Subject: ${subdomain}. Prompt: ${promptText}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { 
                            title: { type: Type.STRING }, 
                            description: { type: Type.STRING }, 
                            content: { type: Type.STRING } 
                        }, 
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
                contents: `Suggest a remedial focus for Level ${level} students struggling with ${domain} (Class Avg: ${avgScore}%).`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create targeted practice for ${domain}`; }
    }
}