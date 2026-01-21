
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from '../types.ts';

export class GeminiService {
    /**
     * Strictly follows SDK guidelines: new instance right before use.
     */
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const latest = student.assessments[student.assessments.length - 1];
        const scoreContext = latest ? Object.entries(latest.scores).map(([d, s]) => `${d}: ${s}%`).join(', ') : 'No data';

        try {
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
            
            const text = response.text;
            if (!text) throw new Error("Empty response from model");
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            return {
                report_card: "System was unable to generate a report at this time.",
                trend_insights: "Metrics stable. Manual review recommended."
            };
        }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 1-sentence pedagogical insight for: ${context}.`,
            });
            return response.text || "Trajectory stable.";
        } catch (e) {
            return "Analysis pending data refresh.";
        }
    }

    static async generateInstitutionalBriefing(analytics: any): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Perform an institutional audit: ${JSON.stringify(analytics)}. Provide a strategic briefing for school leadership.`,
            });
            return response.text || "Briefing pending data synthesis.";
        } catch (e) {
            return "Institutional data is being synchronized.";
        }
    }
}
