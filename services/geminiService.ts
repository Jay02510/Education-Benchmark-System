import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Executes the generative AI analysis using the environment-provided API_KEY.
     */
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            // Check if process/env is accessible
            if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
                throw new Error("API_KEY environment variable is not defined or accessible in this environment.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-3-pro-preview';
            
            const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const latest = sortedAssessments[sortedAssessments.length - 1];
            const scores = latest ? Object.values(latest.scores) as number[] : [];
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            const prompt = `Persona: Senior Pedagogical Consultant. 
            Analyze student ${student.name} (Level ${student.level}).
            Current Proficiency: ${avg}%. Growth Velocity: ${student.growthVelocity}%.
            Task: 
            1. 'report_card': A formal, professional summary for parents.
            2. 'trend_insights': A technical analysis for teachers focusing on velocity and intervention efficacy.
            Constraint: Use professional academic terminology. Focus on learning acceleration.`;
            
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { report_card: { type: Type.STRING }, trend_insights: { type: Type.STRING } },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            
            return JSON.parse(sanitizeJson(response.text || '{}'));
        } catch (error: any) { 
            console.error("Gemini Analysis Error Detail:", error);
            // Re-throw the actual error message to help the user diagnose the key/environment issue
            throw new Error(error.message || "The AI analysis engine encountered an unexpected error.");
        }
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        try {
            if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
                throw new Error("API_KEY not found in environment.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-3-flash-preview';

            const prompt = `Write an 'Executive Performance Briefing' for school leadership.
            Class: Level ${gradeLevel} | Cohort Size: ${studentCount}
            Avg Proficiency: ${stats.classAvg}% | Velocity: ${stats.avgVelocity}%
            Risk Profile: ${stats.interventionCount} students requiring support.
            
            Structure: 1. Institutional Health, 2. Growth Forecast, 3. Strategic Recommendations.`;

            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text || "Analysis complete but briefing content was unretrievable.";
        } catch (error: any) { 
            console.error("AI Briefing Error Detail:", error);
            throw new Error(`Briefing Handshake Failed: ${error.message}`);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) return null;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create academic material (${type}) for Level ${level} ${domain}. Context: ${promptText}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, content: { type: Type.STRING } }, 
                        required: ["title", "description", "content"] 
                    }
                }
            });
            return JSON.parse(sanitizeJson(response.text || '{}'));
        } catch (error) { 
            console.error("Resource Generation Error:", error);
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) return `Intervention for ${domain}`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Class average is ${avgScore}% in ${domain}. Generate a professional intervention focus for Level ${level}.`
            });
            return response.text?.trim() || `Intervention for ${domain}`;
        } catch (error) { return `Create practice for ${domain}`; }
    }
}