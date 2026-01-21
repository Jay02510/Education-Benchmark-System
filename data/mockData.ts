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
    },
    {
        id: 's3',
        name: 'Chris Lee',
        level: '5',
        class: 'Class B',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
        overallGrowth: -3,
        growthVelocity: -2,
        velocityBand: VelocityBand.AtRisk,
        hasAnomaly: true,
        assessments: [
            { id: 'a5', type: TestPeriod.Baseline, date: '2023-09-15', scores: { [Domain.Reading]: 55, [Domain.Writing]: 50, [Domain.Grammar]: 60, [Domain.Vocabulary]: 58, [Domain.Phonics]: 65, [Domain.Listening]: 52, [Domain.Speaking]: 50, [Domain.DataLiteracy]: 45 }, subdomainScores: {} },
            { id: 'a6', type: TestPeriod.Midline, date: '2023-12-05', scores: { [Domain.Reading]: 52, [Domain.Writing]: 51, [Domain.Grammar]: 58, [Domain.Vocabulary]: 60, [Domain.Phonics]: 63, [Domain.Listening]: 50, [Domain.Speaking]: 48, [Domain.DataLiteracy]: 48 }, subdomainScores: {} },
        ],
        interventionStatus: { tier: 2, domain: Domain.Writing, goal: 'Improve organization in writing by 10% in 4 weeks', trend: Trend.Down, triggerReason: 'Regression in scores', dateIdentified: '2023-11-15' },
        actionLog: [],
    },
];

export const mockBenchmarkFramework: Benchmark[] = [
    createBench("5", TestPeriod.Baseline, Domain.Reading, 80, "Recognizes letter names; matches CVC words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Phonics, 80, "Identifies sounds; blends simple CVC", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Vocabulary, 80, "~10 sight words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Writing, 80, "Copies letters; traces simple words", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Grammar, 80, "Identifies nouns/verbs in images", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Listening, 80, "Responds to yes/no questions", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.Speaking, 80, "Names familiar items", "Pre-A1", "Pre-Starters"),
    createBench("5", TestPeriod.Baseline, Domain.DataLiteracy, 80, "Reads simple colors/shapes in charts", "Pre-A1", "Pre-Starters"),
    createBench("6-1", TestPeriod.Baseline, Domain.Reading, 80, "Decodes CVC + common blends; short sentences", "Mid Pre-A1", "Starters"),
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
        content: 'Character: "Maria slammed the door."\nQuestion: Which word tells you Maria might be angry?',
    }
];