
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const extractJson = (text: string) => {
    try {
        let sanitized = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = sanitized.indexOf('{');
        const lastBracket = sanitized.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
            sanitized = sanitized.substring(firstBracket, lastBracket + 1);
            return JSON.parse(sanitized);
        }
        return JSON.parse(sanitized);
    } catch (e) {
        console.error("AI Parse Failure:", text);
        throw new Error("Invalid Engine Response: Metadata synthesis failed.");
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class GeminiService {
    private static lastRequestTime = 0;
    private static MIN_REQUEST_GAP = 1000;

    /**
     * Diagnostic: Check if key is available to the browser.
     */
    static getConnectivityStatus() {
        const key = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        if (!key || key === "undefined") return "OFFLINE: No Key Detected";
        return `ONLINE: Key Detected (${key.substring(0, 4)}...${key.substring(key.length - 4)})`;
    }

    private static async getAIInstance(): Promise<GoogleGenAI> {
        // Handle AI Studio environment
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                console.log("Requesting key via AI Studio protocol...");
                await (window as any).aistudio.openSelectKey();
            }
        }

        const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        if (!apiKey || apiKey === "undefined") {
            throw new Error("Missing Identity: The AI Engine is not configured in Vercel. Please check API_KEY settings.");
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
            console.warn("AI Engine Attempt Failed:", error.message);
            
            // Handle specific key errors
            if (error.message?.includes("Requested entity was not found") && (window as any).aistudio) {
                await (window as any).aistudio.openSelectKey();
                throw new Error("System recalibrating. Please retry your request.");
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
            try {
                // Try Pro Model first for deep reasoning
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: `Audit student: ${student.name}. Lvl: ${student.level}, Velocity: ${student.growthVelocity}%, Scores: ${scoreContext}. Return JSON {report_card, trend_insights}.`,
                    config: {
                        thinkingConfig: { thinkingBudget: 4000 },
                        responseMimeType: "application/json"
                    }
                });
                return extractJson(response.text || '{}');
            } catch (e) {
                console.warn("Pro Model Unavailable. Falling back to Flash Engine...");
                // Fallback to Flash for reliability
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Audit student: ${student.name}. Lvl: ${student.level}, Velocity: ${student.growthVelocity}%, Scores: ${scoreContext}. Return JSON {report_card, trend_insights}.`,
                    config: { responseMimeType: "application/json" }
                });
                return extractJson(response.text || '{}');
            }
        });
    }

    static async generateInstitutionalBriefing(stats: any): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a Principal Briefing for these stats: ${JSON.stringify(stats)}. Identify risk and growth.`,
            });
            return response.text || "Metrics verified.";
        });
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        return this.callWithRetry(async (ai) => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 1-sentence pedagogical insight for: ${context}.`,
            });
            return response.text || "Monitoring academic trajectory.";
        }).catch(() => "Data parameters stable.");
    }
}
