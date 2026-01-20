import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class GeminiService {
    private static instance: GoogleGenAI | null = null;
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 300; 
    private static insightCache: Record<string, string> = {};

    private static async getClient(): Promise<GoogleGenAI> {
        const win = window as any;
        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) await win.aistudio.openSelectKey();
        }
        const apiKey = (win.process && win.process.env && win.process.env.API_KEY) || 
                       (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                       win.API_KEY;
        if (!apiKey || String(apiKey).length < 5) throw new Error("Connectivity Identity not found.");
        if (!this.instance) this.instance = new GoogleGenAI({ apiKey });
        return this.instance;
    }

    private static async callWithRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_GAP) await delay(this.MIN_REQUEST_GAP - timeSinceLast);
        this.lastRequestTime = Date.now();

        try {
            return await fn();
        } catch (error: any) {
            if ((error.message?.includes("429") || error.message?.includes("503")) && retries > 0) {
                await delay(backoff);
                return this.callWithRetry(fn, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        if (this.insightCache[context]) return this.insightCache[context];

        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Provide a 1-sentence pedagogical micro-narrative. Context: ${context}`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            const result = response.text || "No immediate directive.";
            this.insightCache[context] = result;
            return result;
        }).catch(() => "Monitoring current trajectory.");
    }

    // New: Added class-wide insight generation for Analytics briefings
    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze class performance for Grade ${gradeLevel} with ${studentCount} students. Stats: ${JSON.stringify(stats)}. Provide a professional, high-level briefing for school leadership including trends and areas of focus.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Class metrics are currently within expected parameters.";
        }).catch(() => "Unable to synthesize class insights at this time.");
    }

    // New: Added remedial prompt generation for specific class weaknesses
    static async generateRemedialPrompt(domain: string, avgScore: number, level: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Suggest a 1-sentence teaching prompt for generating instructional resources in ${domain} for Level ${level} students who have an average score of ${avgScore}%. Focus on identifying and bridging gaps.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || `Create a remedial practice activity for ${domain} at Level ${level}.`;
        }).catch(() => `Help students improve in ${domain} with level-appropriate exercises.`);
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Deep pedagogical analysis for ${student.name}. Proficiency: ${student.overallGrowth}%. Velocity: ${student.growthVelocity}%.`,
                config: {
                    thinkingConfig: { thinkingBudget: 0 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { report_card: { type: Type.STRING }, trend_insights: { type: Type.STRING } },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            return JSON.parse(sanitizeJson(response.text || '{}'));
        });
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return this.callWithRetry(async () => {
            const ai = await this.getClient();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Generate ${type} for Level ${level} ${domain}. Context: ${promptText}. Include specific exercises.`,
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
}