
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
        interventionStatus: { tier: 2, domain: Domain.Reading, goal: 'Improve inferential reading skills by 10% in 5 weeks', trend: Trend.Stable, triggerReason: 'Reading slightly below midline average target', dateIdentified: '2023-09-20' },
        actionLog: [
            { id: 'l1', date: '2023-09-22', author: 'Teacher', category: 'Intervention', content: 'Assigned "Clue Collector" Micro-lesson sheet. Student completed it with peer helper.', impactScore: 4 },
            { id: 'l2', date: '2023-11-10', author: 'Teacher', category: 'Parent Communication', content: 'Spoke to mother regarding reading reinforcement. Recommended standard library cards.', impactScore: 3 }
        ],
    },
    {
        id: 's2',
        name: 'Bella Chen',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        overallGrowth: 18,
        growthVelocity: 8,
        velocityBand: VelocityBand.Fast,
        hasAnomaly: false,
        assessments: [
            { id: 'a3', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 75, [Domain.Writing]: 72, [Domain.Grammar]: 80, [Domain.Vocabulary]: 78, [Domain.Phonics]: 85, [Domain.Listening]: 75, [Domain.Speaking]: 74, [Domain.DataLiteracy]: 70 }, subdomainScores: {} },
            { id: 'a4', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 85, [Domain.Writing]: 80, [Domain.Grammar]: 88, [Domain.Vocabulary]: 85, [Domain.Phonics]: 92, [Domain.Listening]: 83, [Domain.Speaking]: 82, [Domain.DataLiteracy]: 80 }, subdomainScores: {} },
        ],
        interventionStatus: null,
        actionLog: [
            { id: 'l3', date: '2023-10-05', author: 'Teacher', category: 'Goal Met', content: 'Student exceeded the baseline goal for Phonics and Speaking. Handed over long vowel materials.', impactScore: 5 }
        ],
    },
    {
        id: 's3',
        name: 'Liam O\'Connor',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
        overallGrowth: 15,
        growthVelocity: 6,
        velocityBand: VelocityBand.Stable,
        hasAnomaly: false,
        assessments: [
            { id: 'a5', type: TestPeriod.Baseline, date: '2023-09-16', scores: { [Domain.Reading]: 70, [Domain.Writing]: 55, [Domain.Grammar]: 65, [Domain.Vocabulary]: 72, [Domain.Phonics]: 78, [Domain.Listening]: 68, [Domain.Speaking]: 65, [Domain.DataLiteracy]: 60 }, subdomainScores: {} },
            { id: 'a6', type: TestPeriod.Midline, date: '2023-12-04', scores: { [Domain.Reading]: 74, [Domain.Writing]: 68, [Domain.Grammar]: 70, [Domain.Vocabulary]: 78, [Domain.Phonics]: 84, [Domain.Listening]: 72, [Domain.Speaking]: 71, [Domain.DataLiteracy]: 65 }, subdomainScores: {} },
        ],
        interventionStatus: null,
        actionLog: []
    },
    {
        id: 's4',
        name: 'Chloe Park',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
        overallGrowth: 22,
        growthVelocity: 11,
        velocityBand: VelocityBand.Fast,
        hasAnomaly: false,
        assessments: [
            { id: 'a7', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 80, [Domain.Writing]: 78, [Domain.Grammar]: 75, [Domain.Vocabulary]: 82, [Domain.Phonics]: 88, [Domain.Listening]: 80, [Domain.Speaking]: 82, [Domain.DataLiteracy]: 75 }, subdomainScores: {} },
            { id: 'a8', type: TestPeriod.Midline, date: '2023-12-06', scores: { [Domain.Reading]: 92, [Domain.Writing]: 89, [Domain.Grammar]: 86, [Domain.Vocabulary]: 94, [Domain.Phonics]: 96, [Domain.Listening]: 90, [Domain.Speaking]: 92, [Domain.DataLiteracy]: 88 }, subdomainScores: {} },
        ],
        interventionStatus: null,
        actionLog: [
            { id: 'l4', date: '2023-12-08', author: 'Teacher', category: 'Observation', content: 'Exhibits extremely high language retention. Promoted to work circle lead helper.', impactScore: 5 }
        ]
    },
    {
        id: 's5',
        name: 'Hana Tanaka',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hana',
        overallGrowth: 5,
        growthVelocity: 1,
        velocityBand: VelocityBand.AtRisk,
        hasAnomaly: true,
        assessments: [
            { id: 'a9', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 58, [Domain.Writing]: 52, [Domain.Grammar]: 55, [Domain.Vocabulary]: 60, [Domain.Phonics]: 62, [Domain.Listening]: 58, [Domain.Speaking]: 54, [Domain.DataLiteracy]: 50 }, subdomainScores: {} },
            { id: 'a10', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 60, [Domain.Writing]: 54, [Domain.Grammar]: 57, [Domain.Vocabulary]: 64, [Domain.Phonics]: 65, [Domain.Listening]: 61, [Domain.Speaking]: 56, [Domain.DataLiteracy]: 52 }, subdomainScores: {} },
        ],
        interventionStatus: { tier: 3, domain: Domain.Writing, goal: 'Individualized 1:1 orthography drills 4x weekly', trend: Trend.Plateau, triggerReason: 'Critical writing & spelling gap beneath cohort standard', dateIdentified: '2023-09-17' },
        actionLog: [
            { id: 'l5', date: '2023-09-18', author: 'Teacher', category: 'Intervention', content: 'Commenced customized phonics flashcard drills. Progress is slow.', impactScore: 2 },
            { id: 'l6', date: '2023-10-25', author: 'Teacher', category: 'Parent Communication', content: 'Parent agreed to secure a weekend language sandbox program to boost spelling consistency.', impactScore: 4 }
        ]
    },
    {
        id: 's6',
        name: 'Jun Woo',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jun',
        overallGrowth: 10,
        growthVelocity: 4,
        velocityBand: VelocityBand.Stable,
        hasAnomaly: false,
        assessments: [
            { id: 'a11', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 72, [Domain.Writing]: 65, [Domain.Grammar]: 70, [Domain.Vocabulary]: 74, [Domain.Phonics]: 78, [Domain.Listening]: 75, [Domain.Speaking]: 70, [Domain.DataLiteracy]: 68 }, subdomainScores: {} },
            { id: 'a12', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 77, [Domain.Writing]: 71, [Domain.Grammar]: 74, [Domain.Vocabulary]: 80, [Domain.Phonics]: 82, [Domain.Listening]: 81, [Domain.Speaking]: 75, [Domain.DataLiteracy]: 72 }, subdomainScores: {} },
        ],
        interventionStatus: null,
        actionLog: []
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
