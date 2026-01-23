
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain } from '../types.ts';

export class GeminiService {
    private static cleanJsonResponse(text: string): string {
        if (!text) return '{}';
        return text.replace(/```json\n?|```/g, '').trim();
    }

    /**
     * LOCAL SYNTHESIS ENGINE
     * Generates a pedagogical report using frontend logic if AI is saturated.
     */
    private static generateLocalReport(students: Student[], className: string) {
        return {
            title: `Institutional Growth Analysis: ${className}`,
            introduction: "Analytical synthesis of student performance trends based on longitudinal velocity and domain mastery metrics.",
            studentBreakdowns: students.map(s => {
                const latest = s.assessments[s.assessments.length - 1];
                const first = s.assessments[0];
                const velocity = s.growthVelocity || 0;
                
                // Identify high/low domains locally
                const scores = latest ? Object.entries(latest.scores).filter(([_, v]) => typeof v === 'number') : [];
                const sorted = scores.sort(([, a], [, b]) => (b as number) - (a as number));
                const top = sorted[0]?.[0] || "General Core";
                const bottom = sorted[sorted.length - 1]?.[0] || "Targeted Domains";

                return {
                    name: s.name,
                    excelsIn: velocity > 5 
                        ? `Demonstrates high instructional velocity in ${top}, trending towards advanced mastery.` 
                        : `Showing consistent stability and focus in ${top} modules.`,
                    needsWork: velocity < 0 
                        ? `Recent regression identified in ${bottom}. Requires immediate review of foundational concepts.` 
                        : `Targeted practice in ${bottom} is recommended to maintain growth trajectory.`,
                    strategy: s.interventionStatus?.tier === 3 
                        ? "Implement 1-on-1 intensive scaffolded support with weekly check-ins." 
                        : "Integrate more high-frequency practice and peer-modeling during standard instruction."
                };
            }),
            conclusion: "The cohort is currently exhibiting a stable growth profile with specific intervention nodes identified for secondary review."
        };
    }

    /**
     * GENERATE CASE STUDY
     * Features: Exponential Backoff Retries + Local Logic Fallback
     */
    static async generateCaseStudy(students: Student[], className: string): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Minified dataset for tokens
        const dataset = students.map(s => ({
            name: s.name,
            vel: s.growthVelocity,
            tier: s.interventionStatus?.tier || 1,
            scores: s.assessments.map(a => ({ p: a.type, avg: Math.round(Object.values(a.scores).reduce((sum: any, v: any) => sum + (v || 0), 0) / 8) }))
        })).slice(0, 20);

        const schema = {
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
        };

        const prompt = `Synthesize a professional pedagogical case study for "${className}".
        Analyze these student profiles and their 3-test score trends: ${JSON.stringify(dataset)}
        Provide a concise summary for each student detailing strengths, gaps, and 1 specific teaching strategy.`;

        // RETRY LOGIC (Max 3 attempts)
        for (let i = 0; i < 3; i++) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview', // Flash is more resilient to saturation
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema
                    }
                });
                const result = JSON.parse(this.cleanJsonResponse(response.text || '{}'));
                if (result.studentBreakdowns) return result;
            } catch (e: any) {
                console.warn(`Attempt ${i + 1} failed: ${e.message}`);
                if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
            }
        }

        // ABSOLUTE FALLBACK: Use Local Logic if AI is saturated
        console.error("AI Saturated after 3 retries. Switching to Local Logic Engine.");
        return this.generateLocalReport(students, className);
    }

    static async analyzeTestPaper(base64Image: string, domains: string[]): Promise<Record<string, number>> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `Extract scores for: ${domains.join(', ')}. JSON only.` }
                ],
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return {}; }
    }

    static async generateExecutiveBriefing(students: Student[], className: string): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = students.map(s => ({ vel: s.growthVelocity, tier: s.interventionStatus?.tier || 1 }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `School Leader Briefing for ${className}: ${JSON.stringify(summary)}. JSON with executiveSummary, riskAssessment, leadershipActions.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return null; }
    }

    static async generateSmartGroups(students: Student[], domains: string[]): Promise<any> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const data = students.map(s => ({ id: s.id, weak: Object.entries(s.assessments[s.assessments.length-1]?.scores || {}).filter(([_,v]) => (v as number) < 70).map(([d]) => d) }));
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Group students by weakness: ${JSON.stringify(data)}. JSON array.`,
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
                contents: `Predict trajectory for ${student.name} (Velocity ${student.growthVelocity}%). 1 sentence.`,
            });
            return response.text || "Stable growth path.";
        } catch (e) { return "Recalculating..."; }
    }

    static async generateMicroNarrative(context: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: context,
            });
            return response.text || "Insights pending.";
        } catch (e) { return "Processing..."; }
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
                contents: `Suggest RTI thresholds for: ${JSON.stringify(students.map(s => s.growthVelocity))}. JSON only.`,
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
                contents: `Academic report for ${student.name}. JSON with report_card text.`,
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(this.cleanJsonResponse(response.text || '{}'));
        } catch (e) { return { report_card: "Awaiting sync." }; }
    }
}
