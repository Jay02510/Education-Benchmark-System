
import { Student, Benchmark, Domain, TestPeriod, Trend, TeacherStrategy, Resource, ResourceType, VelocityBand } from '../types';

let bCounter = 0;
const createBench = (level: string, period: TestPeriod, domain: Domain, target: number, desc: string, cefr: string, yle: string): Benchmark => {
    bCounter++;
    return {
        id: `bench-${level}-${bCounter}`,
        level_name: level,
        period,
        domain,
        target_percent: target,
        descriptor_short: desc,
        cefr_alignment: cefr,
        yle_equivalent: yle
    };
};

export const mockStudents: Student[] = [
    {
        id: 's1',
        name: 'Alex Kim',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        overallGrowth: 12,
        growthVelocity: 4,
        velocityBand: VelocityBand.Stable,
        hasAnomaly: true,
        assessments: [
            { 
                id: 'a1', 
                type: TestPeriod.Baseline, 
                date: '2023-09-15', 
                scores: { [Domain.Reading]: 65, [Domain.Writing]: 60, [Domain.Grammar]: 70, [Domain.Vocabulary]: 68, [Domain.Phonics]: 75, [Domain.Listening]: 62, [Domain.Speaking]: 60, [Domain.DataLiteracy]: 55 },
                subdomainScores: {} 
            },
            { 
                id: 'a2', 
                type: TestPeriod.Midline, 
                date: '2023-12-05', 
                scores: { [Domain.Reading]: 70, [Domain.Writing]: 68, [Domain.Grammar]: 72, [Domain.Vocabulary]: 75, [Domain.Phonics]: 80, [Domain.Listening]: 70, [Domain.Speaking]: 68, [Domain.DataLiteracy]: 65 },
                subdomainScores: {}
            },
        ],
        interventionStatus: { tier: 1, domain: Domain.Reading, goal: 'Improve inferential skills by 10% in 3 weeks', trend: Trend.Stable, triggerReason: 'Low initial baseline', dateIdentified: '2023-09-20' },
        actionLog: [],
    },
    {
        id: 's2',
        name: 'Bella Chen',
        level: '6-1',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        overallGrowth: 18,
        growthVelocity: 6,
        velocityBand: VelocityBand.Stable,
        hasAnomaly: false,
        assessments: [
            { id: 'a3', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 75, [Domain.Writing]: 72, [Domain.Grammar]: 80, [Domain.Vocabulary]: 78, [Domain.Phonics]: 85, [Domain.Listening]: 75, [Domain.Speaking]: 74, [Domain.DataLiteracy]: 70 }, subdomainScores: {} },
            { id: 'a4', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 85, [Domain.Writing]: 80, [Domain.Grammar]: 88, [Domain.Vocabulary]: 85, [Domain.Phonics]: 92, [Domain.Listening]: 83, [Domain.Speaking]: 82, [Domain.DataLiteracy]: 80 }, subdomainScores: {} },
        ],
        interventionStatus: null,
        actionLog: [],
    }
];

// 🌍 COMPREHENSIVE INTERNATIONAL FRAMEWORK SEED
export const mockBenchmarkFramework: Benchmark[] = [
    // --- LEVEL 5: PRE-A1 (STARTERS EQUIVALENT) ---
    createBench("5", TestPeriod.Baseline, Domain.Reading, 75, "Recognizes capital/lowercase letters; matches 15+ high-frequency CVC word shapes.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Phonics, 80, "Identifies individual letter sounds (S-A-T-P-I-N); demonstrates initial sound isolation.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Speaking, 70, "Responds to basic 'What is your name?' and 'How are you?' with 1-2 word phrases.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Listening, 75, "Follows 1-step physical instructions (e.g., 'Pick up the pencil') with visual aid.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Writing, 70, "Demonstrates correct pencil grip; copies vertical lines, circles, and own name.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Grammar, 70, "Distinguishes between singular and plural objects using 'a' and 's' endings.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Vocabulary, 80, "Recognizes 20+ basic nouns (Colors, Animals, Classroom Objects).", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.DataLiteracy, 70, "Identifies simple patterns in a 3-object sequence with visual prompts.", "Pre-A1", "Pre-Starters"),

    createBench("5", TestPeriod.Midline, Domain.Reading, 80, "Decodes CVC words with 90% accuracy; reads 3-word sight-phrase sentences.", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Phonics, 85, "Blends sounds into words (C-A-T); recognizes basic digraphs (SH, CH, TH).", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Speaking, 75, "Names 10+ objects in a picture; uses 'It is a...' sentence pattern.", "Pre-A1", "Pre-Starters"),

    createBench("5", TestPeriod.Endline, Domain.Reading, 85, "Answers literal 'Who' and 'What' questions about a 2-sentence illustrated story.", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Speaking, 80, "Describes a simple picture using 3+ sentences with basic adjectives (big, small, red).", "Pre-A1", "Starters"),

    // --- LEVEL 6-1: A1 (CAMBRIDGE STARTERS) ---
    createBench("6-1", TestPeriod.Baseline, Domain.Reading, 80, "Reads short paragraphs; identifies main character and setting in simple fiction.", "A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Grammar, 80, "Uses Present Simple (am/is/are) correctly in 1st and 3rd person singular.", "A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Phonics, 85, "Decodes CVCC/CCVC words; recognizes long vowel sounds (silent E).", "A1", "Starters"),

    // --- LEVEL 6-2: A1+ (CAMBRIDGE MOVERS) ---
    createBench("6-2", TestPeriod.Baseline, Domain.Reading, 80, "Understands simple descriptions of people/places; follows 3-part written instructions.", "A1+", "Movers"),
    createBench("6-2", TestPeriod.Baseline, Domain.Speaking, 75, "Asks/answers questions about habits; explains differences between two pictures.", "A1+", "Movers"),

    // --- LEVEL 7-2: A2 (CAMBRIDGE FLYERS) ---
    createBench("7-2", TestPeriod.Baseline, Domain.Reading, 80, "Identifies specific information in factual texts; summarizes a 150-word story.", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Writing, 75, "Writes a short story (30-50 words) based on a sequence of 3 pictures.", "A2", "Flyers"),

    // --- LEVEL 7-3: A2+ (CAMBRIDGE KET) ---
    createBench("7-3", TestPeriod.Baseline, Domain.Reading, 80, "Extracts key info from public notices/emails; identifies writer's purpose.", "A2+", "KET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Grammar, 75, "Uses Present Perfect and Past Continuous with 80% accuracy in context.", "A2+", "KET")
];

export const mockStrategies: TeacherStrategy[] = [
    { id: 'ts1', author: 'Jane Doe', domain: Domain.Reading, problemArea: 'Inferential Comprehension', tier: 1, title: 'Question-Answer Relationship (QAR)', description: 'Teach students to identify where to find answers to questions.' },
];

export const mockResources: Resource[] = [
    {
        id: 'r1',
        domain: Domain.Reading,
        subdomain: 'Inferential Comp',
        level: '5',
        period: TestPeriod.Midline,
        type: ResourceType.MicroLesson,
        title: 'Clue Collector',
        description: 'A 3-minute activity where students read short sentences and circle "clue" words.',
        content: 'Character: "Maria slammed the door."\nQuestion: Which word tells you Maria might be angry?\n\nAnswer: "slammed" describes high-velocity actions associated with frustration.'
    },
    {
        id: 'r2',
        domain: Domain.Phonics,
        subdomain: 'Phonology Intro',
        level: '5',
        period: TestPeriod.Baseline,
        type: ResourceType.QuickPractice,
        title: 'Voice Wave Builders',
        description: 'Phonetic drill focusing on initial consonants (s, a, t, p). Pair students to practice vocal intensity shifts.',
        content: 'Action Loop:\n1. Vocalize "sssss" then snap to "aaaatt".\n2. Blend: "ssss-aaaa-tttt" -> "sat".\n3. Match word to flashcards representing "sat", "pat", and "tap".'
    },
    {
        id: 'r3',
        domain: Domain.Writing,
        subdomain: 'Syntax & Forms',
        level: '5',
        period: TestPeriod.Baseline,
        type: ResourceType.Worksheet,
        title: 'Compound Connectors',
        description: 'Interactive compound sentence creation scaffold. Guides students to combine isolated clauses.',
        content: 'Sentence Fusion Guide:\n1. "The sun is hot." [AND] "The sky is blue."\n--> "The sun is hot and the sky is blue."\n\nChallenge 1:\n"Leo runs fast." [BUT] "The grass is wet."\n--> "Leo runs fast but the grass is wet."'
    },
    {
        id: 'r4',
        domain: Domain.Vocabulary,
        subdomain: 'Categorization',
        level: '5',
        period: TestPeriod.Midline,
        type: ResourceType.MiniReading,
        title: 'Nature Context Explorer',
        description: 'Short illustrated text used to teach natural category descriptors (forest, river, mountain).',
        content: 'Passage:\n\n"The green forest is home to tall pine trees. A clean river flows down from the snowy mountain peaks."\n\nGroup Tasks:\n1. Highlight the blue elements (river).\n2. Circle the green elements (forest, trees).\n3. Match descriptors to context maps.'
    }
];
