
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain } from '../types.ts';

/**
 * GEMINI INTELLIGENCE SERVICE (STABILITY TUNED)
 * Optimized for Gemini 3 series models for high-precision pedagogical analysis.
 */
export class GeminiService {
    private static cleanJsonResponse(text: string): string {
        if (!text) return '{}';
        // Remove markdown formatting if present
        return text.replace(/```json\n?|```/g, '').trim();
    }

    private static generateLocalReport(students: Student[], className: string) {
        return {
            title: `Growth Synthesis: ${className}`,
            introduction: "Local fallback analysis activated. Trajectory based on longitudinal mastery metrics.",
            studentBreakdowns: students.map(s => ({
                name: s.name,
                excelsIn: "Consistent performance in core instructional modules.",
                needsWork: "Higher-order thinking skill refinement.",
                strategy: "Deploy scaffolded task complexity in the next cycle."
            })).slice(0, 10),
            conclusion: "Cohort is tracking within standard institutional parameters."
        };
    }

    // Added generateSmartGroups to fix missing property error in InsightsTab.tsx
    static async generateSmartGroups(students: Student[], domains: string[]): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = students.map(s => ({
            name: s.name,
            id: s.id,
            scores: s.assessments[s.assessments.length - 1]?.scores || {}
        })).slice(0, 30);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze these students and their scores: ${JSON.stringify(summary)}. 
                Group them into "Instructional Pods" based on similar skill gaps in these domains: ${domains.join(', ')}. 
                Return a JSON array of objects with groupName, studentIds (array of strings), and focus (brief description).`,
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
        } catch (e) {
            return [];
        }
    }

    static async generateCaseStudy(students: Student[], className: string): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const dataset = students.map(s => ({
            n: s.name,
            s: s.assessments.map(a => ({ p: a.type, avg: Math.round(Object.values(a.scores).reduce((sum: number, v: any) => sum + (v || 0), 0) / 8) }))
        })).slice(0, 15);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `As a Lead Researcher, synthesize a Case Study for class "${className}": ${JSON.stringify(dataset)}. 
                Identify individual excelsIn, needsWork, and strategy for each. Return valid JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            introduction: { type: Type.STRING },
                            studentBreakdowns: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        excelsIn: { type: Type.STRING },
                                        needsWork: { type: Type.STRING },
                                        strategy: { type: Type.STRING }
                                    },
                                    required: ['name', 'excelsIn', 'needsWork', 'strategy']
                                }
                            },
                            conclusion: { type: Type.STRING }
                        },
                        required: ['title', 'introduction', 'studentBreakdowns', 'conclusion']
                    }
                }
            });

            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) {
            return this.generateLocalReport(students, className);
        }
    }

    static async generateExecutiveBriefing(students: Student[], className: string): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = students.map(s => ({ 
            name: s.name, 
            vel: s.growthVelocity, 
            tier: s.interventionStatus?.tier || 1 
        })).slice(0, 25);
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Generate a Leadership Briefing for class ${className}: ${JSON.stringify(summary)}. 
                Provide executiveSummary, riskAssessment, and leadershipActions. JSON format only.`,
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
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) {
            return {
                executiveSummary: "Data transmission stabilized. Reviewing cohort velocity trends.",
                riskAssessment: "Risk protocols active. Monitor Tier 2 and Tier 3 transitions.",
                leadershipActions: ["Audit intervention logs.", "Calibrate standard mastery targets."]
            };
        }
    }

    static async analyzeTestPaper(base64Image: string, domains: string[]): Promise<Record<string, number>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                        { text: `Extract percentage scores (0-100) for: ${domains.join(', ')}. Return JSON.` }
                    ]
                },
                config: {
                    responseMimeType: "application/json"
                }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return {}; }
    }

    static async predictStudentTrajectory(student: Student): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Predict path for ${student.name} (Velocity ${student.growthVelocity}%). 1 sentence.`,
            });
            return response.text || "Trajectory stable.";
        } catch (e) { return "Analyzing..."; }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: context,
            });
            return response.text || "Insights pending.";
        } catch (e) { return "Processing."; }
    }

    static async generateTranslatedReport(content: string, targetLang: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Translate to ${targetLang}: ${content}`,
            });
            return response.text || content;
        } catch (e) { return content; }
    }

    static async suggestDynamicThresholds(students: Student[]): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Suggest RTI thresholds for 3 cycles based on these student metrics: ${JSON.stringify(students.slice(0, 20))}. JSON format.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { Baseline: 75, Midline: 80, Endline: 85 }; }
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Generate a detailed report card narrative for student: ${JSON.stringify(student)}. JSON with report_card field.`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { report_card: { type: Type.STRING } },
                        required: ['report_card']
                    }
                }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { report_card: "Official transcript synthesis in progress." }; }
    }
}
