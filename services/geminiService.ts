import { GoogleGenAI, Type } from "@google/genai";
import { Student, Domain, ResourceType } from '../types.ts';

/**
 * Utility to strip Markdown JSON wrappers that AI often adds
 */
const sanitizeJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export class GeminiService {
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

            const prompt = `Perform a technical pedagogical analysis for an ESL student. 
            Data: ${JSON.stringify(dataPayload)}
            Task: Provide a "report_card" (parent-facing, professional) and "trend_insights" (teacher-facing, technical). 
            Terminologies: NEVER use 'mastery'. Use 'Excellent' (80-89%) or 'Outstanding' (90%+). Focus on learning progression.`;
            
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
            
            if (!response.text) throw new Error("Empty response from AI engine.");
            return JSON.parse(sanitizeJson(response.text));
        } catch (error) { 
            console.error("AI Analysis failed:", error);
            throw error;
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        stats: any
    ): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use Flash for standard briefing summarization (higher reliability)
        const model = 'gemini-3-flash-preview';

        try {
            const prompt = `Write an Executive Performance Briefing for Level ${gradeLevel} class.
            Class Size: ${studentCount}
            Avg Proficiency: ${stats.classAvg}%
            Avg Velocity: ${stats.avgVelocity}% improvement per cycle
            Risk Profile: ${stats.interventionCount} students in Tier 2/3.
            
            Strongest Domain: ${stats.strongest || 'Various'}
            Weakest Domain: ${stats.weakest || 'Various'}

            Instructions:
            1. Summarize "Institutional Health".
            2. High-level analysis of domain performance.
            3. Professional "Growth Forecast".
            4. Use pedagogical language. 
            5. Use 'Outstanding' (90%+) and 'Excellent' (80%+).
            6. Format in professional sections.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            
            return response.text || "Briefing engine could not compile data. Please check connection.";
        } catch (error) { 
            console.error("Class Briefing Error:", error);
            throw error;
        }
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
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
            return null; 
        }
    }

    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        try {
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