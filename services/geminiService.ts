import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

/**
 * Utility to strip Markdown JSON wrappers that AI often adds
 */
const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    /**
     * Safely retrieves the API key with validation
     */
    private static getApiKey(): string {
        const key = process.env.API_KEY;
        if (!key || key === 'undefined' || key.length < 5) {
            throw new Error("Missing or Invalid API Key. Please ensure you have added a variable named 'API_KEY' in your Vercel project settings.");
        }
        return key;
    }

    private static handleAiError(error: any): never {
        console.error("Gemini API Error Detail:", error);
        const msg = error.message || "";
        
        if (msg.includes("API_KEY") || msg.includes("key") || msg.includes("unauthorized")) {
             throw new Error("API Authentication Failed. Check your Vercel 'API_KEY' variable and redeploy.");
        }
        
        if (msg.includes("Quota") || msg.includes("limit")) {
             throw new Error("AI capacity reached. Please try again in 60 seconds.");
        }

        throw error;
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const apiKey = this.getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-3-pro-preview';
        
        try {
            const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const latest = sortedAssessments[sortedAssessments.length - 1];
            const scores = latest ? Object.values(latest.scores) as number[] : [];
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            const dataPayload = {
                student: { 
                    name: student.name, 
                    level: student.level, 
                    current_avg: avg,
                    velocity: student.growthVelocity,
                    intervention: student.interventionStatus 
                },
                history: sortedAssessments.map(a => ({ period: a.type, date: a.date, scores: a.scores }))
            };

            const prompt = `Perform a technical ESL analysis for student ${student.name}. 
            Data: ${JSON.stringify(dataPayload)}
            Task: Provide a "report_card" (parent-facing) and "trend_insights" (teacher-facing). 
            Terminologies: Never use 'mastery'. Use 'Outstanding' (90%+) or 'Excellent' (80-89%).`;
            
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { 
                            report_card: { type: Type.STRING }, 
                            trend_insights: { type: Type.STRING } 
                        },
                        required: ["report_card", "trend_insights"]
                    }
                }
            });
            
            if (!response.text) throw new Error("Empty response from AI.");
            return JSON.parse(sanitizeJson(response.text));
        } catch (error) { 
            return this.handleAiError(error);
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        stats: any
    ): Promise<string> {
        const apiKey = this.getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-3-flash-preview';

        try {
            const prompt = `Write an Executive Performance Briefing for Level ${gradeLevel} class.
            Class Size: ${studentCount}
            Avg Proficiency: ${stats.classAvg}%
            Avg Velocity: ${stats.avgVelocity}% 
            Risk Profile: ${stats.interventionCount} students in Tier 2/3.
            
            Strongest: ${stats.strongest || 'Various'}
            Weakest: ${stats.weakest || 'Various'}

            Instructions: Format in professional sections with bold headers. Summarize institutional health and growth forecast.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            
            return response.text || "Briefing engine could not compile data.";
        } catch (error) { 
            return this.handleAiError(error);
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create material (${type}) for Level ${level} in ${domain}. Prompt: ${promptText}.`,
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
            console.error("Resource error:", error);
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const apiKey = this.getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Create a remedial practice prompt for Level ${level} in ${domain} (Avg ${avgScore}%).`
            });
            return response.text?.trim() || `Support activity for ${domain}`;
        } catch (error) { 
            return `Create practice for ${domain}`; 
        }
    }
}