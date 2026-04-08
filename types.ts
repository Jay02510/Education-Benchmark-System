
export enum Domain {
    Reading = "Reading",
    Writing = "Writing",
    Grammar = "Grammar",
    Vocabulary = "Vocabulary",
    Phonics = "Phonics",
    Listening = "Listening",
    Speaking = "Speaking",
    DataLiteracy = "Data Literacy",
}

export enum TestPeriod {
    Baseline = "Baseline",
    Midline = "Midline",
    Endline = "Endline",
}

export enum UserRole {
    Teacher = "teacher",
    Admin = "admin",
}

export enum Trend {
    Up = "up",
    Down = "down",
    Stable = "stable",
    Plateau = "plateau",
}

export enum VelocityBand {
    Fast = "fast",
    Stable = "stable",
    AtRisk = "at-risk",
}

export enum ResourceType {
    MicroLesson = "Micro-Lesson",
    QuickPractice = "Quick Practice Card",
    MiniReading = "Mini-Reading & Passage",
    Worksheet = "Worksheet",
    InterventionPacket = "Tiered Intervention Packet",
    ParentPractice = "Parent Home Practice",
}

export interface ClassProfile {
    id: string;
    className: string;
    gradeLevel: string;
    academicYear: string;
}

export interface StudentLogEntry {
    id: string;
    date: string;
    author: string;
    category: 'Intervention' | 'Observation' | 'Parent Communication' | 'Goal Met';
    content: string;
    impactScore?: number; 
}

export interface Student {
    id: string;
    name: string;
    level: string;
    class: string;
    photoUrl: string;
    overallGrowth: number;
    growthVelocity: number; 
    velocityBand: VelocityBand;
    hasAnomaly: boolean;
    assessments: Assessment[];
    interventionStatus: Intervention | null;
    actionLog: StudentLogEntry[];
    cachedReport?: string;
}

export interface Assessment {
    id: string;
    type: TestPeriod;
    date: string;
    scores: Record<Domain, number>; 
    subdomainScores: Record<string, number>; 
}

export interface Benchmark {
    id: string;
    level_name: string;
    period: TestPeriod;
    domain: Domain;
    target_percent: number;
    descriptor_short: string;
    cefr_alignment: string;
    yle_equivalent: string;
}

export interface SubdomainMetadata {
    name: string;
    maxScore: number;
}

export interface Intervention {
    tier: 1 | 2 | 3;
    domain: Domain | "General";
    goal: string;
    trend: Trend;
    triggerReason: string;
    dateIdentified: string;
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
    isDemo?: boolean;
    isPremium?: boolean;
}

export interface Resource {
    id: string;
    domain: Domain;
    subdomain: string;
    level: string;
    period: TestPeriod;
    type: ResourceType;
    title: string;
    description: string;
    content: string;
}

export interface TeacherStrategy {
    id: string;
    author: string;
    domain: Domain;
    problemArea: string;
    tier: 1 | 2 | 3;
    title: string;
    description: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    isError?: boolean;
}
