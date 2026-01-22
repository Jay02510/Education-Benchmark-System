
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

    static async generateCaseStudy(students: Student[], className: string): Promise<{
        title: string;
        introduction: string;
        keyFindings: string[];
        longitudinalAnalysis: string;
        riskMitigation: string;
        conclusion: string;
    }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Defensive Anonymization with Null Checks
        const anonymizedData = students.map((s, idx) => {
            const latest = s.assessments && s.assessments.length > 0 
                ? s.assessments[s.assessments.length - 1] 
                : null;
            
            let avgScore = 0;
            if (latest && latest.scores) {
                const scores = Object.values(latest.scores).filter(v => typeof v === 'number');
                if (scores.length > 0) {
                    avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                }
            }

            return {
                id: `Unit ${idx + 1}`,
                level: s.level || "N/A",
                velocity: `${s.growthVelocity || 0}%`,
                avgScore,
                tier: s.interventionStatus?.tier || 1
            };
        }).slice(0, 30); // Limit to 30 students to prevent prompt overflow

        const fallback = {
            title: "Cohort Analysis Report",
            introduction: "A synthesized analysis of current institutional pedagogical trends and student growth velocity.",
            keyFindings: ["Data saturation currently low.", "Velocity bands indicate a stabilizing performance profile."],
            longitudinalAnalysis: "Predictive engine suggests steady mastery acquisition across core domains over the next cycle.",
            riskMitigation: "Standard Tier 1 classroom strategies are currently sufficient for the mapped demographic.",
            conclusion: "The cohort is tracking within expected parameters for the current instructional level."
        };

        if (anonymizedData.length === 0) return fallback;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a professional educational research case study for the cohort: "${className}". 
                Data (Anonymized): ${JSON.stringify(anonymizedData)}. 
                Identify growth patterns, correlations between instructional level and velocity, and risk segments.
                Return JSON only.`,
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

            const text = response.text;
            if (!text) throw new Error("Empty response from intelligence engine");
            
            const result = JSON.parse(this.cleanJsonResponse(text));
            return { ...fallback, ...result };
        } catch (e) {
            console.error("Case Study Synthesis Failed:", e);
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
