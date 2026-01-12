
import { Student, Domain, Resource, ResourceType, TestPeriod } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly and use named parameter in constructor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
    
    // Unified Analysis Engine (Replaces individual Student/Trend calls)
    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        // Use recommended model for text tasks
        const model = 'gemini-3-flash-preview';
        
        // 1. Prepare Rich Data Payload
        const sortedAssessments = [...student.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const latest = sortedAssessments[sortedAssessments.length - 1];
        
        // Calculate averages for context
        const scores = latest ? Object.values(latest.scores) as number[] : [];
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        const dataPayload = {
            student: { name: student.name, level: student.level, current_avg: avg },
            history: sortedAssessments.map(a => ({
                period: a.type,
                date: a.date,
                scores: a.scores
            })),
            intervention: student.interventionStatus ? {
                active: true,
                reason: student.interventionStatus.triggerReason,
                goal: student.interventionStatus.goal
            } : { active: false }
        };

        const prompt = `
        You are an experienced, encouraging Educational Coach. 
        Your goal is to analyze this student's data and provide clear, actionable insights for parents and teachers.

        **Tone Guidelines:**
        - **Warm & Constructive:** Never use technical jargon like "velocity", "discrepancy", "variance", or "anomaly".
        - **Action-Oriented:** Focus on "what to do next" rather than just "what happened".
        - **Simple Formatting:** **DO NOT USE MARKDOWN HEADERS (like # or ###).** Use **Bold** for titles only.

        **Input Data:**
        ${JSON.stringify(dataPayload, null, 2)}

        **Required Output (JSON):**
        Return a JSON object with two fields:
        1. "report_card": A narrative for the parents.
           - Start with a **Summary** paragraph.
           - Then provide a **Strength & Growth** section.
           - End with **Home Tips** (2 simple things parents can do).
        
        2. "trend_insights": A practical analysis for the teacher.
           - **Progress Speed:** Are they improving fast, steady, or stuck? (Use simple language).
           - **Pattern Spotting:** Is there a gap between Reading vs Speaking? Or specific dips?
           - **The Action Plan:** 2 specific classroom moves for next week.

        Make the "trend_insights" sound like advice from a mentor teacher, not a data scientist.
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
                            report_card: { type: Type.STRING },
                            trend_insights: { type: Type.STRING }
                        }
                    }
                }
            });

            // Use the .text property directly
            return JSON.parse(response.text || '{}');
        } catch (error) {
            console.error("Error generating comprehensive analysis:", error);
            return {
                report_card: "Unable to generate report at this time.",
                trend_insights: "Unable to analyze trends at this time."
            };
        }
    }

    static async generateClassInsight(
        gradeLevel: string,
        studentCount: number,
        weakestDomain: string,
        strongestDomain: string,
        atRiskCount: number
    ): Promise<string> {
        const model = 'gemini-3-flash-preview';
        const prompt = `
        You are a Teaching Mentor reviewing class data.
        Provide a warm, human-centered analysis.
        
        **Class Context:**
        - Grade: ${gradeLevel} (${studentCount} students)
        - Superpower: ${strongestDomain}
        - Focus Area: ${weakestDomain}
        - Students needing support: ${atRiskCount}
        
        **Output Rules:**
        - **NO MARKDOWN HEADERS (###).** Use **Bold** for section titles.
        - **Tone:** Personable, encouraging, and strategic.
        
        **Sections:**
        1. **The Classroom Vibe:** How is the class doing overall? Connect ${strongestDomain} to ${weakestDomain}.
        2. **Try This Strategy:** A fun, concrete activity using their strength in ${strongestDomain} to help with ${weakestDomain}.
        3. **Supporting the Few:** A compassionate tip for the ${atRiskCount} students who need help.
        `;

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            return response.text || "**Error:** Unable to generate response text.";
        } catch (error) {
            return "**Error:** Unable to generate class analysis.";
        }
    }

    static async generateResourceContent(
        domain: Domain,
        subdomain: string,
        type: ResourceType,
        level: string,
        prompt: string
    ): Promise<{ title: string; description: string; content: string } | null> {
        const model = "gemini-3-flash-preview";
        const fullPrompt = `
        Generate a resource for:
        - Level: ${level}
        - Domain: ${domain} (${subdomain})
        - Type: ${type}
        - Context: "${prompt}"

        Return JSON with: title, description (max 2 sentences), content (plain text/markdown).
        `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            content: { type: Type.STRING },
                        },
                        required: ["title", "description", "content"],
                    },
                },
            });
            return JSON.parse(response.text || '{}');
        } catch (error) {
            return null;
        }
    }

    // Helper to generate a prompt based on class weakness
    static async generateRemedialPrompt(domain: Domain, avgScore: number, level: string): Promise<string> {
        const model = 'gemini-3-flash-preview';
        const prompt = `
        Class Level: ${level}
        Struggling Domain: ${domain} (Avg: ${avgScore}%)
        
        Generate a single-sentence prompt for a resource generator to create a confidence-boosting activity.
        `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return (response.text || '').trim();
        } catch (error) {
            return `Create a fun and simple remedial activity for ${domain} suitable for ${level} students.`;
        }
    }

    static async getRecommendedResources(domain: Domain, subdomain: string, level: string): Promise<Resource[]> {
        const model = 'gemini-3-flash-preview';
        const prompt = `
        Suggest 2 educational resource ideas for Level ${level} students struggling with ${domain}.
        Return JSON with an array of objects: { title, description, type, domain, subdomain }.
        Types: Micro-Lesson, Quick Practice Card, Worksheet, Parent Home Practice.
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
                    },
                },
            });

            const parsed = JSON.parse(response.text || '{"resources":[]}');
            
            return parsed.resources.map((r: any, index: number) => ({
                id: `ai-sugg-${Date.now()}-${index}`,
                ...r,
                level,
                period: TestPeriod.Baseline,
                content: "Content not yet generated.",
                aiGenerated: true
            }));

        } catch (error) {
            return [];
        }
    }
}
