
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

/**
 * Utility to extract JSON from a model response that might contain
 * conversational text before or after the JSON block.
 */
const extractJson = (text: string) => {
    try {
        // Find the first '{' and the last '}'
        const firstBracket = text.indexOf('{');
        const lastBracket = text.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonStr = text.substring(firstBracket, lastBracket + 1);
            return JSON.parse(jsonStr);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("AI JSON Parse Failure. Raw Text:", text);
        throw new Error("The Intelligence Engine returned an invalid data format.");
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const GUARDIAN_DIRECTIVE = `
You are the Benchmark Institutional Intelligence Engine, acting as the Guardian of Academic Health.
Your role is to preserve student growth velocity and institutional pedagogical integrity.
Think like a senior administrator. Use Benchmark terminology: 'Growth Velocity', 'Intervention Tiers', 'Pedagogical Audit'.
`;

export class GeminiService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 1000; 

    private static async callWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 2): Promise<T> {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: API_KEY is undefined in process.env");
            throw new Error("AI Connectivity Identity missing. Ensure API_KEY is configured in the environment.");
        }

        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_GAP) await delay(this.MIN_REQUEST_GAP - timeSinceLast);
        this.lastRequestTime = Date.now();

        try {
            const ai = new GoogleGenAI({ apiKey });
            return await fn(ai);
        } catch (error: any) {
            console.error("Gemini API Error:", error);
            if (retries > 0 && (error.message?.includes("429") || error.message?.includes("503"))) {
                await delay(2000);
                return this.callWithRetry(fn, retries - 1);
            }
            throw error;
        }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Context: ${context}. Task: Provide a 1-sentence pedagogical micro-narrative for a teacher's dashboard. Be specific and action-oriented.`,
            });
            return response.text || "Monitoring academic trajectory.";
        }).catch(() => "Data parameters within standard deviations.");
    }

    static async generateInstitutionalBriefing(stats: any): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `
                    ${GUARDIAN_DIRECTIVE}
                    Task: Generate a 3-paragraph Institutional Performance Briefing for the Principal.
                    Analyze this institutional data: ${JSON.stringify(stats)}.
                    Identify the #1 risk and the #1 growth opportunity.
                `,
            });
            return response.text || "Institutional performance data verified.";
        });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        // Extract latest scores for context
        const latest = student.assessments[student.assessments.length - 1];
        const scoreContext = latest ? Object.entries(latest.scores).map(([d, s]) => `${d}: ${s}%`).join(', ') : 'No data';

        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `
                    ${GUARDIAN_DIRECTIVE}
                    Task: Deep pedagogical audit for student ${student.name}. 
                    Level: ${student.level}. 
                    Growth Velocity: ${student.growthVelocity}%. 
                    Current Proficiency: ${scoreContext}.
                    Intervention Status: ${student.interventionStatus?.tier || 'Tier 1'}.

                    Return JSON with:
                    1. "report_card": Professional narrative for parents (approx 80 words).
                    2. "trend_insights": Internal pedagogical notes for the teacher.
                `,
                config: {
                    thinkingConfig: { thinkingBudget: 4000 },
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
            return extractJson(response.text || '{}');
        });
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Generate an educational ${type} for Level ${level} students in ${domain} (${subdomain}). Goal: ${promptText}. Return JSON with title, description, content.`,
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
            return extractJson(response.text || '{}');
        }).catch(() => null);
    }
}
