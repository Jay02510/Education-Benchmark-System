
import { FunctionDeclaration, Type } from "@google/genai";

export const teacherTools: FunctionDeclaration[] = [
    {
        name: "get_class_summary",
        description: "Get a high-level summary of the class performance, including average score, number of students, and number of students at risk.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        }
    },
    {
        name: "get_student_details",
        description: "Get detailed information about a specific student, including their latest scores, level, and intervention status.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                studentName: {
                    type: Type.STRING,
                    description: "The name of the student to look up (e.g., 'Alex', 'Bella')."
                }
            },
            required: ["studentName"]
        }
    },
    {
        name: "list_at_risk_students",
        description: "List all students who are currently flagged as at-risk or needing intervention.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
        }
    },
    {
        name: "get_domain_performance",
        description: "Get the class average score for a specific domain (e.g., Reading, Writing).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                domain: {
                    type: Type.STRING,
                    description: "The academic domain to check (e.g., Reading, Writing, Grammar, Vocabulary, Phonics, Listening, Speaking)."
                }
            },
            required: ["domain"]
        }
    },
    {
        name: "search_resources",
        description: "Search the educational resource bank for materials, worksheets, or lesson plans.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "Keywords to search for (e.g. 'past tense', 'inference')." },
                domain: { type: Type.STRING, description: "Optional domain filter." },
                level: { type: Type.STRING, description: "Optional level filter." }
            },
            required: ["query"]
        }
    },
    {
        name: "get_benchmark_standards",
        description: "Get the specific benchmark targets and descriptors for a given level and domain.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                level: { type: Type.STRING, description: "Grade level (e.g. '5', '6-1')." },
                domain: { type: Type.STRING, description: "Domain (e.g. 'Reading', 'Writing')." }
            },
            required: ["level", "domain"]
        }
    }
];

export const adminTools: FunctionDeclaration[] = [
    {
        name: "get_system_stats",
        description: "Get system-wide statistics including total users, storage usage, and system health.",
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
        name: "check_database_health",
        description: "Run a diagnostic check on the database connection and integrity.",
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    }
];
