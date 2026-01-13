import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

export class GeminiService {
    private static getAI() {
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        try {
            const ai = this.getAI();
            const model = 'gemini-3-flash-preview';
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

            const prompt = `Perform a deep pedagogical analysis and write a progress report for an ESL student. 
            Data: ${JSON.stringify(dataPayload)}
            Task: Provide a "report_card" (parent-facing, encouraging) and "trend_insights" (teacher-facing, technical).`;
            
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
            
            return JSON.parse(response.text || '{}');
        } catch (error) { 
            console.error("AI Analysis failed:", error);
            throw error;
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        focusAreas: string,
        growthAssets: string,
        atRiskCount: number
    ): Promise<string> {
        try {
            const ai = this.getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a professional executive briefing for a school administrator about Level ${gradeLevel} classes. 
                Context:
                - Total students: ${studentCount}
                - Students flagged for intervention: ${atRiskCount}
                Highlight institutional health and proficiency levels. Keep it strategic.`,
            });
            
            return response.text || "Briefing unavailable.";
        } catch (error) { 
            console.error("Insight generation failed:", error);
            throw error;
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        try {
            const ai = this.getAI();
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Create classroom material (${type}) for Level ${level} in ${domain}: ${subdomain}. Request: ${promptText}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, content: { type: Type.STRING } }, 
                        required: ["title", "description", "content"] 
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) { 
            console.error("Resource generation failed:", error);
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        try {
            const ai = this.getAI();
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: `Create a practice activity prompt for Level ${level} students struggling in ${domain} (Avg ${avgScore}%).`
            });
            return response.text?.trim() || `Practice activity for ${domain}`;
        } catch (error) { 
            return `Create remedial practice for ${domain}`; 
        }
    }
}