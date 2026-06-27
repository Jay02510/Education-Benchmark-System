import React, { useState, useEffect } from 'react';
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
        <div className="w-full h-full flex flex-col justify-between py-1 px-1 text-left font-sans">
            <div className="space-y-4">
                {/* Question bubble */}
                <div className="flex items-start justify-end">
                    <div className="bg-zinc-900 border border-white/5 text-white text-xs px-4 py-2.5 rounded-[12px] max-w-[85%] font-sans">
                        {messages[msgIdx].q}
                    </div>
                </div>

                {/* Answer bubble */}
                {(phase === 'typing' || phase === 'waiting') && (
                    <div className="flex items-start justify-start animate-fadeIn">
                        <div className="bg-zinc-950/80 border border-white/10 text-xs px-4 py-3 rounded-[12px] max-w-[95%] leading-relaxed font-sans">
                            <span className="text-zinc-200">{typedAnswer}</span>
                            {phase === 'typing' && <span className="inline-block w-1.5 h-3.5 bg-[oklch(0.72_0.18_145)] ml-1 animate-pulse">|</span>}
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
        <div className="w-full flex flex-col gap-4 py-1 px-1 text-left font-sans">
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-[12px] border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 rounded-[4px] bg-zinc-900 border border-white/5 text-zinc-400 font-mono text-[10px] font-medium">st-08</div>
                    <div className="space-y-1">
                        <div className="h-1.5 w-16 bg-zinc-800 rounded"></div>
                        <div className="h-1 w-10 bg-zinc-900 rounded"></div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-semibold text-[oklch(0.72_0.18_145)] bg-[oklch(0.20_0.06_145)] px-2 py-0.5 rounded-[4px] border border-[oklch(0.72_0.18_145)]/20 font-mono">+18% velocity</span>
                </div>
            </div>
            
            <div className="h-28 w-full flex items-end justify-between gap-3 px-2 pt-2 border-b border-white/5">
                {heights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div 
                            className="w-full bg-[oklch(0.72_0.18_145)] rounded-t-[4px] transition-all duration-1000 ease-out" 
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-zinc-900 border border-white/10 text-[10px] font-mono text-white px-1.5 py-0.5 rounded-[4px] transition-all duration-150 z-10">
                                {Math.round(h)}%
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500 truncate max-w-full mt-1.5 font-mono lowercase">
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
        <div className="w-full h-full flex flex-col justify-between py-1 text-left font-mono">
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
                        <span className={`text-[10px] ${idx < activeStep ? 'text-zinc-500 line-through opacity-60' : idx === activeStep ? 'text-white font-semibold' : 'text-zinc-600'}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>

            {activeStep === steps.length && (
                <div className="mt-3 p-3 bg-[oklch(0.20_0.06_145)] rounded-[4px] border border-[oklch(0.72_0.18_145)]/20 animate-fadeIn flex items-center justify-between">
                    <span className="text-[10px] font-medium text-[oklch(0.72_0.18_145)]">
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
        <div className="min-h-screen bg-[oklch(0.10_0.01_250)] text-white overflow-x-hidden relative font-sans">
            
            {/* INJECT INLINE CUSTOM STYLE DECLARATIONS MANDATED BY THE PALETTE AND GEOMETRY RULES */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
                
                :root {
                    --clean-font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
                    --clean-font-mono: 'JetBrains Mono', monospace !important;
                }

                .font-sans { font-family: var(--clean-font-sans); }
                .font-mono { font-family: var(--clean-font-mono); }
                
                /* Animations mapped at perfect acceleration and prefers-reduced-motion bounds */
                @media (prefers-reduced-motion: no-preference) {
                    .animate-fadeIn {
                        animation: fadeIn 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Fine noise texture overlaid safely as per performance instructions */
                .noise-overlay {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    opacity: 0.02;
                    mix-blend-mode: overlay;
                    z-index: 999;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3联%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }
            `}} />

            {/* Fine performance-safe noise background */}
            <div className="noise-overlay" />

            {/* Premium Ambient Deep Radial Blurs (Cosmic Mesh Gradients) */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(114,242,165,0.08)_0%,transparent_70%)] blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)] blur-[140px]"></div>
            </div>

            {/* --- 1. PREMIUM FLOATING GLASS PILL NAVIGATION BAR --- */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl bg-[oklch(0.12_0.01_250)]/70 backdrop-blur-md border border-white/5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] rounded-full px-5 py-2.5 flex justify-between items-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="flex items-center gap-2.5 pl-2">
                    <div className="w-7 h-7 rounded-full bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold">
                        <Icon name="benchmark" className="w-4.5 h-4.5 text-zinc-950" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-white font-sans uppercase select-none">BENCHMARK</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Compact language toggler */}
                    <div className="p-0.5 rounded-full bg-zinc-900/80 border border-white/5 flex items-center">
                        <button 
                            onClick={() => setLanguage('EN')} 
                            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all duration-500 font-mono lowercase ${language === 'EN' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        >
                            en
                        </button>
                        <button 
                            onClick={() => setLanguage('KO')} 
                            className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all duration-500 font-mono lowercase ${language === 'KO' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        >
                            ko
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => openAuth('login')} 
                        className="text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-300 font-sans px-2"
                    >
                        {language === 'EN' ? 'Log in' : '로그인'}
                    </button>
                    <button 
                        onClick={() => openAuth('signup')} 
                        className="px-4 py-2 rounded-full bg-[oklch(0.72_0.18_145)] hover:scale-105 active:scale-[0.98] text-zinc-950 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0"
                    >
                        {language === 'EN' ? 'Create account' : '계정 등록'}
                    </button>
                </div>
            </header>

            {/* --- 2. CINEMATIC HERO SECTION (ATTENTION) --- */}
            <section className="pt-44 md:pt-52 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative z-10 animate-fadeIn">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Eyebrow tag (Microscopic uppercase tracking-[0.2em]) */}
                    <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[oklch(0.72_0.18_145)] font-mono mb-4 block">
                        Diagnostic Assessment Architecture
                    </span>

                    {/* H1 - Compliant with the 2-Line Iron Rule */}
                    <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] leading-[1.05] max-w-4xl mx-auto">
                        {language === 'EN' ? (
                            <>Teach with <span className="text-[oklch(0.72_0.18_145)]">Intelligence.</span></>
                        ) : (
                            <>데이터로 실현하는 <span className="text-[oklch(0.72_0.18_145)]">교육의 미래.</span></>
                        )}
                    </h1>

                    <p className="text-base sm:text-lg text-zinc-400 max-w-[65ch] mx-auto leading-relaxed font-normal font-sans">
                        {t('hero_sub')}
                    </p>

                    {/* Highly quiet features & trust metrics */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 select-none">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono lowercase">
                            <Icon name="shield" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                            <span>coppa secure</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono lowercase">
                            <Icon name="globe" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                            <span>bilingual analytics</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono lowercase">
                            <Icon name="star" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                            <span>hagwon standard</span>
                        </div>
                    </div>

                    {/* Action Triggers with Nested CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                        <button 
                            onClick={loginDemo} 
                            className="px-6 py-3.5 bg-[oklch(0.72_0.18_145)] text-zinc-950 font-bold rounded-full hover:scale-105 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-3 group relative overflow-hidden"
                        >
                            <span className="text-xs font-bold">{language === 'EN' ? 'Launch interactive demo' : '데모 실행하기'}</span>
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                                <Icon name="arrowRight" className="w-3.5 h-3.5 text-zinc-950" strokeWidth={3} />
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold rounded-full border border-white/5 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-xs flex items-center gap-2 active:scale-[0.98]"
                        >
                            <span>{language === 'EN' ? 'Create free account' : '계정 무료 등록'}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* --- 3. THE GAPLESS BENTO GRID SECTION (INTEREST) --- */}
            <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto relative z-10">
                <div className="text-left space-y-4 max-w-3xl mb-16">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 font-mono block">
                        Functional Overview
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        {language === 'EN' ? 'Decisions Over Databases.' : '성적 조회 차트 조작에서 즉각적인 맞춤 처방으로.'}
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[65ch]">
                        {language === 'EN' 
                          ? 'Why waste hours in spreadsheets? Benchmark AI instantly maps child diagnostics to ready-to-print learning resources and individual parent updates.' 
                          : '학업 진행 정보를 단순 나열하여 엑셀이나 정산 통계판으로 돌리는 낡은 구조는 끝났습니다. 막힌 음소, 취약한 문법 오차 데이터를 즉각 찾아 실시간 과제 세트 연계 및 가이드문 발송 출력을 돕습니다.'}
                    </p>
                </div>

                {/* --- MATHEMATICALLY GAPLESS BENTO GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-auto-flow-dense">
                    
                    {/* BENTO CARD 1: Interactive feature preview (Col span 8) */}
                    <div className="col-span-12 xl:col-span-8 group relative rounded-[2rem] bg-zinc-900/20 border border-white/5 p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/10 hover:shadow-2xl overflow-hidden">
                        {/* Doppelrand Double-Bezel Nested Enclosure */}
                        <div className="bg-[oklch(0.12_0.01_250)]/40 p-6 md:p-8 rounded-[1.9rem] h-full flex flex-col justify-between">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                                <div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">trace workspace</span>
                                    <h3 className="text-base font-bold text-white tracking-tight">{language === 'EN' ? 'Interactive Diagnostic Telemetry' : '실시간 진단 피드백 원격 제어'}</h3>
                                </div>
                                <div className="p-1 rounded-full bg-zinc-950 border border-white/5 flex gap-1">
                                    {FEATURES.map((feat, idx) => (
                                        <button
                                            key={feat.id}
                                            onClick={() => handleTabSelect(idx)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-mono lowercase transition-all duration-500 ${
                                                activeFeature === idx 
                                                    ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-bold shadow-sm' 
                                                    : 'text-zinc-500 hover:text-white'
                                            }`}
                                        >
                                            {feat.title.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inner active component display */}
                            <div className="bg-zinc-950/40 rounded-[1.2rem] border border-white/5 h-64 flex items-center justify-center p-6 transition-all duration-500 hover:bg-zinc-950/60 shadow-inner">
                                {FEATURES[activeFeature].ui}
                            </div>

                            {/* Feature description summary */}
                            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-[oklch(0.72_0.18_145)] font-semibold">
                                        <span className="w-1.5 h-1.5 bg-[oklch(0.72_0.18_145)] rounded-full animate-pulse"></span>
                                        <span className="lowercase">{FEATURES[activeFeature].badge}</span>
                                    </div>
                                    <p className="text-zinc-400 font-sans text-xs leading-relaxed max-w-xl">
                                        "{FEATURES[activeFeature].description}"
                                    </p>
                                </div>
                                {/* Minimal slide timeline progress indicator */}
                                <div className="w-24 h-1 bg-zinc-950 rounded-full overflow-hidden shrink-0">
                                    <div 
                                        className="h-full bg-[oklch(0.72_0.18_145)] transition-all duration-80 ease-linear" 
                                        style={{ width: `${carouselProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BENTO CARD 2: CEFR targets and academic standards (Col span 4) */}
                    <div className="col-span-12 md:col-span-6 xl:col-span-4 group relative rounded-[2rem] bg-zinc-900/20 border border-white/5 p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/10 hover:shadow-2xl overflow-hidden">
                        <div className="bg-[oklch(0.12_0.01_250)]/40 p-6 md:p-8 rounded-[1.9rem] h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">curriculum standards</span>
                                <h3 className="text-base font-bold text-white tracking-tight">{language === 'EN' ? 'Global Benchmark Goals' : '글로벌 표준 레벨 체계'}</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                                    {language === 'EN' 
                                      ? 'Mapped instantly to Common European Framework and Cambridge Young Learners guidelines.' 
                                      : '유럽 공통 기준(CEFR) 및 캠브리지 공인 평가 지표와 100% 동기화되어 해외 교재 및 학원 레벨 조율이 쉽습니다.'}
                                </p>
                            </div>

                            <div className="space-y-3.5 my-6">
                                <div className="flex justify-between items-center p-3 rounded-[12px] bg-zinc-950/80 border border-white/5">
                                    <span className="text-xs font-semibold text-white">CEFR Mapping</span>
                                    <span className="font-mono text-xs font-semibold text-[oklch(0.72_0.18_145)] bg-[oklch(0.20_0.06_145)] px-2.5 py-1 rounded-[6px]">A1-A2 Early</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-[12px] bg-zinc-950/80 border border-white/5">
                                    <span className="text-xs font-semibold text-white">YLE Equivalent</span>
                                    <span className="font-mono text-xs text-zinc-400">Starters / Flyers</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-[12px] bg-zinc-950/80 border border-white/5">
                                    <span className="text-xs font-semibold text-white">Target Accuracy</span>
                                    <span className="font-mono text-xs font-semibold text-emerald-400">85% minimum</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 lowercase">
                                <Icon name="info" className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Updated dynamically per cohort</span>
                            </div>
                        </div>
                    </div>

                    {/* BENTO CARD 3: Diagnostics telemetry logs (Col span 4) */}
                    <div className="col-span-12 md:col-span-6 xl:col-span-4 group relative rounded-[2rem] bg-zinc-900/20 border border-white/5 p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/10 hover:shadow-2xl overflow-hidden">
                        <div className="bg-[oklch(0.12_0.01_250)]/40 p-6 md:p-8 rounded-[1.9rem] h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">real-time sync</span>
                                <h3 className="text-base font-bold text-white tracking-tight">{language === 'EN' ? 'Continuous Logging' : '실시간 학업 진척 감지'}</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                                    {language === 'EN' 
                                      ? 'A live, un-edited stream of cognitive logs and assessment activities from your classrooms.' 
                                      : '학생별 실시간 인지 발달 이력과 어휘 음가 테스트 성적이 데이터 제어 패널 상에 지연 없이 투영됩니다.'}
                                </p>
                            </div>

                            <div className="bg-zinc-950/80 rounded-[12px] border border-white/5 p-4 my-6 space-y-3.5 font-mono text-[10px] text-zinc-500 text-left">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[oklch(0.72_0.18_145)]">ST-34 PHONICS</span>
                                    <span>[OK_CORRIDOR]</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-zinc-400">ST-12 ACCENTS</span>
                                    <span>[SEGMENT_GAP]</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">ST-09 LEXICON</span>
                                    <span>[+12% INCREMENT]</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 lowercase">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                    <span>service live</span>
                                </div>
                                <span>256ms latency</span>
                            </div>
                        </div>
                    </div>

                    {/* BENTO CARD 4: Interactive Student Level Parameter Simulation (Col span 8) */}
                    <div className="col-span-12 xl:col-span-8 group relative rounded-[2rem] bg-zinc-900/20 border border-white/5 p-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/10 hover:shadow-2xl overflow-hidden">
                        <div className="bg-[oklch(0.12_0.01_250)]/40 p-6 md:p-8 rounded-[1.9rem] h-full flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                
                                {/* Parameter Sliders */}
                                <div className="md:col-span-5 text-left space-y-6">
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">interactive sim</span>
                                        <h3 className="text-base font-bold text-white tracking-tight">{language === 'EN' ? 'Trajectory Simulation' : '스킬 가속 시뮬레이션'}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Skill level */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[11px] font-mono">
                                                <span className="text-zinc-400 lowercase">skill level</span>
                                                <span className="text-[oklch(0.72_0.18_145)] font-semibold">lvl {simLevel}</span>
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

                                        {/* Mastery */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[11px] font-mono">
                                                <span className="text-zinc-400 lowercase">phonemic foundation</span>
                                                <span className="text-[oklch(0.72_0.18_145)] font-semibold">{simPhonics}%</span>
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

                                        {/* Hours Selection */}
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-mono text-zinc-400 block lowercase">weekly hours</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[2, 4, 6].map((hrs) => (
                                                    <button
                                                        key={hrs}
                                                        onClick={() => setSimHours(hrs)}
                                                        className={`py-1.5 px-2 rounded-[6px] text-[10px] font-mono font-semibold transition border ${
                                                            simHours === hrs 
                                                                ? 'bg-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] text-zinc-950 font-bold' 
                                                                : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white'
                                                        }`}
                                                    >
                                                        {hrs}h
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results display */}
                                <div className="md:col-span-7 bg-zinc-950/80 rounded-[1.2rem] border border-white/5 p-5 md:p-6 text-left space-y-4 shadow-inner">
                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono text-zinc-500 lowercase block">velocity score</span>
                                            <span className="text-2xl font-bold font-mono text-white block">
                                                {simVelocity > 0 ? `+${simVelocity}` : simVelocity} <span className="text-[10px] text-zinc-500 font-normal">pts/mo</span>
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-mono text-zinc-500 lowercase block">trajectory band</span>
                                            <span className={`px-2.5 py-1 border rounded-[6px] text-[9px] font-bold font-mono block text-center truncate ${bandColors[velocityBand]}`}>
                                                {bandLabels[velocityBand]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dynamically generated advisory statement */}
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-mono text-zinc-500 lowercase block">advisory memorandum</span>
                                        <div className="p-3 bg-zinc-900 rounded-[8px] border border-white/5">
                                            <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
                                                {getSandboxMessage(velocityBand, simLevel, simHours, language)}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={loginDemo}
                                        className="w-full py-2.5 bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                    >
                                        <Icon name="brain" className="w-3.5 h-3.5 text-zinc-950" />
                                        <span>{language === 'EN' ? 'Analyze student demographics' : '학습 가치 곡선 전체 분석 제어판 개방'}</span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* --- 4. SECURE VERIFICATION TRUST BAR --- */}
            <section className="py-20 border-y border-white/5 bg-zinc-950/20 relative z-10 select-none">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-[65ch] mx-auto leading-relaxed">
                        {language === 'EN' 
                          ? 'Engineered by a specialized EFL educator with 10+ years of active leadership in prime Seoul Hagwons.' 
                          : '10년 이상 대치·목동 등 실제 학원 현장에서 교수법과 성과 증명을 연구해온 EFL 교육자가 설계하였습니다.'}
                    </p>
                </div>
            </section>

            {/* --- 5. DETAILED OPERATIONAL FLOW TABLE (DESIRE) --- */}
            <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto relative z-10">
                <div className="text-left space-y-4 max-w-3xl mb-12">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500 font-mono block">
                        Methodological Steps
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {language === 'EN' ? 'The Diagnostic Workflow.' : '차원이 다른 3단계 성장 설계 프로세스.'}
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* Sequence Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-[10px] font-mono text-zinc-500 lowercase border-b border-white/5 select-none">
                        <div className="col-span-1 text-center">sequence</div>
                        <div className="col-span-3 text-left">instructional function</div>
                        <div className="col-span-8 text-left">operational workflow description</div>
                    </div>

                    {/* Step 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-[1.5rem] bg-zinc-900/20 border border-white/5 items-center transition-all duration-300 hover:border-white/10">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="font-mono text-base text-[oklch(0.72_0.18_145)] font-bold select-none">01</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="font-sans text-sm font-semibold text-white">{language === 'EN' ? 'Active Pods Assembly' : '자동 소그룹 소모임 편성'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-4xl">
                                {language === 'EN' 
                                  ? 'No manual profiling. Our system gathers students sharing matching phonics or syntactic gaps and packs them into designated peer work groups automatically.' 
                                  : '원장이 피곤하게 반별 수작업 구성을 만질 요량은 없습니다. 오답 결합이나 특정 인지 단계의 도미노 탈락이 겹친 학생을 묶어 맞춤 소모임 워크시트를 즉시 조립합니다.'}
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-[1.5rem] bg-zinc-900/20 border border-white/5 items-center transition-all duration-300 hover:border-white/10">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="font-mono text-base text-[oklch(0.72_0.18_145)] font-bold select-none">02</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="font-sans text-sm font-semibold text-white">{language === 'EN' ? 'Automated Parent Portals' : '클릭 한번으로 학부모 보고서'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-4xl">
                                {language === 'EN' 
                                  ? 'Generate non-clinical, comprehensive narratives for parents instantly. Multilingual translations ensure perfect transparency and Hagwon retention.' 
                                  : '데이터 장벽이 높은 부모들을 위하여 기술용어가 제거된 일상 언어 기반 학업성취 진단지 안내 편지를 자동 출력합니다. 정기 발송으로 안심 환불 방어가 편해집니다.'}
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-[1.5rem] bg-zinc-900/20 border border-white/5 items-center transition-all duration-300 hover:border-white/10">
                        <div className="md:col-span-1 flex items-center justify-center">
                            <span className="font-mono text-base text-[oklch(0.72_0.18_145)] font-bold select-none">03</span>
                        </div>
                        <div className="md:col-span-3 text-left">
                            <h3 className="font-sans text-sm font-semibold text-white">{language === 'EN' ? 'Integrated Resource Bank' : '실시간 훈련 콘텐츠 즉각 연계'}</h3>
                        </div>
                        <div className="md:col-span-8 text-left">
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-4xl">
                                {language === 'EN' 
                                  ? 'Identify grammatical trends or phonetic plateaus, and access direct worksheets custom-designed for those exact learning obstacles.' 
                                  : '학생별 막힌 영역에 따라 학습 극복에 즉시 투입 가능한 다운로드 전용 파닉스 워크북 및 문법 가이드 도표 교환 자료들을 대시보드 화면상에 실시간 연계시킵니다.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. MASSIVE HIGH-CONTRAST CALL-TO-ACTION (ACTION) --- */}
            <section className="py-32 md:py-40 bg-[oklch(0.12_0.01_250)]/40 border-y border-white/5 relative overflow-hidden text-center z-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,242,165,0.06)_0%,transparent_60%)]"></div>
                <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[oklch(0.72_0.18_145)] font-mono block">
                        Get Started Instantly
                    </span>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] text-white leading-tight">
                        {language === 'EN' ? 'Empower EFL Mastery.' : '학원 데이터의 패러다임을 바꿉니다.'}
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base max-w-[60ch] mx-auto leading-relaxed">
                        {language === 'EN' 
                          ? 'Experience instant class group structuring and bespoke student analytics. Launch the non-destructive sandbox session right now.'
                          : '지금 원 클릭으로 학원생의 성장 속도를 진단하고 분석 보고서 생성 능력을 경험하세요. 회원 가입 없이 즉각적인 체험이 가능합니다.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <button 
                            onClick={loginDemo} 
                            className="px-8 py-4 bg-[oklch(0.72_0.18_145)] text-zinc-950 font-extrabold rounded-full hover:scale-105 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-3 group relative overflow-hidden shadow-2xl"
                        >
                            <span>{language === 'EN' ? 'Launch demo panel' : '인터랙티브 데모 체험'}</span>
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                                <Icon name="arrowRight" className="w-3.5 h-3.5 text-zinc-950" strokeWidth={3} />
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-850 text-white font-bold rounded-full border border-white/5 hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] text-xs active:scale-[0.98]"
                        >
                            <span>{language === 'EN' ? 'Create a permanent account' : '정식 회원가입'}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* --- 7. RESTRAINED SYSTEM FOOTER PANEL --- */}
            <footer className="py-16 bg-zinc-950/60 border-t border-white/5 relative z-10 text-zinc-500 text-xs text-center font-sans">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold text-xs">B</div>
                        <span className="font-bold text-xs tracking-tight text-zinc-400">BENCHMARK AI</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono lowercase text-zinc-500">
                        <button onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors duration-300">{language === 'EN' ? 'privacy policy' : '개인정보 보호방침'}</button>
                        <button onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors duration-300">{language === 'EN' ? 'terms of service' : '이용 약관'}</button>
                        <button onClick={() => { setLegalTab('dpa'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors duration-300">dpa</button>
                        <button onClick={() => { setLegalTab('billing'); setIsLegalModalOpen(true); }} className="hover:text-white transition-colors duration-300">{language === 'EN' ? 'pricing guidelines' : '과금 규정'}</button>
                    </div>

                    <p className="text-[10px] font-mono text-zinc-600">© 2026 BENCHMARK EDUCATION SYSTEM INC.</p>
                </div>
            </footer>

            {/* --- SYSTEM CREDENTIAL PORTAL GLASS OVERLAY MODAL --- */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-[oklch(0.14_0.01_250)] border border-white/10 text-white w-full max-w-sm p-6 md:p-8 rounded-[1.5rem] shadow-2xl relative overflow-hidden animate-fadeIn">
                        
                        {/* High-end minimalist close trigger */}
                        <button 
                            onClick={() => setIsLoginModalOpen(false)} 
                            className="absolute top-6 right-6 p-1.5 text-zinc-500 hover:text-white transition-colors hover:bg-zinc-900 rounded-[6px]"
                        >
                            <Icon name="close" className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-6 text-left justify-start">
                            <div className="w-6 h-6 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950">
                                <Icon name="benchmark" className="w-4 h-4 text-zinc-950" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-semibold text-[oklch(0.72_0.18_145)] font-mono lowercase">system gateway</span>
                        </div>

                        <h2 className="text-xl font-bold tracking-tight mb-2 text-white text-left">
                            {authMode === 'login' ? t('auth_login_title') : t('auth_signup_title')}
                        </h2>
                        
                        <p className="text-xs text-zinc-400 text-left mb-6 leading-relaxed font-normal font-sans">
                            {authMode === 'login' 
                              ? (language === 'EN' ? 'Initiate secure login session to map metrics.' : '학원 데이터 분석 제어판 개방을 위한 로그인 및 장치인증 절차.')
                              : (language === 'EN' ? 'Register institutional profile details.' : '새로운 학원 계정 지표 가동 노드 추가 등록.')}
                        </p>

                        {/* Error box */}
                        {authError && (
                            <div className="mb-5 p-3.5 bg-red-950/40 rounded-[8px] border border-red-900/40 text-red-300 text-xs text-left flex items-start gap-2 animate-pulse">
                                <Icon name="alert" className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <span className="font-medium leading-relaxed font-sans">{authError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
                            {authMode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-zinc-400 font-mono lowercase block ml-0.5">{t('field_name')}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-[6px] focus:border-[oklch(0.72_0.18_145)] outline-none font-medium text-sm transition text-white placeholder-zinc-800" 
                                        placeholder={language === 'EN' ? "Director Name" : "원장명 성함"} 
                                    />
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-400 font-mono lowercase block ml-0.5">{t('field_email')}</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-[6px] focus:border-[oklch(0.72_0.18_145)] outline-none font-medium text-sm transition text-white placeholder-zinc-800" 
                                    placeholder="director@school.edu" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-400 font-mono lowercase block ml-0.5">{t('field_pass')}</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-[6px] focus:border-[oklch(0.72_0.18_145)] outline-none font-medium text-sm transition text-white placeholder-zinc-800" 
                                    placeholder="••••••••" 
                                />
                            </div>
                            
                            {authMode === 'login' && (
                                <div className="flex items-center gap-2 px-0.5 pb-1 select-none">
                                    <input 
                                        type="checkbox" 
                                        id="rememberMeCheckbox" 
                                        checked={rememberMe} 
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded-[4px] border-zinc-800 bg-zinc-950 text-[oklch(0.72_0.18_145)] focus:ring-emerald-500 accent-emerald-500"
                                    />
                                    <label htmlFor="rememberMeCheckbox" className="text-xs text-zinc-400 cursor-pointer select-none font-sans">
                                        {language === 'EN' ? 'Keep session active (30 days)' : '인증 유효 세션 유지 (30일)'}
                                    </label>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-2.5 bg-[oklch(0.72_0.18_145)] hover:brightness-110 text-zinc-950 rounded-full font-bold text-xs transition-all duration-300 shadow-lg active:scale-[0.98]"
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
