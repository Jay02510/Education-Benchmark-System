import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../common/Icon';
import { LegalModal } from '../common/LegalModal';

// --- SUB-WIDGET 1: TYPEWRITER CHAT SIMULATOR (RE-STYLED) ---
const ChatSimulator: React.FC<{ language: string }> = ({ language }) => {
    const messages = language === 'EN' ? [
        { q: "How is the class doing in Phonics?", a: "Weekly phonics average shows a 12% increase. Three students mastered short vowel CVC patterns, moving into the optimal growth corridor." },
        { q: "Which students require immediate intervention?", a: "Lucas and Chloe show segmentation gaps. Custom worksheets have been loaded in the resource catalog." }
    ] : [
        { q: "학급의 파닉스 성취 현황은 어떤가요?", a: "금주 파닉스 평균 성취도가 12% 상승했습니다. 3명의 학생이 단모음 CVC 패턴을 마스터하며 우수 성장 진로에 안착했습니다." },
        { q: "즉각 보강이 필요한 학생은 누구인가요?", a: "루카스와 클로이가 음소 발음 구분에 한계를 보입니다. 전용 학습지가 보강 자료 은행에 맞춤 배정되어 배치되었습니다." }
    ];

    const [msgIdx, setMsgIdx] = useState(0);
    const [typedAnswer, setTypedAnswer] = useState("");
    const [phase, setPhase] = useState<'question' | 'typing' | 'waiting'>('question');

    useEffect(() => {
        let isCancelled = false;
        const currentMsg = messages[msgIdx];
        
        if (phase === 'question') {
            setTypedAnswer("");
            const timer = setTimeout(() => {
                if (!isCancelled) setPhase('typing');
            }, 800);
            return () => clearTimeout(timer);
        } else if (phase === 'typing') {
            let currentStr = "";
            let charIndex = 0;
            const fullText = currentMsg.a;
            
            const interval = setInterval(() => {
                if (charIndex < fullText.length) {
                    currentStr += fullText[charIndex];
                    setTypedAnswer(currentStr);
                    charIndex++;
                } else {
                    clearInterval(interval);
                    setPhase('waiting');
                }
            }, 20);
            return () => clearInterval(interval);
        } else if (phase === 'waiting') {
            const timer = setTimeout(() => {
                if (!isCancelled) {
                    setMsgIdx((prev) => (prev + 1) % messages.length);
                    setPhase('question');
                }
            }, 4000);
            return () => clearTimeout(timer);
        }

        return () => { isCancelled = true; };
    }, [phase, msgIdx, language]);

    return (
        <div className="w-full h-full flex flex-col justify-between py-1 px-1 text-left clean-font-sans">
            <div className="space-y-4">
                {/* Question bubble */}
                <div className="flex items-start justify-end">
                    <div className="clean-surface-raised border clean-border-muted clean-text-ink text-xs px-4 py-2.5 rounded-[8px] max-w-[85%]">
                        {messages[msgIdx].q}
                    </div>
                </div>

                {/* Answer bubble */}
                {(phase === 'typing' || phase === 'waiting') && (
                    <div className="flex items-start justify-start clean-animate-ui">
                        <div className="clean-surface border clean-border-muted text-xs px-4 py-3 rounded-[8px] max-w-[95%] leading-relaxed">
                            <span className="clean-text-ink">{typedAnswer}</span>
                            {phase === 'typing' && <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 animate-pulse">|</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-WIDGET 2: GRAPH SIMULATOR (RE-STYLED WITH SOLID METRICS) ---
const TrackingSimulator: React.FC = () => {
    const [heights, setHeights] = useState([65, 45, 80, 50, 95, 70]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeights(prev => prev.map(h => {
                const delta = Math.floor(Math.random() * 9) - 4; // subtle change (-4 to +4)
                return Math.max(30, Math.min(100, h + delta));
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const skills = ["acoustics", "vocabulary", "syntax", "reading", "fluency", "comprehension"];

    return (
        <div className="w-full flex flex-col gap-4 py-1 px-1 text-left clean-font-sans">
            <div className="flex items-center justify-between p-3.5 clean-surface rounded-[8px] border clean-border-muted">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 rounded-[4px] clean-surface-raised border clean-border-muted clean-text-muted clean-font-mono text-[11px] font-medium">st-08</div>
                    <div className="space-y-1">
                        <div className="h-1.5 w-16 bg-zinc-800 rounded"></div>
                        <div className="h-1 w-10 bg-zinc-900 rounded"></div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[11px] font-semibold clean-text-accent bg-[oklch(0.20_0.06_145)] px-2 py-0.5 rounded-[4px] border clean-border-accent clean-font-mono">+18% growth velocity</span>
                </div>
            </div>
            
            <div className="h-28 w-full flex items-end justify-between gap-3 px-2 pt-2 border-b clean-border-muted">
                {heights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div 
                            className="w-full bg-[oklch(0.72_0.18_145)] rounded-t-[4px] transition-all duration-1000 ease-out" 
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 clean-surface border clean-border-muted text-[11px] clean-font-mono clean-text-ink px-1.5 py-0.5 rounded-[4px] transition-all duration-150 z-10">
                                {Math.round(h)}%
                            </div>
                        </div>
                        <span className="text-[11px] font-medium clean-text-muted truncate max-w-full mt-1.5 clean-font-mono lowercase">
                            {skills[i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-WIDGET 3: DOCUMENT REPORT ASSEMBLER (RE-STYLED) ---
const ReportSimulator: React.FC<{ language: string }> = ({ language }) => {
    const steps = language === 'EN' ? [
        "Phonological acoustic profile calculated",
        "Syntactic structure baseline assigned",
        "Developmental writing velocity indexed",
        "Individualised parent memorandum synced"
    ] : [
        "음소 음향 분석 발달 프로파일 측정 완료",
        "문법 통사 기초 오차 성취 레벨 배정 완료",
        "개인별 주간 성장 가속 지표 인덱싱 완료",
        "학부모용 피드백 설명 리포트 실시간 동기화 완료"
    ];

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % (steps.length + 1));
        }, 1800);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="w-full h-full flex flex-col justify-between py-1 text-left clean-font-mono">
            <div className="space-y-3.5">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[11px]">
                        <div className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center transition-all duration-300 border ${
                            idx < activeStep 
                                ? 'bg-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] text-zinc-950' 
                                : idx === activeStep
                                ? 'border-[oklch(0.72_0.18_145)] text-[oklch(0.72_0.18_145)]'
                                : 'border-zinc-800 text-transparent'
                        }`}>
                            {idx < activeStep ? (
                                <Icon name="check" className="w-2.5 h-2.5" strokeWidth={4} />
                            ) : (
                                <div className="w-1.5 h-1.5 bg-[oklch(0.72_0.18_145)] rounded-full"></div>
                            )}
                        </div>
                        <span className={`text-[11px] uppercase ${idx < activeStep ? 'clean-text-muted line-through opacity-60' : idx === activeStep ? 'clean-text-ink font-semibold' : 'text-zinc-600'}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>

            {activeStep === steps.length && (
                <div className="mt-3 p-3 bg-[oklch(0.20_0.06_145)] rounded-[4px] border clean-border-accent clean-animate-ui flex items-center justify-between">
                    <span className="text-[11px] font-medium clean-text-accent">
                        {language === 'EN' ? 'report compiled and synced' : '발송 전송 리포트 완료'}
                    </span>
                </div>
            )}
        </div>
    );
};

// --- MAIN WRAPPER COMPONENT ---
export const LoginScreen: React.FC = () => {
    const { login, signup, loginDemo, isLoading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'dpa' | 'billing'>('privacy');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [activeFeature, setActiveFeature] = useState(0);
    const [carouselProgress, setCarouselProgress] = useState(0);
    
    // Auth Input States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [authError, setAuthError] = useState('');

    // GROWTH SIMULATOR STATE
    const [simLevel, setSimLevel] = useState(3);
    const [simPhonics, setSimPhonics] = useState(70);
    const [simHours, setSimHours] = useState(4); // 2, 4, 6 hrs

    // Calculate dynamic velocity
    const simVelocity = Math.min(20, Math.max(-10, Number(((simHours * 2.8) + (simPhonics * 0.12) - (simLevel * 0.4)).toFixed(1))));
    
    // Band categorization
    let velocityBand: 'fast' | 'stable' | 'at-risk' = 'stable';
    if (simVelocity >= 12) velocityBand = 'fast';
    else if (simVelocity < 5) velocityBand = 'at-risk';

    const bandLabels = {
        fast: language === 'EN' ? "OPTIMAL VELOCITY" : "우수 가속 단계",
        stable: language === 'EN' ? "STABLE VELOCITY" : "안정 표준 단계",
        'at-risk': language === 'EN' ? "CARE REQUIRED" : "보강 집중 관리"
    };

    const bandColors = {
        fast: "border-[oklch(0.72_0.18_145)] text-[oklch(0.72_0.18_145)] bg-[oklch(0.20_0.06_145)]",
        stable: "border-zinc-800 text-zinc-300 bg-zinc-900/60",
        'at-risk': "border-[oklch(0.65_0.20_25)] text-[oklch(0.65_0.20_25)] bg-[oklch(0.20_0.06_25)]"
    };

    const FEATURES = [
        {
            id: 0,
            title: t('feature_chat'),
            description: t('feature_chat_desc'),
            icon: "chat",
            badge: "ASSISTANT PROTOCOL",
            ui: <ChatSimulator language={language} />
        },
        {
            id: 1,
            title: t('feature_tracking'),
            description: t('feature_tracking_desc'),
            icon: "analytics",
            badge: "TRAJECTORY METRIC",
            ui: <TrackingSimulator />
        },
        {
            id: 2,
            title: t('feature_case'),
            description: t('feature_case_desc'),
            icon: "benchmark",
            badge: "COMPILING UTILITY",
            ui: <ReportSimulator language={language} />
        }
    ];

    // Carousel timeline runner
    useEffect(() => {
        setCarouselProgress(0);
        const startTime = Date.now();
        const duration = 6500; // 6.5 seconds per slide
        
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / duration) * 100);
            setCarouselProgress(pct);
            
            if (elapsed >= duration) {
                setActiveFeature((prev) => (prev + 1) % FEATURES.length);
            }
        }, 80);
        
        return () => clearInterval(interval);
    }, [activeFeature, FEATURES.length]);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setAuthError('');
        setIsLoginModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        let success = false;
        
        if (authMode === 'login') {
            success = await login(email, password, false, rememberMe);
        } else {
            if (!name.trim()) {
                setAuthError(language === 'EN' ? 'Name is required' : '성함을 입력해주세요.');
                return;
            }
            success = await signup(name, email, password);
        }
        
        if (success) {
            setIsLoginModalOpen(false);
        } else {
            setAuthError(language === 'EN' ? 'Authentication failed. Please verify credentials.' : '인증 실패. 보안 키나 메일을 확인해 주세요.');
        }
    };

    const handleTabSelect = (idx: number) => {
        setActiveFeature(idx);
    };

    const getSandboxMessage = (band: string, level: number, intensity: number, lang: 'EN' | 'KO') => {
        if (lang === 'EN') {
            switch (band) {
                case 'fast':
                    return `Accelerated developmental pace identified. Utilizing ${intensity} hrs/week, student is projected to advance to Level ${Math.min(10, level + 2)} within 45 days. Advanced instructional materials queued.`;
                case 'stable':
                    return `Perfect healthy developmental track. Steady study volume (${intensity} hrs) supports cohesive transition into blended reading models. Continue structured Hagwon curriculum.`;
                case 'at-risk':
                default:
                    return `Plateau risk detected. Level ${level} with low weekly exposure (${intensity} hrs) demands immediate phonics intervention guidelines and classroom priority profiling.`;
            }
        } else {
            switch (band) {
                case 'fast':
                    return `학습 가속화 임계점 돌파. 매주 ${intensity}시간의 학습 강도로, 학생은 45일 내에 레벨 ${Math.min(10, level + 2)} 도달이 확실시됩니다. 속성 학습 모듈 개방이 자동 연계되었습니다.`;
                case 'stable':
                    return `가장 이상적이고 일관된 성취도 구간. 안정된 강의 구성(${intensity}시간)을 바탕으로 복합 단어 및 기본 문장 훈련이 순차 전송됩니다. 현행 커리큘럼을 유지하십시오.`;
                case 'at-risk':
                default:
                    return `성장 둔화 및 누락 정체기 우려. 기초 체비 대비 부족한 주간 학습 노출(${intensity}시간)로 인해 보조 멀티바인더 단어 학습지와 전담 도우미 편성을 권장합니다.`;
            }
        }
    };

    return (
        <div className="min-h-screen clean-bg clean-font-sans clean-text-ink overflow-x-hidden relative">
            
            {/* INJECT INLINE CUSTOM STYLE DECLARATIONS MANDATED BY THE PALETTE AND GEOMETRY RULES */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap');
                
                :root {
                    --clean-bg: oklch(0.10 0.01 250);
                    --clean-surface: oklch(0.14 0.01 250);
                    --clean-surface-raised: oklch(0.18 0.01 250);
                    --clean-ink: oklch(0.97 0 0);
                    --clean-ink-muted: oklch(0.60 0 0);
                    --clean-accent: oklch(0.72 0.18 145);
                    --clean-accent-dim: oklch(0.20 0.06 145);
                    --clean-danger: oklch(0.65 0.20 25);
                    --clean-success: oklch(0.70 0.15 145);
                }

                .clean-bg { background-color: var(--clean-bg); }
                .clean-surface { background-color: var(--clean-surface); }
                .clean-surface-raised { background-color: var(--clean-surface-raised); }
                
                .clean-text-ink { color: var(--clean-ink); }
                .clean-text-muted { color: var(--clean-ink-muted); }
                .clean-text-accent { color: var(--clean-accent); }
                .clean-text-danger { color: var(--clean-danger); }
                
                .clean-border-muted { border-color: oklch(0.97 0 0 / 0.08); }
                .clean-border-accent { border-color: var(--clean-accent); }
                
                .clean-font-sans { font-family: 'Inter', system-ui, sans-serif !important; }
                .clean-font-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace !important; }
                
                /* Animations mapped at perfect acceleration and prefers-reduced-motion bounds */
                @media (prefers-reduced-motion: no-preference) {
                    .clean-animate-entry {
                        animation: cleanEntry 600ms cubic-bezier(0.16, 1, 0.32, 1) forwards;
                    }
                    .clean-animate-ui {
                        animation: cleanUi 400ms cubic-bezier(0.16, 1, 0.32, 1) forwards;
                    }
                }
                
                @keyframes cleanEntry {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes cleanUi {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}} />

            {/* --- RESTRAINED NAVIGATION PANEL --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 clean-bg border-b clean-border-muted py-4 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold">
                            <Icon name="benchmark" className="w-5 h-5 text-zinc-950" strokeWidth={3} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold text-base tracking-tight text-white uppercase select-none">BENCHMARK AI</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5 md:gap-7">
                        {/* Compact language toggler */}
                        <div className="p-0.5 rounded-[4px] clean-surface-raised border clean-border-muted flex items-center">
                            <button 
                                onClick={() => setLanguage('EN')} 
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] transition-all clean-font-mono lowercase ${language === 'EN' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold' : 'clean-text-muted hover:text-white'}`}
                            >
                                en
                            </button>
                            <button 
                                onClick={() => setLanguage('KO')} 
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] transition-all clean-font-mono lowercase ${language === 'KO' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold' : 'clean-text-muted hover:text-white'}`}
                            >
                                ko
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => openAuth('login')} 
                            className="text-xs font-medium clean-text-muted hover:clean-text-ink transition-colors"
                        >
                            {language === 'EN' ? 'Log in' : '로그인'}
                        </button>
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="px-4 py-2 rounded-[4px] bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 text-xs font-medium transition active:scale-95 shrink-0"
                        >
                            {language === 'EN' ? 'Create account' : '계정 등록'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION (RHYTHMIC OFFSET 96PX) --- */}
            <section className="pt-36 md:pt-44 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 clean-animate-entry">
                
                {/* Left informational block */}
                <div className="lg:col-span-12 xl:col-span-7 text-left space-y-8">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] clean-surface-raised border clean-border-muted w-fit select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_145)]"></span>
                        <span className="text-[11px] font-medium clean-text-accent clean-font-mono lowercase">Diagnostic analytics built for EFL</span>
                    </div>

                    <h1 
                        className="font-semibold text-white tracking-tight leading-[1.08] block m-0 p-0"
                        style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)" }}
                    >
                        {t('hero_title_1')}{' '}
                        <span className="block mt-1 clean-text-accent">
                            {t('hero_title_2')}
                        </span>
                    </h1>

                    <p className="text-base clean-text-muted max-w-[65ch] leading-[1.7] font-normal font-sans">
                        {t('hero_sub')}
                    </p>

                    {/* Highly quiet metrics block - NO gradient background - NO fancy cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2 border-y clean-border-muted">
                        <div className="flex items-center gap-2 py-1">
                            <Icon name="shield" className="w-4 h-4 text-emerald-500" />
                            <span className="clean-font-mono text-[11px] clean-text-muted">coppa secured</span>
                        </div>
                        <div className="flex items-center gap-2 py-1">
                            <Icon name="globe" className="w-4 h-4 text-emerald-500" />
                            <span className="clean-font-mono text-[11px] clean-text-muted">bilingual ready</span>
                        </div>
                        <div className="flex items-center gap-2 py-1 col-span-2 sm:col-span-1">
                            <Icon name="star" className="w-4 h-4 text-emerald-500" />
                            <span className="clean-font-mono text-[11px] clean-text-muted">hagwon scaled</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={loginDemo} 
                            className="px-6 py-3 rounded-[4px] bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 font-medium text-xs transition active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span>{language === 'EN' ? 'Launch demo' : '데모 실행하기'}</span>
                            <Icon name="arrowRight" className="w-4 h-4 text-zinc-950" />
                        </button>
                        
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="px-6 py-3 rounded-[4px] clean-surface-raised border clean-border-muted clean-text-ink text-xs font-medium hover:bg-zinc-800 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <span>{language === 'EN' ? 'Create account' : '계정 등록'}</span>
                        </button>
                    </div>
                </div>

                {/* Right Interactive Center Column */}
                <div className="lg:col-span-12 xl:col-span-5 relative mt-4 xl:mt-0">
                    <div className="relative w-full clean-surface border clean-border-muted p-5 rounded-[8px] overflow-hidden">
                        
                        {/* Quiet interface header */}
                        <div className="flex items-center justify-between pb-4 border-b clean-border-muted mb-5 select-none text-[11px] clean-font-mono clean-text-muted">
                            <div className="flex items-center gap-2 lowercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_145)]"></div>
                                <span>active trace layer</span>
                            </div>
                            <span className="uppercase text-[10px]">secure metrics</span>
                        </div>

                        {/* Quiet feature custom navigation tabs */}
                        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-[4px] border clean-border-muted mb-5">
                            {FEATURES.map((feat, idx) => (
                                <button
                                    key={feat.id}
                                    onClick={() => handleTabSelect(idx)}
                                    className={`py-1.5 rounded-[4px] text-[11px] clean-font-mono lowercase transition-all duration-300 ${
                                        activeFeature === idx 
                                            ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold' 
                                            : 'clean-text-muted hover:text-white'
                                    }`}
                                >
                                    {feat.title.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        {/* Interactive UI card wrapper */}
                        <div className="bg-zinc-950/40 rounded-[4px] border clean-border-muted h-64 flex items-center justify-center p-5 transition-all duration-300">
                            {FEATURES[activeFeature].ui}
                        </div>

                        {/* Strategic outcome section */}
                        <div className="mt-5 text-left space-y-3.5">
                            <div className="flex items-center justify-between text-[11px] clean-font-mono clean-text-accent font-medium">
                                <span className="lowercase">{FEATURES[activeFeature].badge}</span>
                                <span>Preview</span>
                            </div>
                            <p className="clean-text-muted font-normal text-xs leading-relaxed">
                                "{FEATURES[activeFeature].description}"
                            </p>

                            {/* Minimal slide timeline indicator */}
                            <div className="w-full h-0.5 bg-zinc-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[oklch(0.72_0.18_145)] transition-all duration-80 ease-linear" 
                                    style={{ width: `${carouselProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ONE LINE TRUTHFUL TRUST BAR OVER RHYTHMIC OFFSET 48PX --- */}
            <section className="py-12 border-y clean-border-muted bg-zinc-950/20 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="clean-font-sans text-xs clean-text-muted max-w-[65ch] mx-auto select-none font-medium">
                        {language === 'EN' 
                          ? 'Built by an EFL educator with 10+ years in Korean hagwons.' 
                          : '10년 이상 대치·목동 등 실제 학원 현장에서 교수법과 성과 증명을 연구해온 EFL 교육자가 설계하였습니다.'}
                    </p>
                </div>
            </section>

            {/* --- SECTIONS SPACING RHYTHMIC OVER 96PX --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 space-y-12">
                
                <div className="text-left space-y-4 max-w-3xl">
                    <h2 className="clean-font-sans text-3xl font-medium text-white tracking-tight">
                        {language === 'EN' ? 'Decisions Over Databases.' : '성적 조회 차트 조작에서 즉각적인 맞춤 처방으로.'}
                    </h2>
                    <p className="clean-text-muted text-sm leading-relaxed max-w-[65ch]">
                        {language === 'EN' 
                          ? 'Why waste hours in spreadsheets? Benchmark AI instantly maps child diagnostics to ready-to-print learning resources and individual parent updates.' 
                          : '학업 진행 정보를 단순 나열하여 엑셀이나 정산 통계판으로 돌리는 낡은 구조는 끝났습니다. 막힌 음소, 취약한 문법 오차 데이터를 즉각 찾아 실시간 과제 세트 연계 및 가이드문 발송 출력을 돕습니다.'}
                    </p>
                </div>

                {/* --- LIVE SIMULATOR CONSOLES --- */}
                <div className="clean-surface rounded-[8px] border clean-border-muted p-6 md:p-10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 select-none">
                        <span className="text-[11px] clean-font-mono clean-text-muted lowercase">esl_simul_1.0</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                        
                        {/* Simulation configuration interface */}
                        <div className="lg:col-span-12 xl:col-span-5 text-left space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-medium clean-text-ink">{language === 'EN' ? 'Student Level Parameter Simulation' : '실시간 연령별 및 학업 강도 통계 시뮬레이션'}</h3>
                                <p className="text-xs clean-text-muted leading-relaxed font-normal max-w-[65ch]">{language === 'EN' ? 'Slide parameters to simulate growth velocity profiles in real time.' : '슬라이더 정보와 시간 변인 설정치를 임의 변경하며 실시간 생성되는 성장 곡선을 탐색하세요.'}</p>
                            </div>

                            <div className="space-y-6">
                                {/* Academic level slider */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-semibold clean-text-muted clean-font-mono text-[11px] lowercase">{language === 'EN' ? 'esl skill level' : '권장 학습 스킬 레벨'}</label>
                                        <span className="clean-font-mono clean-text-accent font-medium bg-[oklch(0.20_0.06_145)] px-2 py-0.5 rounded-[4px] border clean-border-accent">lvl {simLevel}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={simLevel} 
                                        onChange={(e) => setSimLevel(Number(e.target.value))}
                                        className="w-full accent-[oklch(0.72_0.18_145)] h-1 bg-zinc-950 rounded cursor-pointer"
                                    />
                                </div>

                                {/* Phonics achievement slider */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-semibold clean-text-muted clean-font-mono text-[11px] lowercase">{language === 'EN' ? 'phonemic foundation mastery' : '기초 음소 및 음절 결합 인지 마스터율'}</label>
                                        <span className="clean-font-mono clean-text-accent font-medium bg-[oklch(0.20_0.06_145)] px-2 py-0.5 rounded-[4px] border clean-border-accent">{simPhonics}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="100" 
                                        value={simPhonics} 
                                        onChange={(e) => setSimPhonics(Number(e.target.value))}
                                        className="w-full accent-[oklch(0.72_0.18_145)] h-1 bg-zinc-950 rounded cursor-pointer"
                                    />
                                </div>

                                {/* Hours component */}
                                <div className="space-y-3.5">
                                    <label className="font-semibold clean-text-muted clean-font-mono text-[11px] block lowercase">{language === 'EN' ? 'weekly instructional intensity' : '주간 평균 강의 투입 시간'}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[2, 4, 6].map((hrs) => (
                                            <button
                                                key={hrs}
                                                onClick={() => setSimHours(hrs)}
                                                className={`py-2 px-3 rounded-[4px] text-xs font-semibold transition border clean-font-sans ${
                                                    simHours === hrs 
                                                        ? 'bg-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold shadow-sm' 
                                                        : 'bg-zinc-950 border-zinc-800 clean-text-muted hover:text-white'
                                                }`}
                                            >
                                                {hrs} {language === 'EN' ? 'hrs/wk' : '시간 / 주'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metric result output */}
                        <div className="lg:col-span-12 xl:col-span-7 clean-surface-raised border clean-border-muted p-6 md:p-8 rounded-[8px] text-left space-y-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b clean-border-muted">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase">{language === 'EN' ? 'calculated velocity score' : '산출된 성장 가속도 점치지'}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-semibold clean-text-ink clean-font-mono">{simVelocity > 0 ? `+${simVelocity}` : simVelocity}</span>
                                        <span className="clean-text-muted font-medium text-xs clean-font-mono lowercase">units/mo</span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <p className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase mb-1.5">{language === 'EN' ? 'trajectory profile assigned' : '자동 분화 경로 지정 식별 결과'}</p>
                                    <div className={`px-4 py-2 border rounded-[4px] font-medium text-xs text-center transition-all duration-300 clean-font-mono ${bandColors[velocityBand]}`}>
                                        {bandLabels[velocityBand]}
                                    </div>
                                </div>
                            </div>

                            {/* Generated analysis statement */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Icon name="brain" className="w-3.5 h-3.5 clean-text-accent" />
                                    <span className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase">strategic dynamic memo</span>
                                </div>
                                <div className="p-4 bg-zinc-950 rounded-[4px] border clean-border-muted">
                                    <p className="clean-text-muted font-normal text-xs sm:text-sm leading-[1.7] transition-all duration-300 max-w-[65ch]">
                                        {getSandboxMessage(velocityBand, simLevel, simHours, language)}
                                    </p>
                                </div>
                            </div>

                            {/* Demo engagement trigger */}
                            <button 
                                onClick={loginDemo}
                                className="w-full py-3 bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 rounded-[4px] font-medium text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <Icon name="brain" className="w-4 h-4 text-zinc-950" />
                                <span>{language === 'EN' ? 'Analyze class profile' : '학원 실제 학생 리스트 데이터 입력 분석'}</span>
                            </button>
                        </div>

                    </div>
                </div>

                {/* --- CONCISE STEPPED FLOW TABLE (REPLACES 3-CARD GRID) --- */}
                <div className="space-y-4 pt-4">
                    {/* Column labels */}
                    <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-[11px] clean-font-mono clean-text-muted lowercase border-b clean-border-muted select-none">
                        <div className="col-span-1 text-center">sequence</div>
                        <div className="col-span-3 text-left">instructional function</div>
                        <div className="col-span-8 text-left">operational workflow description</div>
                    </div>

                    {/* Step 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 clean-surface border clean-border-muted rounded-[8px] items-center">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="clean-font-mono text-xs clean-text-accent font-semibold select-none">01</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="clean-font-sans text-sm font-medium clean-text-ink">{language === 'EN' ? 'Active Pods Assembly' : '자동 소그룹 소모임 편성'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="clean-font-sans text-xs clean-text-muted leading-relaxed max-w-[65ch]">
                                {language === 'EN' 
                                  ? 'No manual profiling. Our system gathers students sharing matching phonics or syntactic gaps and packs them into designated peer work groups automatically.' 
                                  : '원장이 피곤하게 반별 수작업 구성을 만질 요량은 없습니다. 오답 결합이나 특정 인지 단계의 도미노 탈락이 겹친 학생을 묶어 맞춤 소모임 워크시트를 즉시 조립합니다.'}
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 clean-surface border clean-border-muted rounded-[8px] items-center">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="clean-font-mono text-xs clean-text-accent font-semibold select-none">02</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="clean-font-sans text-sm font-medium clean-text-ink">{language === 'EN' ? 'Automated Parent Portals' : '클릭 한번으로 학부모 보고서'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="clean-font-sans text-xs clean-text-muted leading-relaxed max-w-[65ch]">
                                {language === 'EN' 
                                  ? 'Generate non-clinical, comprehensive narratives for parents instantly. Multilingual translations ensure perfect transparency and Hagwon retention.' 
                                  : '데이터 장벽이 높은 부모들을 위하여 기술용어가 제거된 일상 언어 기반 학업성취 진단지 안내 편지를 자동 출력합니다. 정기 발송으로 안심 환불 방어가 편해집니다.'}
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 clean-surface border clean-border-muted rounded-[8px] items-center">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="clean-font-mono text-xs clean-text-accent font-semibold select-none">03</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="clean-font-sans text-sm font-medium clean-text-ink">{language === 'EN' ? 'Integrated Resource Bank' : '실시간 훈련 콘텐츠 즉각 연계'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="clean-font-sans text-xs clean-text-muted leading-relaxed max-w-[65ch]">
                                {language === 'EN' 
                                  ? 'Identify grammatical trends or phonetic plateaus, and access direct worksheets custom-designed for those exact learning obstacles.' 
                                  : '학생별 막힌 영역에 따라 학습 극복에 즉시 투입 가능한 다운로드 전용 파닉스 워크북 및 문법 가이드 도표 교환 자료들을 대시보드 화면상에 실시간 연계시킵니다.'}
                            </p>
                        </div>
                    </div>
                </div>

            </section>

            {/* --- RESTRAINED SYSTEM FOOTER PANEL --- */}
            <footer className="py-12 border-t clean-border-muted clean-bg relative z-10 text-slate-500 text-xs text-center">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold text-[10px]">B</div>
                        <span className="font-semibold text-xs tracking-tight text-slate-400">BENCHMARK AI</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-[11px] clean-font-mono lowercase text-slate-500">
                        <button onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors">{language === 'EN' ? 'Privacy Policy' : '개인정보 보호방침'}</button>
                        <button onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors">{language === 'EN' ? 'Terms of Service' : '이용 약관'}</button>
                        <button onClick={() => { setLegalTab('dpa'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors">dpa</button>
                        <button onClick={() => { setLegalTab('billing'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors">{language === 'EN' ? 'Pricing Policy' : '과금 약관'}</button>
                    </div>

                    <p className="text-[11px] clean-font-mono clean-text-muted">© 2026 BENCHMARK EDUCATION INFRASTRUCTURE.</p>
                </div>
            </footer>

            {/* --- SYSTEM CREDENTIAL PORTAL GLASS OVERLAY MODAL --- */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-md">
                    <div className="bg-[oklch(0.14_0.01_250)] border border-zinc-800 text-white w-full max-w-sm p-6 md:p-8 rounded-[8px] shadow-2xl relative overflow-hidden clean-animate-ui">
                        
                        {/* High-end minimalist close trigger */}
                        <button 
                            onClick={() => setIsLoginModalOpen(false)} 
                            className="absolute top-6 right-6 p-1.5 clean-text-muted hover:text-white transition-colors hover:bg-zinc-800 rounded-[4px]"
                        >
                            <Icon name="close" className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-6 text-left justify-start">
                            <div className="w-6 h-6 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950">
                                <Icon name="benchmark" className="w-4.5 h-4.5 text-zinc-950" strokeWidth={3} />
                            </div>
                            <span className="text-[11px] font-semibold clean-text-accent clean-font-mono lowercase">system gateway</span>
                        </div>

                        <h2 className="text-xl font-medium tracking-tight mb-2 text-white text-left">
                            {authMode === 'login' ? t('auth_login_title') : t('auth_signup_title')}
                        </h2>
                        
                        <p className="text-xs clean-text-muted text-left mb-6 leading-relaxed font-normal">
                            {authMode === 'login' 
                              ? (language === 'EN' ? 'Initiate secure login session to map metrics.' : '학원 데이터 분석 제어판 개방을 위한 로그인 및 장치인증 절차.')
                              : (language === 'EN' ? 'Register institutional profile details.' : '새로운 학원 계정 지표 가동 노드 추가 등록.')}
                        </p>

                        {/* Error box */}
                        {authError && (
                            <div className="mb-5 p-3.5 bg-red-950/45 rounded-[4px] border border-red-900/60 text-[oklch(0.65_0.20_25)] text-xs text-left flex items-start gap-2 animate-pulse">
                                <Icon name="alert" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <span className="font-medium leading-relaxed">{authError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            {authMode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase block ml-0.5">{t('field_name')}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[4px] focus:clean-border-accent outline-none font-medium text-sm transition text-white placeholder-zinc-700" 
                                        placeholder={language === 'EN' ? "Director Name" : "성함 입력"} 
                                    />
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase block ml-0.5">{t('field_email')}</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[4px] focus:clean-border-accent outline-none font-medium text-sm transition text-white placeholder-zinc-700" 
                                    placeholder="director@school.edu" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold clean-text-muted clean-font-mono lowercase block ml-0.5">{t('field_pass')}</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[4px] focus:clean-border-accent outline-none font-medium text-sm transition text-white placeholder-zinc-700" 
                                    placeholder="••••••••" 
                                />
                            </div>
                            
                            {authMode === 'login' && (
                                <div className="flex items-center gap-2 px-0.5 pb-1">
                                    <input 
                                        type="checkbox" 
                                        id="rememberMeCheckbox" 
                                        checked={rememberMe} 
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded-[4px] border-zinc-800 bg-zinc-950 text-[oklch(0.72_0.18_145)] focus:ring-emerald-500 accent-emerald-500"
                                    />
                                    <label htmlFor="rememberMeCheckbox" className="text-xs clean-text-muted cursor-pointer select-none">
                                        {language === 'EN' ? 'Keep session active (30 days)' : '인증 유효 세션 유지 (30일)'}
                                    </label>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-2.5 bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 rounded-[4px] font-medium text-xs transition shadow-sm"
                            >
                                {isLoading 
                                  ? (language === 'EN' ? 'Connecting login...' : '서버 계정 로딩...') 
                                  : (authMode === 'login' ? (language === 'EN' ? 'Continue login' : '보안 로그인') : (language === 'EN' ? 'Create account' : '계정 등록하기'))}
                            </button>
                        </form>

                        <button 
                            onClick={() => {
                                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                setAuthError('');
                            }} 
                            className="mt-5 w-full text-[oklch(0.72_0.18_145)] font-semibold text-xs hover:underline text-center"
                        >
                            {authMode === 'login' ? t('link_request') : t('link_existing')}
                        </button>
                    </div>
                </div>
            )}

            {/* Legal Modal Links Compatibility */}
            <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalTab} />
        </div>
    );
};
