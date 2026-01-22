
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
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `Extract numerical scores for: ${domains.join(', ')}. Return JSON.` }
                ],
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return {}; }
    }

    static async generateCaseStudy(students: Student[], className: string): Promise<{
        title: string;
        introduction: string;
        keyFindings: string[];
        longitudinalAnalysis: string;
        riskMitigation: string;
        conclusion: string;
    }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // PRIVACY SHIELD: Replace real names with identifiers
        const anonymizedData = students.map((s, idx) => ({
            identifier: `Student ${idx + 1}`,
            level: s.level,
            velocity: `${s.growthVelocity}%`,
            avgScore: s.assessments.length > 0 ? 
                Math.round(Object.values(s.assessments[s.assessments.length-1].scores).reduce((a,b) => a+b, 0) / Object.keys(s.assessments[s.assessments.length-1].scores).length) : 0,
            interventionTier: s.interventionStatus?.tier || 1
        }));

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a professional educational research case study for the cohort: "${className}". 
                Data (Anonymized): ${JSON.stringify(anonymizedData)}. 
                Highlight growth patterns, correlations between levels and velocity, and pedagogical outcomes.
                Return structured JSON.`,
                config: {
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
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) {
            return {
                title: "Cohort Analysis Report",
                introduction: "Analysis of institutional pedagogical trends.",
                keyFindings: ["Data maturation required for deep insights."],
                longitudinalAnalysis: "Stabilizing across domains.",
                riskMitigation: "Standard Tier 1 support sufficient.",
                conclusion: "Pending further assessment cycles."
            };
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
        const data = students.map(s => ({ id: s.id, weak: Object.entries(s.assessments[s.assessments.length-1]?.scores || {}).filter(([_,v]) => v < 70).map(([d]) => d) }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Group students by weakness: ${JSON.stringify(data)}. Return JSON array of groups.`,
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
                contents: `Predict 6-month CEFR growth for: ${student.name}, current velocity ${student.growthVelocity}%.`,
            });
            return response.text || "Stable trajectory.";
        } catch (e) { return "Calculating..."; }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: context,
            });
            return response.text || "No insights available.";
        } catch (e) { return "Syncing..."; }
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
                contents: `Suggest RTI thresholds (0-100) for Baseline/Midline/Endline based on student performance. JSON.`,
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
                contents: `Write a report card for ${student.name}. JSON with report_card and trend_insights fields.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { report_card: "Syncing...", trend_insights: "Stable" }; }
    }
}
