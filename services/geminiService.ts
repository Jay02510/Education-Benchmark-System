
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
     * Obtains a valid AI instance by checking for environment variables
     * and falling back to the AI Studio selection protocol if necessary.
     */
    private static async getAIInstance(): Promise<GoogleGenAI> {
        let apiKey = process.env.API_KEY;

        // If environment variable is missing (common in browser builds), 
        // check if a key has been selected via the AI Studio protocol.
        if (!apiKey || apiKey === "undefined" || apiKey === "") {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
                // The key is injected into process.env.API_KEY by the environment after selection
                apiKey = process.env.API_KEY;
            }
        }

        if (!apiKey || apiKey === "undefined" || apiKey === "") {
            throw new Error("API_KEY_MISSING: Credentials not found. Please click 'Connect Engine'.");
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
            // If the key is invalid or missing, trigger the selection dialog
            if (error.message?.includes("entity was not found") || error.message?.includes("API_KEY_MISSING")) {
                if (window.aistudio) {
                    await window.aistudio.openSelectKey();
                    // After selection, we assume success as per guidelines
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    return await fn(ai);
                }
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
                contents: `Perform an institutional audit: ${JSON.stringify(analytics)}. Provide a strategic briefing.`,
            });
            return response.text || "Briefing pending.";
        });
    }
}
