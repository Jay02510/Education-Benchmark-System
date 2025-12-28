
import { Student, Benchmark, Domain, TestPeriod, Trend, TeacherStrategy, Resource, ResourceType } from '../types';

// Helper to generate mock subdomain scores for a given domain average
const genSubScores = (domain: Domain, avg: number): Record<string, number> => {
    const scores: Record<string, number> = {};
    // Simplified mapping based on new constants
    const subdomains = [
        "Decoding & Word Rec", "Literal Comp", "Inferential Comp", 
        "Sentence Construction", "Text Organization", 
        "Verb Tenses", "Agreement & Consistency",
        "Sight Words", "Academic Vocabulary",
        "Phoneme Awareness", "Decoding Patterns",
        "Detail Recognition", "Dialogues & Stories",
        "Pronunciation", "Communication Skills",
        "Chart Interpretation", "Comparison & Inference"
    ]; 
    
    subdomains.forEach(sub => {
        const variance = Math.floor(Math.random() * 10) - 5;
        scores[`${domain}:${sub}`] = Math.min(100, Math.max(0, avg + variance));
    });
    return scores;
};

// Updated mock students to use separate Listening and Speaking domains
export const mockStudents: Student[] = [
    {
        id: 's1',
        name: 'Alex Kim',
        level: '5',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        overallGrowth: 12,
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
    },
    {
        id: 's2',
        name: 'Bella Chen',
        level: '6-1',
        class: 'Class A',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        overallGrowth: 18,
        hasAnomaly: false,
        assessments: [
            { id: 'a3', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 75, [Domain.Writing]: 72, [Domain.Grammar]: 80, [Domain.Vocabulary]: 78, [Domain.Phonics]: 85, [Domain.Listening]: 75, [Domain.Speaking]: 74, [Domain.DataLiteracy]: 70 }, subdomainScores: {} },
            { id: 'a4', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 85, [Domain.Writing]: 80, [Domain.Grammar]: 88, [Domain.Vocabulary]: 85, [Domain.Phonics]: 92, [Domain.Listening]: 83, [Domain.Speaking]: 82, [Domain.DataLiteracy]: 80 }, subdomainScores: {} },
        ],
        interventionStatus: null,
    },
    {
        id: 's3',
        name: 'Chris Lee',
        level: '5',
        class: 'Class B',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
        overallGrowth: -3,
        hasAnomaly: true,
        assessments: [
            { id: 'a5', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 55, [Domain.Writing]: 50, [Domain.Grammar]: 60, [Domain.Vocabulary]: 58, [Domain.Phonics]: 65, [Domain.Listening]: 52, [Domain.Speaking]: 50, [Domain.DataLiteracy]: 45 }, subdomainScores: {} },
            { id: 'a6', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 52, [Domain.Writing]: 51, [Domain.Grammar]: 58, [Domain.Vocabulary]: 60, [Domain.Phonics]: 63, [Domain.Listening]: 50, [Domain.Speaking]: 48, [Domain.DataLiteracy]: 48 }, subdomainScores: {} },
        ],
        interventionStatus: { tier: 2, domain: Domain.Writing, goal: 'Improve organization in writing by 10% in 4 weeks', trend: Trend.Down, triggerReason: 'Regression in scores', dateIdentified: '2023-11-15' },
    },
    {
        id: 's4',
        name: 'Dana Smith',
        level: '7-2',
        class: 'Class B',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana',
        overallGrowth: 15,
        hasAnomaly: false,
        assessments: [
            { id: 'a7', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 80, [Domain.Writing]: 82, [Domain.Grammar]: 78, [Domain.Vocabulary]: 85, [Domain.Phonics]: 90, [Domain.Listening]: 81, [Domain.Speaking]: 80, [Domain.DataLiteracy]: 77 }, subdomainScores: {} },
            { id: 'a8', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 88, [Domain.Writing]: 89, [Domain.Grammar]: 85, [Domain.Vocabulary]: 92, [Domain.Phonics]: 95, [Domain.Listening]: 88, [Domain.Speaking]: 87, [Domain.DataLiteracy]: 85 }, subdomainScores: {} },
        ],
        interventionStatus: null,
    },
];

// Helper to create a specific benchmark entry
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

// FULL BENCHMARK FRAMEWORK FROM DOCUMENTATION
export const mockBenchmarkFramework: Benchmark[] = [
    // ================= LEVEL 5 (5Y) =================
    // Q1 (Baseline)
    createBench("5", TestPeriod.Baseline, Domain.Reading, 60, "Recognizes letter names; matches CVC words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Phonics, 60, "Identifies sounds; blends simple CVC", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Vocabulary, 60, "~10 sight words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Writing, 60, "Copies letters; traces simple words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Grammar, 60, "Identifies nouns/verbs in images", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Listening, 60, "Responds to yes/no questions", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Speaking, 60, "Names familiar items", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.DataLiteracy, 60, "Reads simple colors/shapes in charts", "Pre-A1", "Pre-Starters"),

    // Q2 (Midline)
    createBench("5", TestPeriod.Midline, Domain.Reading, 70, "Decodes CVC words (~70% accuracy)", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Phonics, 70, "Blends CVC + beginning blends", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Vocabulary, 70, "~20 sight words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Writing, 70, "Labels pictures", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Grammar, 70, "Understands basic plurals", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Listening, 70, "Follows 1-step directions", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.Speaking, 70, "Short responses ('I see a...')", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Midline, Domain.DataLiteracy, 70, "Answers 'Which has more?'", "Pre-A1", "Pre-Starters"),

    // Q4 (Endline)
    createBench("5", TestPeriod.Endline, Domain.Reading, 80, "Reads basic sentences (80% acc)", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Phonics, 80, "Blends CVC & simple blends independently", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Vocabulary, 80, "40-50 sight words", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Writing, 80, "Writes 2-3 word captions", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Grammar, 80, "Applies nouns/verbs in simple sentences", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Listening, 80, "Follows 2-step directions", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.Speaking, 80, "Full-sentence responses to familiar topics", "Pre-A1", "Starters"),
    createBench("5", TestPeriod.Endline, Domain.DataLiteracy, 80, "Interprets 'most/least' in pictograms", "Pre-A1", "Starters"),

    // ================= LEVEL 6-1 =================
    // Q1 (Baseline)
    createBench("6-1", TestPeriod.Baseline, Domain.Reading, 60, "Decodes CVC + common blends; short sentences", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Writing, 60, "Writes 1-2 simple sentences", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Grammar, 60, "Uses I/you/he/she + present tense", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Vocabulary, 60, "25 sight words", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Phonics, 60, "Beginning digraphs (sh, ch, th)", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Listening, 60, "Answers WH-questions with support", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Speaking, 60, "1-2 sentence responses", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.DataLiteracy, 60, "Answers 'how many' questions", "Mid Pre-A1", "Starters"),

    // Q2 (Midline)
    createBench("6-1", TestPeriod.Midline, Domain.Reading, 70, "Reads 3-5 sentence passages; literal comp", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Writing, 70, "Sentences with correct spacing/capitals", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Grammar, 70, "Basic subject-verb agreement", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Vocabulary, 70, "40 sight words", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Phonics, 70, "Reads blends + digraphs automatically", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Listening, 70, "Answers WH questions independently", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.Speaking, 70, "Short responses with details", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Midline, Domain.DataLiteracy, 70, "Compares 2 categories", "Mid Pre-A1", "Starters"),

    // Q4 (Endline)
    createBench("6-1", TestPeriod.Endline, Domain.Reading, 80, "Reads beginner-level passages fluently", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Writing, 80, "Writes 3-4 sentences with basic cohesion", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Grammar, 80, "Consistent tense control", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Vocabulary, 80, "70+ sight words", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Phonics, 80, "Applies phonics to spelling", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Listening, 80, "Answers comprehension questions", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.Speaking, 80, "3-5 sentence picture descriptions", "Mid Pre-A1", "Starters"),
    createBench("6-1", TestPeriod.Endline, Domain.DataLiteracy, 80, "Answer comparison + inference Qs", "Mid Pre-A1", "Starters"),

    // ================= LEVEL 6-2 =================
    // Q1 (Baseline)
    createBench("6-2", TestPeriod.Baseline, Domain.Reading, 60, "Reads short passages; answers literal Qs", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Writing, 60, "2-3 sentences expressing ideas", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Grammar, 60, "S/V agreement; basic past tense", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Vocabulary, 60, "50 sight words + theme vocabulary", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Phonics, 60, "Complex blends and digraphs fluently", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Listening, 60, "Matches details from audio", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.Speaking, 60, "Gives simple explanations", "Pre-A1", "Starters"),
    createBench("6-2", TestPeriod.Baseline, Domain.DataLiteracy, 60, "Compares categories (bigger/smaller)", "Pre-A1", "Starters"),

    // Q2 (Midline)
    createBench("6-2", TestPeriod.Midline, Domain.Reading, 70, "Paragraph comprehension; sequence events", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Writing, 70, "Multi-sentence paragraphs", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Grammar, 70, "Using present continuous + simple past", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Vocabulary, 70, "75+ sight words", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Phonics, 70, "Decodes multisyllabic words with guidance", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Listening, 70, "Identifies main idea from short audio", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.Speaking, 70, "3-4 sentence descriptions", "A1", "Movers"),
    createBench("6-2", TestPeriod.Midline, Domain.DataLiteracy, 70, "Reads bar/picture charts", "A1", "Movers"),

    // Q4 (Endline)
    createBench("6-2", TestPeriod.Endline, Domain.Reading, 80, "Inference-ready; summarizes texts", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Writing, 80, "Organized paragraphs with transitions", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Grammar, 80, "Applies multiple tenses accurately", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Vocabulary, 80, "120-150 words", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Phonics, 80, "Writes using phonetic knowledge", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Listening, 80, "Understands longer exchanges", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.Speaking, 80, "Explains ideas clearly", "A1", "Movers"),
    createBench("6-2", TestPeriod.Endline, Domain.DataLiteracy, 80, "Reads line/bar charts confidently", "A1", "Movers"),

    // ================= LEVEL 7-2 =================
    // Q1 (Baseline)
    createBench("7-2", TestPeriod.Baseline, Domain.Reading, 60, "Multisyllabic decoding; literal + vocab-in-context", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Writing, 60, "Structured responses with details", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Grammar, 60, "Present, past, S/V agreement", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Vocabulary, 60, "75 sight words + topic words", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Listening, 60, "Detail comprehension", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.Speaking, 60, "Pronunciation + 2-3 sentence answers", "A1", "Movers"),
    createBench("7-2", TestPeriod.Baseline, Domain.DataLiteracy, 60, "Simple graph interpretation", "A1", "Movers"),
    // Phonics is less emphasized at this level in description but we will infer
    createBench("7-2", TestPeriod.Baseline, Domain.Phonics, 60, "Consolidating multisyllabic decoding", "A1", "Movers"),


    // Q2 (Midline)
    createBench("7-2", TestPeriod.Midline, Domain.Reading, 70, "Inference questions introduced; nonfiction", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Writing, 70, "Multi-sentence responses", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Grammar, 70, "Past/present consistency", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Vocabulary, 70, "100 sight words; context inference", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Listening, 70, "WH-based comprehension", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Speaking, 70, "Picture descriptions (4-5 sentences)", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.DataLiteracy, 70, "Compare categories across graphs", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Midline, Domain.Phonics, 70, "Fluent multisyllabic reading", "A2", "Flyers"),

    // Q4 (Endline)
    createBench("7-2", TestPeriod.Endline, Domain.Reading, 80, "Multi-paragraph comprehension with inference", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Writing, 80, "Organized paragraphs with transitions & purpose", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Grammar, 80, "Grammar used consistently across all tasks", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Vocabulary, 80, "150-200 words", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Listening, 80, "Comprehends multi-part questions", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Speaking, 80, "Explains ideas clearly with details", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.DataLiteracy, 80, "Interprets bar/line charts and justifies", "A2", "Flyers"),
    createBench("7-2", TestPeriod.Endline, Domain.Phonics, 80, "Advanced decoding automaticity", "A2", "Flyers"),

    // ================= LEVEL 7-3 =================
    // Q1 (Baseline)
    createBench("7-3", TestPeriod.Baseline, Domain.Reading, 60, "Multi-paragraph texts; make simple inferences", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Writing, 60, "Short paragraphs with purpose", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Grammar, 60, "Imperatives, modals (can/can't/must)", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Vocabulary, 60, "100-150 academic + theme words", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Listening, 60, "Understand short stories", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Speaking, 60, "Retell events with sequence words", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.DataLiteracy, 60, "Compare multi-set chart data", "A2+", "KET/PET"),
    createBench("7-3", TestPeriod.Baseline, Domain.Phonics, 60, "Fluency focus", "A2+", "KET/PET"),


    // Q2 (Midline)
    createBench("7-3", TestPeriod.Midline, Domain.Reading, 70, "Summaries + inference", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Writing, 70, "Paragraph with topic/supporting sentences", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Grammar, 70, "Present perfect introduced", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Vocabulary, 70, "150-200 words", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Listening, 70, "Predict outcomes from audio", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Speaking, 70, "Give opinions with reasons", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.DataLiteracy, 70, "Interpret line charts", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Midline, Domain.Phonics, 70, "Reading complex text smoothly", "B1", "KET/PET"),

    // Q4 (Endline)
    createBench("7-3", TestPeriod.Endline, Domain.Reading, 80, "Multi-paragraph comprehension with synthesis", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Writing, 80, "Fully structured paragraph", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Grammar, 80, "Strong control of major forms", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Vocabulary, 80, "300+ functional vocabulary", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Listening, 80, "Understand longer spoken input", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Speaking, 80, "Clear, fluent explanations", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.DataLiteracy, 80, "Interprets multi-variate charts", "B1", "KET/PET"),
    createBench("7-3", TestPeriod.Endline, Domain.Phonics, 80, "Full reading automaticity", "B1", "KET/PET"),
];

export const mockStrategies: TeacherStrategy[] = [
    { id: 'ts1', author: 'Jane Doe', domain: Domain.Reading, problemArea: 'Inferential Comprehension', tier: 1, title: 'Question-Answer Relationship (QAR)', description: 'Teach students to identify where to find answers to questions (in the text or in their head). Practice with short passages.' },
    { id: 'ts2', author: 'John Smith', domain: Domain.Writing, problemArea: 'Organization', tier: 2, title: 'Graphic Organizers for Paragraphs', description: 'Use various graphic organizers (hamburger, web) to help students plan their paragraphs before writing. Focus on topic sentence, supporting details, and concluding sentence.' },
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
        description: 'A 3-minute activity where students read short sentences and circle the "clue" word that suggests a character\'s feeling.',
        content: 'Character: "Maria slammed the door."\nQuestion: Which word tells you Maria might be angry? Why?',
        aiGenerated: true,
    },
    {
        id: 'r2',
        domain: Domain.Reading,
        subdomain: 'Inferential Comp',
        level: '5',
        period: TestPeriod.Midline,
        type: ResourceType.Worksheet,
        title: 'Inference Practice Sheet',
        description: 'A 5-question worksheet with short passages. Students must answer "why" questions based on textual evidence.',
        content: 'Link to PDF: /resources/reading/inference_L5_Q3.pdf',
        aiGenerated: false,
    },
    {
        id: 'r3',
        domain: Domain.Writing,
        subdomain: 'Text Organization',
        level: '5',
        period: TestPeriod.Baseline,
        type: ResourceType.QuickPractice,
        title: 'Sentence Scramble',
        description: 'Digital flashcards with 3-4 sentences of a paragraph out of order. Students drag and drop them into the correct sequence.',
        content: 'Sentences:\n1. Finally, he went to bed.\n2. First, he brushed his teeth.\n3. Then, he read a book.',
        aiGenerated: true,
    },
    {
        id: 'r4',
        domain: Domain.Grammar,
        subdomain: 'Verb Tenses',
        level: '5',
        period: TestPeriod.Baseline,
        type: ResourceType.ParentPractice,
        title: 'Dinner Time Verbs (Past Tense)',
        description: 'A simple guide for parents to practice past-tense verbs with their child during dinner.',
        content: 'English: "What did you eat for lunch?"\nKorean: "점심으로 무엇을 먹었니?"\n\nPractice Words: ate, drank, played, saw.',
        aiGenerated: true,
    },
];
