
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

/**
 * Utility to extract JSON from a model response that might contain
 * conversational text, thinking tokens, or markdown blocks.
 */
const extractJson = (text: string) => {
    try {
        // Remove markdown formatting if present
        let sanitized = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find the first '{' and the last '}'
        const firstBracket = sanitized.indexOf('{');
        const lastBracket = sanitized.lastIndexOf('}');
        
        if (firstBracket !== -1 && lastBracket !== -1) {
            sanitized = sanitized.substring(firstBracket, lastBracket + 1);
            return JSON.parse(sanitized);
        }
        return JSON.parse(sanitized);
    } catch (e) {
        console.error("Benchmark AI: Parsing Error. Raw payload:", text);
        throw new Error("Data Synthesis Failure: The Engine returned an incompatible format.");
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
    private static MIN_REQUEST_GAP = 1200; 

    private static async callWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 3): Promise<T> {
        const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        
        if (!apiKey || apiKey === "undefined" || apiKey === "") {
            console.error("Benchmark AI: CONFIGURATION ALERT - API_KEY is missing from environment.");
            throw new Error("System Identity Not Found. Please verify API_KEY in the Vercel Dashboard.");
        }

        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_GAP) await delay(this.MIN_REQUEST_GAP - timeSinceLast);
        this.lastRequestTime = Date.now();

        try {
            const ai = new GoogleGenAI({ apiKey });
            return await fn(ai);
        } catch (error: any) {
            console.error("Benchmark AI: Engine Communication Failure:", error);
            
            // Check for quota or server errors to trigger retry
            if (retries > 0 && (error.message?.includes("429") || error.message?.includes("503") || error.message?.includes("500"))) {
                await delay(2500);
                return this.callWithRetry(fn, retries - 1);
            }
            
            // Throw descriptive error for the UI
            if (error.message?.includes("403") || error.message?.includes("401")) {
                throw new Error("Access Denied: The provided API Key is invalid or restricted.");
            }
            if (error.message?.includes("404")) {
                throw new Error("Engine Not Found: The requested AI model is unavailable in your region.");
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
            return response.text || "Metrics verified. Awaiting further evidence.";
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
            return response.text || "Institutional performance data verified and recorded.";
        });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
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
