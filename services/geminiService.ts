
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain } from '../types.ts';

export class GeminiService {
    private static cleanJsonResponse(text: string): string {
        if (!text) return '{}';
        return text.replace(/```json\n?|```/g, '').trim();
    }

    static async analyzeTestPaper(base64Image: string, domains: string[]): Promise<Record<string, number>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `Extract numerical scores for: ${domains.join(', ')}. Return JSON.` }
                ],
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { 
            console.error("Vision Sync Error:", e);
            return {}; 
        }
    }

    /**
     * GENERATE PRO CASE STUDY
     * Uses gemini-3-pro-preview for high-end reasoning.
     * Optimized to prevent timeouts by minifying the payload.
     */
    static async generateCaseStudy(students: Student[], className: string): Promise<{
        title: string;
        introduction: string;
        keyFindings: string[];
        longitudinalAnalysis: string;
        riskMitigation: string;
        conclusion: string;
    }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Minified Schema for faster Pro processing
        const dataset = students.map((s, idx) => {
            const assessments = s.assessments || [];
            const latest = assessments[assessments.length - 1];
            const prev = assessments[assessments.length - 2];
            
            const getAvg = (a: any) => {
                if (!a?.scores) return 0;
                const v = Object.values(a.scores).filter(n => typeof n === 'number') as number[];
                return v.length ? Math.round(v.reduce((a,b) => a+b, 0) / v.length) : 0;
            };

            const lAvg = getAvg(latest);
            const pAvg = getAvg(prev);

            return {
                id: idx + 1,
                lvl: s.level,
                vel: s.growthVelocity,
                delta: lAvg - pAvg,
                m_idx: lAvg,
                tier: s.interventionStatus?.tier || 1
            };
        }).slice(0, 25); 

        const fallback = {
            title: "Performance Trajectory Analysis",
            introduction: "High-level synthesis of cohort mastery trends and growth velocity.",
            keyFindings: ["Consistent progress identified across core domains.", "Velocity remains within expected instructional bands."],
            longitudinalAnalysis: "Projections suggest continued mastery acquisition based on current deltas.",
            riskMitigation: "Standard Tier 1 classroom strategies are recommended.",
            conclusion: "The cohort is tracking successfully against standards."
        };

        if (dataset.length === 0) return fallback;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Perform a deep pedagogical analysis for "${className}".
                DATASET (Anonymized Units): ${JSON.stringify(dataset)}
                TASK: correlate Velocity vs Delta. Identify Level-specific stalling. Propose strategy.
                STYLE: Highly professional academic research.`,
                config: {
                    thinkingConfig: { thinkingBudget: 4000 }, // Balanced for Pro depth and UI speed
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            introduction: { type: Type.STRING },
                            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            longitudinalAnalysis: { type: Type.STRING },
                            riskMitigation: { type: Type.STRING },
                            conclusion: { type: Type.STRING }
                        },
                        required: ['title', 'introduction', 'keyFindings', 'longitudinalAnalysis', 'riskMitigation', 'conclusion']
                    }
                }
            });

            const text = response.text;
            if (!text) return fallback;
            
            return { ...fallback, ...JSON.parse(this.cleanJsonResponse(text)) };
        } catch (e) {
            console.error("Pro Engine Timeout/Error:", e);
            return fallback;
        }
    }

    static async generateExecutiveBriefing(students: Student[], className: string): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = students.map(s => ({ vel: s.growthVelocity, tier: s.interventionStatus?.tier || 1 }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze this summary for a School Principal: ${JSON.stringify(summary)}. Provide summary, risk assessment, and actions. JSON format.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return null; }
    }

    static async generateSmartGroups(students: Student[], domains: string[]): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const data = students.map(s => ({ 
            id: s.id, 
            weak: Object.entries(s.assessments[s.assessments.length-1]?.scores || {})
                .filter(([_,v]) => typeof v === 'number' && v < 70)
                .map(([d]) => d) 
        }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Group students by shared weakness: ${JSON.stringify(data)}. Return JSON array of groups.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '[]'));
        } catch (e) { return []; }
    }

    static async predictStudentTrajectory(student: Student): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Predict 6-month growth trajectory for student: ${student.name}, Level ${student.level}, Velocity ${student.growthVelocity}%. 1 short sentence.`,
            });
            return response.text || "Trajectory currently stable.";
        } catch (e) { return "Recalculating path..."; }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: context,
            });
            return response.text || "No insights available.";
        } catch (e) { return "Processing..."; }
    }

    static async generateTranslatedReport(content: string, targetLang: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Translate the following academic report to ${targetLang}. Maintain a professional tone. Content: ${content}`,
            });
            return response.text || content;
        } catch (e) { return content; }
    }

    static async suggestDynamicThresholds(students: Student[]): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Analyze cohort performance and suggest RTI mastery thresholds for Baseline, Midline, and Endline. Return JSON.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { Baseline: 75, Midline: 80, Endline: 85 }; }
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Write an academic report for ${student.name}. JSON with report_card and trend_insights.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { report_card: "Awaiting sync.", trend_insights: "Stable." }; }
    }
}
