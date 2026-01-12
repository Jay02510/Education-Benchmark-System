
import { Student, Domain, Resource, ResourceType, TestPeriod } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly and use named parameter in constructor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
    
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const model = 'gemini-3-flash-preview';
        const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const latest = sortedAssessments[sortedAssessments.length - 1];
        const scores = latest ? Object.values(latest.scores) as number[] : [];
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        const dataPayload = {
            student: { name: student.name, level: student.level, current_avg: avg },
            history: sortedAssessments.map(a => ({ period: a.type, date: a.date, scores: a.scores })),
            intervention: student.interventionStatus ? { active: true, reason: student.interventionStatus.triggerReason, goal: student.interventionStatus.goal } : { active: false }
        };

        const prompt = `Analyze this student's data. Output JSON with report_card (for parents, warm tone) and trend_insights (for teachers). DO NOT use technical jargon like "velocity" or "longitudinal" in the report card. Data: ${JSON.stringify(dataPayload)}`;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { report_card: { type: Type.STRING }, trend_insights: { type: Type.STRING } }
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { return { report_card: "Error", trend_insights: "Error" }; }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        focusAreas: string,
        growthAssets: string,
        atRiskCount: number
    ): Promise<string> {
        const model = 'gemini-3-flash-preview';
        const prompt = `
        You are a Senior Educational Business Consultant presenting to the School Owner. 
        Your goal is to provide a "Class Health & Institutional Momentum Briefing."

        **Metrics:**
        - Grade: ${gradeLevel}
        - Total Students: ${studentCount}
        - High-Support Needs: ${atRiskCount}

        **Instructions for Output:**
        - **Speak like a CEO/Owner Advisor.** Focus on "Institutional Health," "Student Retention," and "Academic Excellence."
        - **Banned Words:** DO NOT use "RTI," "Velocity," "Anomaly," or "Pedagogical." Use phrases like "Support Intensity," "Learning Speed," or "Teaching Impact."
        - **Structure:**
            1. **Institutional Snapshot:** High-level executive overview of how the class is helping school reputation.
            2. **Academic Momentum:** How well are we accelerating student learning?
            3. **Risk Mitigation:** How are we protecting the ${atRiskCount} students who are falling behind?
            4. **Actionable Strategic Move:** One big-picture recommendation for the owner to support the teacher.

        **Tone:** Strategic, objective, reassuring, and high-level.
        **Format:** Bold titles. No markdown headers (#).
        `;

        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Briefing unavailable.";
        } catch (error) { return "Unable to generate briefing."; }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, prompt: string): Promise<{ title: string; description: string; content: string } | null> {
        const model = "gemini-3-flash-preview";
        const fullPrompt = `Generate a resource for: Level: ${level}, Domain: ${domain}, Type: ${type}, Context: "${prompt}"`;
        try {
            const response = await ai.models.generateContent({
                model, contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "description", "content"] }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { return null; }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        const model = 'gemini-3-flash-preview';
        const prompt = `Class Level: ${level}, Struggling Domain: ${domain}, Avg: ${avgScore}%. Generate a single-sentence prompt for a resource generator.`;
        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            return (response.text || '').trim();
        } catch (error) { return `Create a remedial activity for ${domain}.`; }
    }

    static async getRecommendedResources(domain: Domain, subdomain: string, level: string): Promise<Resource[]> {
        const model = 'gemini-3-flash-preview';
        const prompt = `Suggest 2 resources for Level ${level} in ${domain}. JSON array.`;
        try {
             const response = await ai.models.generateContent({
                model, contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { resources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, type: { type: Type.STRING }, domain: { type: Type.STRING }, subdomain: { type: Type.STRING } } } } } }
                }
            });
            const parsed = JSON.parse(response.text || '{"resources":[]}');
            return parsed.resources.map((r: any, idx: number) => ({ id: `ai-${Date.now()}-${idx}`, ...r, level, period: TestPeriod.Baseline, content: "Generated", aiGenerated: true }));
        } catch (error) { return []; }
    }
}
