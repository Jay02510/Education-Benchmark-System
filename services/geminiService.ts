import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const GUARDIAN_DIRECTIVE = `
You are the Benchmark Institutional Intelligence Engine, acting as the Guardian of Academic Health.
Your role is to preserve student growth velocity and institutional pedagogical integrity.

OUTPUT FORMAT FOR ANALYSIS:
1. Summary of Action
2. Constraints Considered
3. Changes Detected in Trajectory
4. Risk Flags or Warnings
5. System Health Impact (Low / Medium / High)
`;

export class GeminiService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 500; 

    private static async callWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("AI Connectivity Identity missing. Check process.env.API_KEY configuration in Vercel.");
        }

        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_GAP) await delay(this.MIN_REQUEST_GAP - timeSinceLast);
        this.lastRequestTime = Date.now();

        try {
            const ai = new GoogleGenAI({ apiKey });
            return await fn(ai);
        } catch (error: any) {
            if ((error.message?.includes("429") || error.message?.includes("503")) && retries > 0) {
                await delay(backoff);
                return this.callWithRetry(fn, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Context: ${context}. Directive: ${GUARDIAN_DIRECTIVE}. Task: Provide a 1-sentence micro-narrative.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Monitoring academic trajectory.";
        }).catch(() => "Academic metrics within stable parameters.");
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Deep analyze Grade ${gradeLevel} (${studentCount} students). Stats: ${JSON.stringify(stats)}. Use the Guardian Output Format.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Institutional performance is currently within established thresholds.";
        });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `
                    Directive: ${GUARDIAN_DIRECTIVE}. 
                    Task: Deep pedagogical audit for ${student.name}. 
                    Identity Context: Level ${student.level}, ${student.growthVelocity}% Velocity.
                `,
                config: {
                    thinkingConfig: { thinkingBudget: 2000 },
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
        });
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Generate ${type} for Level ${level} ${domain}. Focus: ${promptText}.`,
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

    static async generateRemedialPrompt(domain: string, avgScore: number, gradeLevel: string): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `The class average for ${domain} is ${avgScore}% at Level ${gradeLevel}. Generate a specific remedial resource prompt.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text?.trim() || "Targeted intervention for core proficiency gaps.";
        }).catch(() => "Targeted intervention for core proficiency gaps.");
    }
}