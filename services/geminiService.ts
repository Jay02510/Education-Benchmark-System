import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class GeminiService {
    private static instance: GoogleGenAI | null = null;
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 200; 

    private static async getClient(): Promise<GoogleGenAI> {
        const win = window as any;

        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) await win.aistudio.openSelectKey();
        }

        const apiKey = (win.process && win.process.env && win.process.env.API_KEY) || 
                       (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                       win.API_KEY;

        if (!apiKey || String(apiKey).length < 5) {
            throw new Error("Connectivity Identity not found.");
        }

        if (!this.instance) {
            this.instance = new GoogleGenAI({ apiKey });
        }
        return this.instance;
    }

    private static async callWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
        try {
            const now = Date.now();
            const timeSinceLast = now - this.lastRequestTime;
            if (timeSinceLast < this.MIN_REQUEST_GAP) {
                await delay(this.MIN_REQUEST_GAP - timeSinceLast);
            }
            this.lastRequestTime = Date.now();

            return await fn();
        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("rate limit");
            const isOverloaded = error.message?.includes("503") || error.message?.toLowerCase().includes("overloaded");

            if ((isRateLimit || isOverloaded) && retries > 0) {
                console.warn(`[Gemini] Rate limited. Retrying in ${backoff}ms... (${retries} retries left)`);
                await delay(backoff);
                return this.callWithRetry(fn, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    private static async handleError(error: any): Promise<never> {
        console.error("[Gemini Protocol Error]", error);
        const win = window as any;
        
        const isAuthError = error.message?.includes("401") || error.message?.includes("403") || error.message?.includes("not found");
        if (win.aistudio && isAuthError) {
            this.instance = null; 
            await win.aistudio.openSelectKey();
        }
        
        if (error.message?.includes("429")) {
            throw new Error("AI Engine is currently at maximum capacity. Please wait a moment.");
        }

        throw new Error(error.message || "AI Engine communication failure.");
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Provide a 1-sentence pedagogical micro-narrative for the following data. Focus on "What to do next". Context: ${context}`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "No immediate directive.";
        }).catch(() => "Continue monitoring current trajectory.");
    }

    static async generateInsightForChart(chartTitle: string, dataPoints: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Interpret this chart "${chartTitle}". Data: ${dataPoints}. Answer "So what should I do?" in 2 sentences or less.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Continue current plan.";
        }).catch(() => "Data suggests steady progress.");
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `High-level pedagogical analysis for ${student.name} (Lvl ${student.level}). Proficiency: ${student.overallGrowth}%. Velocity: ${student.growthVelocity}%. Provide 'report_card' and 'trend_insights'.`,
                config: {
                    thinkingConfig: { thinkingBudget: 0 },
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
        }).catch(err => this.handleError(err));
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Executive Performance Briefing for class of ${studentCount} at Level ${gradeLevel}. Avg: ${stats.classAvg}%. Velocity: ${stats.avgVelocity}%. Strongest: ${stats.strongest}. Weakest: ${stats.weakest}. Focus on institutional risk.`
            });
            return response.text || "Analysis complete.";
        }).catch(err => this.handleError(err));
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Generate ${type} content for Level ${level} ${domain} (${subdomain}). Prompt context: ${promptText}.`,
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
        }).catch(() => null);
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Suggest focus area for Level ${level} students struggling with ${domain} (Avg: ${avgScore}%).`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        }).catch(() => `Create practice for ${domain}`);
    }
}