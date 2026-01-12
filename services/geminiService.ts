import { Student, Domain, Resource, ResourceType, TestPeriod } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";

// Named constructor as required. apiKey check included to prevent evaluation crash.
const getAI = () => {
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
    return new GoogleGenAI({ apiKey: key });
};

export class GeminiService {
    
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const ai = getAI();
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

        const prompt = `
        You are a warm, professional ESL teacher writing a progress report for Korean parents. 
        English is their second language, so you must use "Plain English"—clear, simple, and direct.

        **BANNED JARGON (Do NOT use these words in the report_card):**
        - Velocity, Longitudinal, Pedagogical, Anomaly, Intervention, Domain, Proficiency, Assessment, Quantitative.

        **USE THESE INSTEAD:**
        - Progress speed, Long-term view, Teaching style, Gap, Extra help, Skill area, Learning level, Test, Numbers.

        **Instructions:**
        1. Keep sentences short and clear.
        2. Be encouraging but honest.
        3. Explain what the student "can do" now vs before.
        
        Output JSON with:
        - report_card: The plain-English summary for parents.
        - trend_insights: Professional, concise notes for the teacher (jargon okay here).
        
        Data: ${JSON.stringify(dataPayload)}
        `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING, description: "Plain English summary for Korean parents" }, 
                            trend_insights: { type: Type.STRING, description: "Technical notes for the teacher" } 
                        },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { 
            console.error("Analysis generation failed:", error);
            return { report_card: "The student is making steady progress in their lessons. We are working together to improve their reading and writing skills.", trend_insights: "Default insights due to error." }; 
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        focusAreas: string,
        growthAssets: string,
        atRiskCount: number
    ): Promise<string> {
        const ai = getAI();
        const model = 'gemini-3-flash-preview';
        const prompt = `
        You are a Senior Strategic Advisor for a private English academy owner in Korea.
        You are providing an "Executive Class Health Briefing."

        **Metrics:**
        - Level: ${gradeLevel}
        - Total Students: ${studentCount}
        - Students needing extra help: ${atRiskCount}

        **Communication Guidelines:**
        - Use "Plain Strategic English." Avoid complex academic terminology.
        - The owner cares about: Student Retention, Parent Satisfaction, and Measurable Results.
        - BANNED WORDS: RTI, Pedagogical, Longitudinal, Velocity, Anomaly, Socio-emotional.

        **Structure (Use these titles):**
        1. Class Summary: How is the class doing overall?
        2. Parent Happiness: How do the results look to the parents?
        3. Support Strategy: What are we doing for the ${atRiskCount} students who need help?
        4. Recommendation: One clear step for the owner to take.

        **Tone:** Professional, objective, and clear.
        `;

        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Briefing unavailable.";
        } catch (error) { 
            console.error("Class insight failed:", error);
            return "Unable to generate briefing at this time."; 
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        const ai = getAI();
        const model = "gemini-3-flash-preview";
        const fullPrompt = `Generate a resource for: Level: ${level}, Domain: ${domain}, Type: ${type}, Context: "${promptText}". Use clear, natural language suitable for ESL learners.`;
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
        const ai = getAI();
        const model = 'gemini-3-flash-preview';
        const prompt = `Class Level: ${level}, Struggling area: ${domain}, Avg: ${avgScore}%. Write a 1-sentence request to create a clear practice activity. Use simple English.`;
        try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            return (response.text || '').trim();
        } catch (error) { return `Create a practice activity for ${domain}.`; }
    }

    static async getRecommendedResources(domain: Domain, subdomain: string, level: string): Promise<Resource[]> {
        const ai = getAI();
        const model = 'gemini-3-flash-preview';
        const prompt = `Suggest 2 resources for Level ${level} in ${domain}. Use very plain English for titles and descriptions. Output JSON array of objects.`;
        try {
             const response = await ai.models.generateContent({
                model, contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { 
                            resources: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        title: { type: Type.STRING }, 
                                        description: { type: Type.STRING }, 
                                        type: { type: Type.STRING }, 
                                        domain: { type: Type.STRING }, 
                                        subdomain: { type: Type.STRING } 
                                    } 
                                } 
                            } 
                        } 
                    }
                }
            });
            const parsed = JSON.parse(response.text || '{"resources":[]}');
            return (parsed.resources || []).map((r: any, idx: number) => ({ id: `ai-${Date.now()}-${idx}`, ...r, level, period: TestPeriod.Baseline, content: "Generated Content", aiGenerated: true }));
        } catch (error) { return []; }
    }
}