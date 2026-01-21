
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const extractJson = (text: string) => {
    try {
        let sanitized = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = sanitized.indexOf('{');
        const lastBracket = sanitized.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
            sanitized = sanitized.substring(firstBracket, lastBracket + 1);
        }
        return JSON.parse(sanitized);
    } catch (e) {
        console.error("AI Parse Failure:", text);
        return {};
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class GeminiService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 1000;

    static getConnectivityStatus() {
        const key = process.env.API_KEY;
        if (!key || key === "undefined" || key === "") {
            return "OFFLINE: Authorized Credentials Required";
        }
        return "ONLINE: Engine Synchronized";
    }

    /**
     * Guidelines: Create a new instance right before making an API call.
     * This ensures we always use the most up-to-date key from the aistudio selector.
     */
    private static async getAIInstance(): Promise<GoogleGenAI> {
        // First check if the key is already in the environment
        let apiKey = process.env.API_KEY;

        // If Vite blocked it or it's missing, check the AI Studio selection protocol
        if (!apiKey || apiKey === "undefined" || apiKey === "") {
            if ((window as any).aistudio) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                }
                // Assume the key selection was successful as per guidelines
                apiKey = process.env.API_KEY;
            }
        }

        if (!apiKey || apiKey === "undefined" || apiKey === "") {
            throw new Error("CREDENTIALS_REQUIRED: No API key found. Please use the 'Connect Engine' button.");
        }

        return new GoogleGenAI({ apiKey });
    }

    private static async callWithRetry<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 2): Promise<T> {
        const now = Date.now();
        const gap = now - this.lastRequestTime;
        if (gap < this.MIN_REQUEST_GAP) await delay(this.MIN_REQUEST_GAP - gap);
        this.lastRequestTime = Date.now();

        try {
            const ai = await this.getAIInstance();
            return await fn(ai);
        } catch (error: any) {
            // Guidelines: If entity not found, reset key selection state
            if (error.message?.includes("Requested entity was not found") && (window as any).aistudio) {
                await (window as any).aistudio.openSelectKey();
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                return await fn(ai);
            }

            if (retries > 0 && (error.message?.includes("429") || error.message?.includes("503"))) {
                await delay(2000);
                return this.callWithRetry(fn, retries - 1);
            }
            throw error;
        }
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const latest = student.assessments[student.assessments.length - 1];
        const scoreContext = latest ? Object.entries(latest.scores).map(([d, s]) => `${d}: ${s}%`).join(', ') : 'No data';

        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Audit student: ${student.name}. Lvl: ${student.level}, Velocity: ${student.growthVelocity}%, Scores: ${scoreContext}.`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            report_card: { type: Type.STRING },
                            trend_insights: { type: Type.STRING }
                        },
                        required: ['report_card', 'trend_insights']
                    }
                }
            });
            return extractJson(response.text || '{}');
        });
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 1-sentence pedagogical insight for: ${context}.`,
            });
            return response.text || "Trajectory stable.";
        });
    }

    static async generateInstitutionalBriefing(analytics: any): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Perform an institutional audit: ${JSON.stringify(analytics)}. Provide a strategic briefing for school leadership.`,
            });
            return response.text || "Briefing pending data synthesis.";
        });
    }
}
