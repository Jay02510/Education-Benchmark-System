
import { Student, Domain, ResourceType } from '../types.ts';

/**
 * GeminiService is currently disabled to prevent connectivity errors.
 * All generative features have been removed.
 */
export class GeminiService {
    static async generateMicroNarrative(context: string): Promise<string> {
        return "Manual data tracking active.";
    }

    static async generateClassInsight(gradeLevel: string, studentCount: number, stats: any): Promise<string> {
        return "Class data metrics verified and recorded.";
    }

    static async generateComprehensiveStudentAnalysis(student: Student): Promise<{ report_card: string, trend_insights: string }> {
        return {
            report_card: "Manual report card generation active.",
            trend_insights: "Audit logs are based on recorded assessment data."
        };
    }

    static async generateResourceContent(domain: Domain, subdomain: string, type: ResourceType, level: string, promptText: string): Promise<{ title: string; description: string; content: string } | null> {
        return null;
    }

    static async generateRemedialPrompt(domain: string, avgScore: number, gradeLevel: string): Promise<string> {
        return "Focus on core proficiency gaps for this domain.";
    }
}
