
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Guardian Persona Directives for Benchmark System
const GUARDIAN_DIRECTIVE = `
You are the Benchmark Institutional Intelligence Engine, acting as the Guardian of Academic Health.
Your role is NOT to simply generate text, but to preserve and optimize the school's PEDAGOGICAL LOGIC.

PRIMARY OBJECTIVES:
1. Preserve student growth velocity (Conflict-free standards).
2. Human-sustainable teaching (Reduce teacher burnout via diagnostic clarity).
3. Minimize unnecessary change in student learning pathways.
4. Preserve institutional memory of student performance cycles.

HARD CONSTRAINTS:
- No domain regression allowed without a critical alert.
- Intervention Tiers must be strictly respected based on score thresholds.
- Standard CEFR and YLE mappings are immutable references.

OUTPUT FORMAT FOR ANALYSIS:
1. Summary of Action
2. Constraints Considered
3. Changes Detected in Trajectory
4. Risk Flags or Warnings
5. System Health Impact (Low / Medium / High)
`;

export class GeminiService {
    private static instance: GoogleGenAI | null = null;
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 500; 

    private static getClient(): GoogleGenAI {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("AI Connectivity Identity missing. Check process.env.API_KEY configuration.");
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
                contents: `Context: ${context}. Directive: ${GUARDIAN_DIRECTIVE}. Task: Provide a 1-sentence pedagogical micro-narrative explaining this state.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Monitoring current academic trajectory.";
        }).catch(() => "Academic health metrics stable.");
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Deep analyze Grade ${gradeLevel} with ${studentCount} students. Stats: ${JSON.stringify(stats)}.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text || "Class-wide proficiency maintains expected baseline.";
        });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `
                    Directive: ${GUARDIAN_DIRECTIVE}. 
                    Task: Deep pedagogical audit for student ${student.name}. 
                    Identity Context: Level ${student.level}, ${student.growthVelocity}% Growth Velocity, ${student.overallGrowth}% Cumulative Progress.
                    Format: Use the Guardian Output Format for the trend_insights field.
                `,
                config: {
                    thinkingConfig: { thinkingBudget: 2000 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING, description: "A supportive, academic summary for stakeholders." }, 
                            trend_insights: { type: Type.STRING, description: "Institutional Guardian Audit logic following specific format." } 
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
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: Generate high-impact ${type} for Level ${level} ${domain}. Focus: ${promptText}.`,
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

    // Fix: Added missing generateRemedialPrompt method to support AI-driven resource prompt suggestions based on class data analysis
    static async generateRemedialPrompt(domain: string, avgScore: number, gradeLevel: string): Promise<string> {
        return this.callWithRetry(async () => {
            const ai = this.getClient();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Directive: ${GUARDIAN_DIRECTIVE}. Task: The class average for ${domain} is ${avgScore}% at Level ${gradeLevel}. This is below target. Generate a specific, high-impact instructional prompt that a teacher could use to generate a remedial resource for this domain. Focus on closing specific gaps. Return ONLY the prompt text.`,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });
            return response.text?.trim() || `A targeted intervention activity for ${domain} focusing on core proficiency gaps for Level ${gradeLevel} students.`;
        }).catch(() => `A targeted intervention activity for ${domain} focusing on core proficiency gaps for Level ${gradeLevel} students.`);
    }
}
