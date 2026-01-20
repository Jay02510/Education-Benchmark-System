import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const GUARDIAN_DIRECTIVE = `
You are the Benchmark Institutional Intelligence Engine, acting as the Guardian of Academic Health.
Your role is to preserve student growth velocity and institutional pedagogical integrity.
Think like a senior administrator. Use Benchmark terminology: 'Growth Velocity', 'Intervention Tiers', 'Pedagogical Audit'.

OUTPUT FORMAT:
1. SUMMARY OF ACTION: (One sentence)
2. CONSTRAINTS CONSIDERED: (Bullet points)
3. CHANGES DETECTED: (Trajectory shifts)
4. RISK FLAGS: (If any)
5. SYSTEM HEALTH IMPACT: (Low/Medium/High)
`;

export class GeminiService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 500; 

    private static async callWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("AI Connectivity Identity missing. Check process.env.API_KEY configuration.");
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
                contents: `Context: ${context}. Directive: ${GUARDIAN_DIRECTIVE}. Task: Provide a 1-sentence micro-narrative for a dashboard widget.`,
            });
            return response.text || "Monitoring academic trajectory.";
        }).catch(() => "Academic metrics within stable parameters.");
    }

    static async generateInstitutionalBriefing(stats: any): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Generate an Institutional Performance Briefing for the Principal. Data: ${JSON.stringify(stats)}.`,
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
                    Task: Deep pedagogical audit for student ${student.name}. 
                    Context: Level ${student.level}, Velocity: ${student.growthVelocity}%, Assessments: ${student.assessments.length}.
                    Identify specific proficiency gaps and strengths.
                `,
                config: {
                    thinkingConfig: { thinkingBudget: 4000 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING, description: "A formal narrative for a parent report card." }, 
                            trend_insights: { type: Type.STRING, description: "Internal pedagogical trends for the teacher." } 
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
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Generate an educational ${type} for Level ${level} students in ${domain} (${subdomain}). Prompt: ${promptText}.`,
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
        }).catch(() => null);
    }
}