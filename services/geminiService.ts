import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Guardian Persona Directives adapted for Benchmark
const GUARDIAN_DIRECTIVE = `
You are EduPlanner’s Institutional Intelligence Engine, acting as the Guardian of Academic Health.
Your role is NOT to simply generate text, but to preserve and optimize the school's PEDAGOGICAL LOGIC.

PRIMARY OBJECTIVES:
1. Preserve student growth (Conflict-free standards).
2. Human-sustainable teaching (Reduce teacher burnout via clear reports).
3. Minimize unnecessary change in student trajectories.
4. Preserve institutional memory.

HARD CONSTRAINTS:
- No domain regression without an alert.
- Intervention Tiers must be respected based on scores.
- Standard CEFR/YLE mappings are immutable.

OUTPUT FORMAT:
1. Summary of Action
2. Constraints Considered
3. Changes Made (if any)
4. Risk Flags or Warnings
5. System Health Impact (Low / Medium / High)
`;

export class GeminiService {
    private static instance: GoogleGenAI | null = null;
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 500; 

    private static getApiKey(): string {
        const win = window as any;
        return (win.process?.env?.API_KEY) || (win.API_KEY) || "";
    }

    private static getClient(): GoogleGenAI {
        const apiKey = this.getApiKey();
        if (!apiKey || apiKey.length < 10) {
            throw new Error("AI Connectivity Identity not found. Please ensure API_KEY is set.");
        }
        if (!this.instance) {
            this.instance = new GoogleGenAI({ apiKey });
        }
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
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Context: ${context}. Instruction: ${GUARDIAN_DIRECTIVE}. Task: Provide a 1-sentence pedagogical micro-narrative.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Monitoring current trajectory.";
        }).catch(() => "Academic health within expected parameters.");
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Instruction: ${GUARDIAN_DIRECTIVE}. Task: Analyze Grade ${gradeLevel} with ${studentCount} students. Stats: ${JSON.stringify(stats)}.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Metrics stable.";
        });
    }

    static async generateRemedialPrompt(domain: string, avgScore: number, level: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Suggest a 1-sentence teaching prompt for bridging gaps in ${domain} for Level ${level} (Avg ${avgScore}%).`,
            });
            return response.text || `Focus on ${domain} fundamentals.`;
        });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `
                    Instruction: ${GUARDIAN_DIRECTIVE}. 
                    Task: Deep analysis for ${student.name}. 
                    Data: Proficiency ${student.overallGrowth}%, Velocity ${student.growthVelocity}%.
                    Format: Use the Guardian Output Format for the trend_insights field.
                `,
                config: {
                    thinkingConfig: { thinkingBudget: 0 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING, description: "A warm, parental-facing summary." }, 
                            trend_insights: { type: Type.STRING, description: "Institutional Guardian Audit summary." } 
                        },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            return JSON.parse(sanitizeJson(response.text || '{}'));
        });
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Instruction: ${GUARDIAN_DIRECTIVE}. Task: Generate ${type} for Level ${level} ${domain}. Topic: ${promptText}.`,
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