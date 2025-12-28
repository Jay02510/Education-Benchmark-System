import { Domain } from '../types';

export interface FrameworkPreset {
    name: string;
    description: string;
    domains: string[];
    subdomains: Record<string, string[]>;
}

export const PRESETS: FrameworkPreset[] = [
    {
        name: "Standard ESL (CEFR Based)",
        description: "Focuses on the four core skills plus grammar, aligned with international Cambridge/CEFR standards.",
        domains: [
            "Reading",
            "Writing",
            "Listening",
            "Speaking",
            "Grammar",
            "Vocabulary"
        ],
        subdomains: {
            "Reading": ["Gist & Detail", "Inference", "Text Structure", "Decoding"],
            "Writing": ["Accuracy", "Coherence", "Range", "Task Achievement"],
            "Listening": ["Global Understanding", "Specific Information", "Deduction"],
            "Speaking": ["Fluency", "Pronunciation", "Interaction", "Vocabulary Range"],
            "Grammar": ["Tenses", "Sentence Structure", "Prepositions", "Articles"],
            "Vocabulary": ["Topic Vocabulary", "Collocations", "Word Formation"]
        }
    },
    {
        name: "Academic English (WIDA Style)",
        description: "Suited for international schools integrating content and language learning (CLIL).",
        domains: [
            "Social & Instructional",
            "Lang. of Language Arts",
            "Lang. of Mathematics",
            "Lang. of Science",
            "Lang. of Social Studies"
        ],
        subdomains: {
            "Social & Instructional": ["Classroom Interactions", "Rules & Procedures", "Personal Needs"],
            "Lang. of Language Arts": ["Narrative Structure", "Character Analysis", "Argumentation"],
            "Lang. of Mathematics": ["Processes", "Measurement", "Geometry", "Data Analysis"],
            "Lang. of Science": ["Hypothesis", "Experimentation", "Classification", "Process Explanation"],
            "Lang. of Social Studies": ["Cause & Effect", "Timeline/Chronology", "Geography"]
        }
    },
    {
        name: "Early Literacy (Phonics Heavy)",
        description: "Designed for K-2 or absolute beginners focusing on reading acquisition.",
        domains: [
            "Phonemic Awareness",
            "Phonics",
            "Fluency",
            "Vocabulary",
            "Comprehension"
        ],
        subdomains: {
            "Phonemic Awareness": ["Rhyming", "Blending", "Segmentation"],
            "Phonics": ["Consonants", "Short Vowels", "Digraphs", "Long Vowels"],
            "Fluency": ["Accuracy", "Rate", "Expression"],
            "Vocabulary": ["Sight Words", "Picture Naming", "Oral Definitions"],
            "Comprehension": ["Retelling", "Prediction", "Connections"]
        }
    }
];