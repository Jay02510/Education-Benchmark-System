
import { Domain, ResourceType, SubdomainMetadata } from './types';

export const DOMAINS = [
    Domain.Reading,
    Domain.Writing,
    Domain.Grammar,
    Domain.Vocabulary,
    Domain.Phonics,
    Domain.Listening,
    Domain.Speaking,
    Domain.DataLiteracy,
] as const;

export const SUBDOMAINS: Record<Domain, SubdomainMetadata[]> = {
    [Domain.Reading]: [
        { name: "Decoding CVC list", maxScore: 6 },
        { name: "Fluency passage 1", maxScore: 6 },
        { name: "Literal Qs passage", maxScore: 6 },
        { name: "Inferential Qs", maxScore: 6 },
        { name: "Nonfiction short", maxScore: 6 }
    ],
    [Domain.Writing]: [
        { name: "Sentence writing", maxScore: 5 },
        { name: "Situational writing", maxScore: 5 },
        { name: "Story writing", maxScore: 5 }
    ],
    [Domain.Grammar]: [
        { name: "Present tense task", maxScore: 4 },
        { name: "Past tense task", maxScore: 4 },
        { name: "SV agreement task", maxScore: 4 },
        { name: "Punct/Cap fix", maxScore: 3 }
    ],
    [Domain.Vocabulary]: [
        { name: "Sight word list", maxScore: 5 },
        { name: "Context cloze", maxScore: 5 }
    ],
    [Domain.Phonics]: [
        { name: "Blend ID", maxScore: 5 },
        { name: "Digraph ID", maxScore: 5 }
    ],
    [Domain.Listening]: [
        { name: "Listening Details", maxScore: 5 }
    ],
    [Domain.Speaking]: [
        { name: "Speaking Pronunciation", maxScore: 5 },
        { name: "Oral Sentences", maxScore: 2 },
        { name: "Speaking Fluency", maxScore: 2 },
        { name: "Interaction Roleplay", maxScore: 1 }
    ],
    [Domain.DataLiteracy]: [
        { name: "Data chart Qs", maxScore: 5 }
    ],
};

export const TABS = {
    STUDENTS: "Students",
    INSIGHTS: "Insights",
    LIBRARY: "Library",
    SYSTEM: "System",
} as const;

export const RESOURCE_TYPES = [
    ResourceType.MicroLesson,
    ResourceType.QuickPractice,
    ResourceType.MiniReading,
    ResourceType.Worksheet,
    ResourceType.InterventionPacket,
    ResourceType.ParentPractice,
] as const;
