
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain } from '../types.ts';

export class GeminiService {
    private static cleanJsonResponse(text: string): string {
        return text.replace(/```json\n?|```/g, '').trim();
    }

    static async analyzeTestPaper(base64Image: string, domains: string[]): Promise<Record<string, number>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [
                    {
                        inlineData: { mimeType: 'image/jpeg', data: base64Image }
                    },
                    {
                        text: `Extract the numerical scores for the following domains from this test paper: ${domains.join(', ')}. Return valid JSON. Value 0-100.`
                    }
                ],
                config: { responseMimeType: "application/json" }
            });
            const text = this.cleanJsonResponse(response.text || '{}');
            return JSON.parse(text);
        } catch (e) {
            console.error("Vision Error:", e);
            return {};
        }
    }

    static async generateTranslatedReport(content: string, targetLang: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Translate this academic report card summary into ${targetLang}. Maintain a professional, encouraging, and pedagogical tone appropriate for parents. Content: ${content}`,
            });
            return response.text || "Translation unavailable.";
        } catch (e) {
            return "Translation engine sync error.";
        }
    }

    static async suggestDynamicThresholds(students: Student[]): Promise<Record<string, number>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const data = students.map(s => s.assessments[s.assessments.length-1]?.scores).filter(Boolean);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze these recent score sets: ${JSON.stringify(data)}. Suggest optimal RTI (Response to Intervention) percentage thresholds for Baseline, Midline, and Endline cycles to identify the bottom 15% of performers.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            Baseline: { type: Type.NUMBER },
                            Midline: { type: Type.NUMBER },
                            Endline: { type: Type.NUMBER }
                        },
                        required: ['Baseline', 'Midline', 'Endline']
                    }
                }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) {
            return { Baseline: 75, Midline: 80, Endline: 85 };
        }
    }

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
            const text = this.cleanJsonResponse(response.text || '{}');
            return JSON.parse(text);
        } catch (error) {
            return { report_card: "Syncing...", trend_insights: "Stable." };
        }
    }

    static async predictStudentTrajectory(student: Student): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = `Student ${student.name} is Level ${student.level} with ${student.growthVelocity}% velocity. Recent domain scores: ${JSON.stringify(student.assessments[student.assessments.length-1]?.scores)}.`;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Predict the student's CEFR level in 6 months based on this data: ${context}. Answer in 1 short sentence.`,
            });
            return response.text || "Trajectory currently stable.";
        } catch (e) {
            return "Projection pending data maturation.";
        }
    }

    static async generateExecutiveBriefing(students: Student[], className: string): Promise<{ 
        executiveSummary: string, 
        riskAssessment: string, 
        leadershipActions: string[] 
    }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const dataSummary = students.map(s => ({
            name: s.name,
            velocity: s.growthVelocity,
            tier: s.interventionStatus?.tier || 1,
            anomaly: s.hasAnomaly
        }));

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `As a school consultant, analyze this class data for a Principal: ${JSON.stringify(dataSummary)}. 
                Provide: 1. Executive Summary of ROI and growth. 2. Critical risk assessment (retention/parental concern). 3. Three concrete leadership actions.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            executiveSummary: { type: Type.STRING },
                            riskAssessment: { type: Type.STRING },
                            leadershipActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['executiveSummary', 'riskAssessment', 'leadershipActions']
                    }
                }
            });
            const text = this.cleanJsonResponse(response.text || '{}');
            return JSON.parse(text);
        } catch (e) {
            return { 
                executiveSummary: "Institutional growth remains steady.", 
                riskAssessment: "Operational risks nominal.", 
                leadershipActions: ["Review student velocity bands."] 
            };
        }
    }

    static async generateSmartGroups(students: Student[], domains: string[]): Promise<{ groupName: string, studentIds: string[], focus: string }[]> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const data = students.map(s => ({ id: s.id, name: s.name, weakDomains: Object.entries(s.assessments[s.assessments.length-1]?.scores || {}).filter(([_, v]) => v < 70).map(([d]) => d) }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Group students with similar weaknesses: ${JSON.stringify(data)}. Return 3 'Instructional Pods'.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                groupName: { type: Type.STRING },
                                studentIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                                focus: { type: Type.STRING }
                            },
                            required: ['groupName', 'studentIds', 'focus']
                        }
                    }
                }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '[]'));
        } catch (e) { return []; }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 1-sentence pedagogical insight for: ${context}.`,
            });
            return response.text || "Trajectory stable.";
        } catch (e) { return "Analysis pending data refresh."; }
    }
}
