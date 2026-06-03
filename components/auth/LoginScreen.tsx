import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../common/Icon';
import { LegalModal } from '../common/LegalModal';

// --- SUB-WIDGET 1: TYPEWRITER CHAT SIMULATOR ---
const ChatSimulator: React.FC<{ language: string }> = ({ language }) => {
    const messages = language === 'EN' ? [
        { q: "How's the class doing in Phonics?", a: "AI Analysis: Class average has increased by 12% this week. 3 students have mastered CVC short vowels, entering the 'Fast Track' velocity band." },
        { q: "Who needs immediate intervention?", a: "AI Strategy: Lucas and Chloe are at risk in phoneme segmentation. Custom phonics sheets have been compiled in the Resource Bank." }
    ] : [
        { q: "클래스의 파닉스 성취도는 어떤가요?", a: "AI 분석: 이번 주 반 평균이 12% 상승했습니다. 3명의 학생이 단모음 CVC 패턴을 완벽히 마스터하며 우수 성장 단계에 진입했습니다." },
        { q: "즉각적인 보충 학습이 필요한 학생은 누구인가요?", a: "AI 처방: 루카스와 클로이가 음소 분절에서 보조가 필요합니다. 맞춤형 음소 훈련 학습지가 자료 탱크에 긴급 편성되었습니다." }
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
            }, 1000);
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
            }, 25);
            return () => clearInterval(interval);
        } else if (phase === 'waiting') {
            const timer = setTimeout(() => {
                if (!isCancelled) {
                    setMsgIdx((prev) => (prev + 1) % messages.length);
                    setPhase('question');
                }
            }, 3500);
            return () => clearTimeout(timer);
        }

        return () => { isCancelled = true; };
    }, [phase, msgIdx, language]);

    return (
        <div className="w-full h-full flex flex-col justify-between py-1 px-1 text-left">
            <div className="space-y-4">
                {/* Question bubble */}
                <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-indigo-600/95 font-medium text-white text-[11px] px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md max-w-[85%] border border-white/5 tracking-wide">
                        {messages[msgIdx].q}
                    </div>
                </div>

                {/* Answer bubble */}
                {(phase === 'typing' || phase === 'waiting') && (
                    <div className="flex items-start gap-2.5 justify-start animate-fade-in">
                        <div className="bg-slate-950/60 border border-slate-800 text-slate-200 text-[11px] px-4 py-3 rounded-2xl rounded-tl-sm max-w-[95%] font-mono leading-relaxed shadow-inner">
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                                <span className="font-bold text-indigo-400 text-[9px] uppercase tracking-widest">CO-PILOT CONTEXT ENGINE</span>
                            </div>
                            <span className="text-slate-300">{typedAnswer}</span>
                            {phase === 'typing' && <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 animate-pulse">|</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-WIDGET 2: GRAPH SIMULATOR WITH FLUCTUATION ---
const TrackingSimulator: React.FC = () => {
    const [heights, setHeights] = useState([65, 45, 80, 50, 95, 70]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeights(prev => prev.map(h => {
                const delta = Math.floor(Math.random() * 11) - 5; // gentle change (-5 to 5)
                return Math.max(30, Math.min(100, h + delta));
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const skills = ["Acoustics", "Vocabulary", "Syntax", "Reading", "Fluency", "Comprehension"];

    return (
        <div className="w-full flex flex-col gap-4 py-1 px-1 text-left">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/45 rounded-2xl border border-slate-800/85">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-mono text-[9px] font-black">ST-04</div>
                    <div className="space-y-1">
                        <div className="h-1.5 w-16 bg-slate-700 rounded"></div>
                        <div className="h-1 w-10 bg-slate-800 rounded"></div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">+18% VELOCITY</span>
                </div>
            </div>
            
            <div className="h-28 w-full flex items-end justify-between gap-3 px-2 pt-2 border-b border-white/5">
                {heights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div 
                            className="w-full bg-gradient-to-t from-indigo-700/70 to-indigo-400 rounded-t-md transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/5 relative" 
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-950 border border-slate-800 text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded transition-all duration-150 z-10">
                                {Math.round(h)}%
                            </div>
                        </div>
                        <span className="text-[7.5px] font-bold uppercase text-slate-500 tracking-wider truncate max-w-full mt-1.5 font-mono">
                            {skills[i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-WIDGET 3: DOCUMENT REPORT ASSEMBLER ---
const ReportSimulator: React.FC<{ language: string }> = ({ language }) => {
    const steps = language === 'EN' ? [
        "Acoustic phonological audit configured...",
        "Morphosyntactic structure layout mapped...",
        "Developmental reading trajectory compiled...",
        "Individualised parent portal report live"
    ] : [
        "포괄적 음향 음소 분석 초기화...",
        "문법/통사론 구조적 편차 구조화...",
        "개인별 연간 발달 성장 곡선 예측...",
        "학부모용 실시간 교육 보고서 발행"
    ];

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % (steps.length + 1));
        }, 1500);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="w-full h-full flex flex-col justify-between py-1 text-left font-mono">
            <div>
                <div className="flex items-center gap-2 mb-4 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 w-fit">
                    <Icon name="benchmark" className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">REPORT DISPATCH v3.2</span>
                </div>
                
                <div className="space-y-2.5">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-[10px]">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all duration-300 border ${
                                idx < activeStep 
                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow shadow-emerald-500/20' 
                                    : idx === activeStep
                                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 animate-pulse'
                                    : 'border-slate-800 text-transparent'
                            }`}>
                                <Icon name="check" className="w-3 h-3" strokeWidth={4} />
                            </div>
                            <span className={idx < activeStep ? 'text-slate-400 line-through opacity-50' : idx === activeStep ? 'text-white font-bold' : 'text-slate-600'}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {activeStep === steps.length && (
                <div className="mt-3 p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/20 animate-in zoom-in-95 duration-200 flex items-center justify-between">
                    <div>
                        <p className="text-[8px] uppercase tracking-widest text-[#10b981] font-black">SECURE COMPLIANT</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">{language === 'EN' ? 'Hagwon Dashboard Released' : '학원 관리소 송출 준비 완료'}</p>
                    </div>
                    <div className="text-[9px] bg-emerald-500 text-white font-black px-2 py-1 rounded tracking-widest">
                        AUTO-SYNC
                    </div>
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
        fast: language === 'EN' ? "🚀 FAST TRACK" : "🚀 가속 우수 진로",
        stable: language === 'EN' ? "⚡ STABLE PATH" : "⚡ 안정 발달 진로",
        'at-risk': language === 'EN' ? "⚠️ CAUTION REQUIRED" : "⚠️ 특별 집중 관리"
    };

    const bandColors = {
        fast: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
        stable: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]",
        'at-risk': "border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
    };

    const FEATURES = [
        {
            id: 0,
            title: t('feature_chat'),
            description: t('feature_chat_desc'),
            icon: "chat",
            badge: "24/7 CO-COACH",
            ui: <ChatSimulator language={language} />
        },
        {
            id: 1,
            title: t('feature_tracking'),
            description: t('feature_tracking_desc'),
            icon: "analytics",
            badge: "成長 궤적 추적",
            ui: <TrackingSimulator />
        },
        {
            id: 2,
            title: t('feature_case'),
            description: t('feature_case_desc'),
            icon: "benchmark",
            badge: "CASE COMPLIATION",
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
        <div className="min-h-screen bg-[#070a13] text-white font-sans overflow-x-hidden relative">
            
            {/* --- PREMIUM FIXED GLASS NAVIGATION --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070a13]/65 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 transition-all duration-300">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 duration-300">
                            <Icon name="benchmark" className="w-5.5 h-5.5 text-white" strokeWidth={3} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-extrabold text-lg tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">Benchmark AI</span>
                            <span className="text-[7.5px] font-black uppercase text-indigo-400/80 tracking-[0.3em] leading-none mt-0.5">Instructional Layer</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Language Switch */}
                        <div className="bg-slate-950/80 p-1 rounded-2xl border border-white/10 flex items-center shadow-inner">
                            <button 
                                onClick={() => setLanguage('EN')} 
                                className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all duration-300 ${language === 'EN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => setLanguage('KO')} 
                                className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all duration-300 ${language === 'KO' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                KO
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => openAuth('login')} 
                            className="text-xs font-bold uppercase text-slate-400 hover:text-white transition-colors duration-200"
                        >
                            {t('nav_login')}
                        </button>
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="relative group overflow-hidden px-5 py-2.5 rounded-2xl bg-white text-slate-950 text-xs font-extrabold uppercase hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 shrink-0"
                        >
                            <span className="relative z-10">{t('nav_join')}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="pt-32 md:pt-44 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                
                {/* Left Text Detail */}
                <div className="lg:col-span-7 text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                    {/* Futuristic Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                        <span className="text-[9px] font-black text-indigo-300 tracking-[0.25em] uppercase">Gen-3 Artificial Cognition</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7.5xl font-black tracking-tight mb-4 italic leading-[0.9] text-white">
                        {t('hero_title_1')}{' '}
                        <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 filter drop-shadow-sm font-black">
                            {t('hero_title_2')}
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
                        {t('hero_sub')}
                    </p>

                    {/* Quick credential highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
                        <div className="flex items-center gap-2">
                            <Icon name="shield" className="w-4.5 h-4.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">COPPA Secured</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="globe" className="w-4.5 h-4.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bilingual Ready</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                            <Icon name="star" className="w-4.5 h-4.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hagwon Scaled</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={loginDemo} 
                            className="group relative px-8 py-4 md:px-10 md:py-5 rounded-2.5xl bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold uppercase text-xs tracking-widest hover:brightness-110 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all text-white flex items-center justify-center gap-3 border-b-4 border-indigo-950"
                        >
                            <Icon name="brain" className="w-4.5 h-4.5 text-indigo-200 animate-pulse" />
                            <span>{language === 'EN' ? 'Launch Interactive Demo' : '인터랙티브 데모 체험'}</span>
                            <Icon name="arrowRight" className="w-4 h-4 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </button>
                        
                        <button 
                            onClick={() => openAuth('signup')} 
                            className="px-8 py-4 md:px-10 md:py-5 rounded-2.5xl bg-slate-950/40 border border-white/10 font-extrabold uppercase text-xs hover:bg-slate-900/60 hover:border-white/25 transition-all flex items-center justify-center gap-3"
                        >
                            <Icon name="plus" className="w-4.5 h-4.5 text-indigo-400" />
                            <span>{t('nav_join')}</span>
                        </button>
                    </div>
                </div>

                {/* Right Interactive Center Column */}
                <div className="lg:col-span-5 animate-in fade-in slide-in-from-right duration-1000 relative">
                    {/* Background glow effects strictly local */}
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-[3.5rem] filter blur-3xl -z-10"></div>
                    
                    {/* Outer frame */}
                    <div className="relative w-full bg-slate-950/70 border border-white/10 p-6 md:p-8 rounded-[3rem] box-shadow-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                        
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-500 ml-2">CORE_NODE::ACTIVE</span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[8px] font-mono uppercase tracking-widest border border-white/5">
                                SECURE LAYER
                            </div>
                        </div>

                        {/* Interactive carousel tabs switcher */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-white/5 mb-6 shadow-inner">
                            {FEATURES.map((feat, idx) => (
                                <button
                                    key={feat.id}
                                    onClick={() => handleTabSelect(idx)}
                                    className={`relative py-2.5 px-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                        activeFeature === idx 
                                            ? 'bg-slate-900 text-white shadow' 
                                            : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <span className="relative z-10">{feat.title.split(' ')[0]}</span>
                                    {activeFeature === idx && (
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 -z-10 border border-indigo-500/20"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Custom visual module card */}
                        <div className="bg-black/40 rounded-[2.2rem] border border-white/5 h-64 flex items-center justify-center p-6 transition-all duration-300">
                            {FEATURES[activeFeature].ui}
                        </div>

                        {/* Description & Auto-timeline bar */}
                        <div className="mt-6 text-left space-y-4">
                            <div className="flex items-center justify-between text-[8px] tracking-[0.2em] font-black text-indigo-400 uppercase">
                                <span>{FEATURES[activeFeature].badge}</span>
                                <span>LIVE PREVIEW</span>
                            </div>
                            <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed italic">
                                "{FEATURES[activeFeature].description}"
                            </p>

                            {/* Timeline Fill Bar */}
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-80 ease-linear" 
                                    style={{ width: `${carouselProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- INSTITUTIONAL TRUST BAR --- */}
            <section className="py-12 border-y border-white/5 bg-[#030611]/30 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-black uppercase text-indigo-400/80 tracking-[0.34em] mb-8">
                        {language === 'EN' ? 'TRUSTED BY INNOVATIVE ESL ACADEMIES & PREP SCHOOLS' : '학습 혁신을 선도하는 국내외 명문 학원 및 예비 학교 협약'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16 text-slate-500 text-xs font-mono font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 cursor-default transition">
                            <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-500"></span>
                            <span>AEGIS INT. PREP</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 cursor-default transition">
                            <span className="inline-block w-2.5 h-2.5 rounded bg-amber-500"></span>
                            <span>MAPLE KIDS DEPT.</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 cursor-default transition">
                            <span className="inline-block w-2.5 h-2.5 rounded bg-emerald-500"></span>
                            <span>PRESTIGE PRIMARY</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 cursor-default transition">
                            <span className="inline-block w-2.5 h-2.5 rounded bg-purple-500"></span>
                            <span>OLYMPUS HAGWON</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- INTERACTIVE STATS / BENTO BOX FEATURES --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 space-y-20">
                
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex gap-2.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black tracking-widest text-indigo-300 uppercase">
                        Product Dashboard Core API
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white italic tracking-tight">
                        {language === 'EN' ? 'Decisions Over Databases.' : '단순 조회를 넘어선, 수업 방향의 즉각 처방.'}
                    </h2>
                    <p className="text-slate-400 text-base font-medium leading-relaxed">
                        {language === 'EN' 
                          ? 'Why waste hours in spreadsheets? Benchmark AI instantly maps child diagnostics to ready-to-print learning resources and individual parent updates.' 
                          : '엑셀 앞에서 고민하던 수많은 시간들과 지루한 성적 발송 전송을 단 몇 번의 마우스 조작과 지능형 AI 가이드로 완전히 바꿉니다.'}
                    </p>
                </div>

                {/* --- INTERACTIVE LIVE GROWTH VELOCITY SIMULATOR --- */}
                <div className="bg-slate-950/55 rounded-[3.5rem] border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-6">
                        <span className="text-[7.5px] font-mono text-slate-500">MODULE_ID: ESL_SIMUL_1.0</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                        
                        {/* Simulation Controls Left (5 cols) */}
                        <div className="lg:col-span-5 text-left space-y-8">
                            <div className="space-y-2">
                                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest font-mono">STEP 01 — INPUTS</span>
                                <h3 className="text-xl md:text-2xl font-black italic text-white">{language === 'EN' ? 'Student Skill Parameter Simulation' : '실시간 연령별 및 학업 강도 통계 시뮬레이션'}</h3>
                                <p className="text-xs text-slate-400">{language === 'EN' ? 'Slide elements to test how AI configures growth velocity profiles immediately.' : '슬라이더 또는 시간 설정 값을 변경하여 실시간 대응 성장 곡선의 민감도 가속을 체크하세요.'}</p>
                            </div>

                            <div className="space-y-6">
                                {/* Level Slider */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-extrabold uppercase text-slate-300 tracking-wider text-[10px]">{language === 'EN' ? 'ESL Skill Level' : '현재 ESL 권장 학업 학년'}</label>
                                        <span className="font-mono text-indigo-300 font-bold bg-[#141b31]/40 px-2 py-0.5 rounded border border-white/5">LEVEL {simLevel}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={simLevel} 
                                        onChange={(e) => setSimLevel(Number(e.target.value))}
                                        className="w-full accent-indigo-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                                    />
                                </div>

                                {/* Phonics Score Slider */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-extrabold uppercase text-slate-300 tracking-wider text-[10px]">{language === 'EN' ? 'Phonemic Foundation Mastery' : '파닉스 알파벳 및 결합 마스터율'}</label>
                                        <span className="font-mono text-indigo-300 font-bold bg-[#141b31]/40 px-2 py-0.5 rounded border border-white/5">{simPhonics}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="100" 
                                        value={simPhonics} 
                                        onChange={(e) => setSimPhonics(Number(e.target.value))}
                                        className="w-full accent-indigo-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                                    />
                                </div>

                                {/* Study Intensity Buttons */}
                                <div className="space-y-3.5">
                                    <label className="font-extrabold uppercase text-slate-300 tracking-wider text-[10px] block">{language === 'EN' ? 'Weekly Instructional Intensity' : '주간 평균 집중 이수 강도'}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[2, 4, 6].map((hrs) => (
                                            <button
                                                key={hrs}
                                                onClick={() => setSimHours(hrs)}
                                                className={`py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition duration-200 border ${
                                                    simHours === hrs 
                                                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                                                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {hrs} {language === 'EN' ? 'Hrs / Wk' : '시간 / 주'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Simulator Visualization Right (7 cols) */}
                        <div className="lg:col-span-7 bg-[#040812]/70 border border-white/5 p-6 md:p-8 rounded-[2.5rem] text-left space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest font-mono">STEP 02 — DIAGNOSTIC PROJECTION</span>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                                {/* Large Velocity Number */}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language === 'EN' ? 'Growth Velocity Rating' : '예상 성장 속도 등급'}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl md:text-5xl font-black italic text-white font-mono">{simVelocity > 0 ? `+${simVelocity}` : simVelocity}</span>
                                        <span className="text-indigo-400 font-bold text-xs uppercase font-mono">Units/Mo</span>
                                    </div>
                                </div>

                                {/* Dynamic Band Badge Card */}
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{language === 'EN' ? 'Velocity Pathways Tag' : '배정 성장 경로 지침'}</p>
                                    <div className={`px-4 py-3 border rounded-2l font-black text-xs text-center tracking-widest transition-all duration-300 ${bandColors[velocityBand]}`}>
                                        {bandLabels[velocityBand]}
                                    </div>
                                </div>
                            </div>

                            {/* Generative Message Container */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Icon name="brain" className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest font-mono text-indigo-300">AUTO-GENERATED STRATEGIC MEMO</span>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                    <p className="text-slate-300 font-medium text-xs sm:text-sm leading-relaxed transition-all duration-300">
                                        {getSandboxMessage(velocityBand, simLevel, simHours, language)}
                                    </p>
                                </div>
                            </div>

                            {/* Demo Action Trigger */}
                            <button 
                                onClick={loginDemo}
                                className="w-full py-4 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Icon name="brain" className="w-4 h-4 text-indigo-600" />
                                {language === 'EN' ? 'Test Custom Class Profiles' : '진짜 클래스 프로필로 테스트 하기'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Additional Bento Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* card 1 */}
                    <div className="bg-slate-950/45 border border-white/10 rounded-[2.5rem] p-8 text-left space-y-4 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                <Icon name="students" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-white italic">{language === 'EN' ? 'Active Pods Assembly' : '자동 소그룹 소모임 편성'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                                {language === 'EN' 
                                  ? 'No manual profiling. Our system gathers students sharing matching phonics or syntactic gaps and packs them into designated peer work groups automatically.' 
                                  : '더 이상의 피곤한 학생별 개별 분류 조작은 없습니다. 성취도 파닉스가 완전히 일치하는 학생들을 찾아 즉시 소그룹 분화 및 짝 매칭 솔루션을 도출해 제공합니다.'}
                            </p>
                        </div>
                    </div>
                    {/* card 2 */}
                    <div className="bg-slate-950/45 border border-white/10 rounded-[2.5rem] p-8 text-left space-y-4 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                <Icon name="robot" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-white italic">{language === 'EN' ? 'Automated Parent Portals' : '클릭 한번으로 학부모 보고서'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                                {language === 'EN' 
                                  ? 'Generate non-clinical, comprehensive narratives for parents instantly. Multilingual translations ensure perfect transparency and Hagwon retention.' 
                                  : '데이터를 읽지 못하는 학부모를 위해, 전문 용어가 완전히 보제된 심층 설명 편지를 즉시 조립 인쇄합니다. 정기 발송으로 학부모와 돈독한 연대감을 세우세요.'}
                            </p>
                        </div>
                    </div>
                    {/* card 3 */}
                    <div className="bg-slate-950/45 border border-white/10 rounded-[2.5rem] p-8 text-left space-y-4 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                <Icon name="library" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-white italic">{language === 'EN' ? 'Integrated Resource Bank' : '실시간 훈련 콘텐츠 즉각 연계'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                                {language === 'EN' 
                                  ? 'Identify grammatical trends or phonetic plateaus, and access direct worksheets custom-designed for those exact learning obstacles.' 
                                  : '과제 수행 결과 분석을 완료하는 즉시, 학생이 막힌 특정 발음 구조나 문장의 장애율을 해소시킬 수 있는 리소스 교재 파일을 즉시 화면에 연계시켜 다운로드 권장합니다.'}
                            </p>
                        </div>
                    </div>
                </div>

            </section>

            {/* --- SYSTEM STATS TICKER FOOTER BANNER --- */}
            <footer className="py-12 border-t border-white/5 bg-[#030611]/60 relative z-10 text-slate-500 text-xs text-center">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">B</div>
                        <span className="font-bold tracking-tight text-slate-400">Benchmark AI Core Alpha.</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-black tracking-widest text-slate-500">
                        <button onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }} className="hover:text-slate-300">{language === 'EN' ? 'Privacy Policy' : '개인정보 지침'}</button>
                        <button onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }} className="hover:text-slate-300">{language === 'EN' ? 'Terms of Service' : '이용 약관'}</button>
                        <button onClick={() => { setLegalTab('dpa'); setIsLegalModalOpen(true); }} className="hover:text-slate-300">DPA</button>
                        <button onClick={() => { setLegalTab('billing'); setIsLegalModalOpen(true); }} className="hover:text-slate-300">{language === 'EN' ? 'Pricing Policy' : '결제 규약'}</button>
                    </div>

                    <p className="text-[10px] font-mono text-slate-600">© 2026 BENCHMARK EDUCATION INFRASTRUCTURE.</p>
                </div>
            </footer>

            {/* --- PREMIUM PORTAL GLASS MODAL (AUTH) --- */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#0b0e17]/95 border border-[#1e293b]/70 text-white w-full max-w-md p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] shadow-[0_45px_100px_rgba(7,10,19,0.8)] relative overflow-hidden transition-all duration-300 scale-100 animate-in zoom-in-95">
                        
                        {/* Interactive floating blur orb in auth */}
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 filter blur-3xl -z-10 rounded-full"></div>
                        
                        {/* Close button with high-end feel */}
                        <button 
                            onClick={() => setIsLoginModalOpen(false)} 
                            className="absolute top-8 right-8 p-1.5 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl"
                        >
                            <Icon name="close" className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                <Icon name="benchmark" className="w-5.5 h-5.5" strokeWidth={3} />
                            </div>
                            <span className="text-[9px] font-mono text-indigo-400 font-extrabold tracking-[0.25em] uppercase">SYSTEM CREDENTIALING PORTAL</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight italic text-left bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                            {authMode === 'login' ? t('auth_login_title') : t('auth_signup_title')}
                        </h2>
                        
                        <p className="text-xs text-slate-400 text-left mb-6 font-medium leading-relaxed">
                            {authMode === 'login' 
                              ? (language === 'EN' ? 'Initiate secure login session to map metrics.' : '클래스 계정 지표 확인을 위한 보안 키 인증 절차.')
                              : (language === 'EN' ? 'Register a new institutional profile node.' : '새로운 학원 또는 지점 연구 관리 노드 생성.')}
                        </p>

                        {/* Error Alert Box */}
                        {authError && (
                            <div className="mb-6 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-300 text-xs text-left flex items-start gap-2.5 animate-pulse">
                                <Icon name="alert" className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                                <span className="font-bold leading-relaxed">{authError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-left">
                            {authMode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-indigo-300/80 ml-1.5 font-mono">{t('field_name')}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition text-white placeholder-slate-600" 
                                        placeholder={language === 'EN' ? "Director Name" : "성함 입력"} 
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-indigo-300/80 ml-1.5 font-mono">{t('field_email')}</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition text-white placeholder-slate-600" 
                                    placeholder="director@school.edu" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-indigo-300/80 ml-1.5 font-mono">{t('field_pass')}</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition text-white placeholder-slate-600" 
                                    placeholder="••••••••" 
                                />
                            </div>
                            
                            {authMode === 'login' && (
                                <div className="flex items-center gap-2.5 px-1 pb-2">
                                    <input 
                                        type="checkbox" 
                                        id="rememberMeCheckbox" 
                                        checked={rememberMe} 
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded-md border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                                    />
                                    <label htmlFor="rememberMeCheckbox" className="text-[9px] font-black uppercase text-slate-400 tracking-wider cursor-pointer">
                                        {language === 'EN' ? 'Keep session active (30 days)' : '인증 유효 세션 유지 (30일)'}
                                    </label>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 shadow-lg active:scale-[0.98] transition border-b-4 border-indigo-950"
                            >
                                {isLoading 
                                  ? (language === 'EN' ? 'CONNECTING INTERPRETER...' : '인증 매핑 진행중...') 
                                  : (authMode === 'login' ? t('btn_auth') : t('btn_init'))}
                            </button>
                        </form>

                        <button 
                            onClick={() => {
                                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                setAuthError('');
                            }} 
                            className="mt-6 w-full text-indigo-400 font-extrabold text-[9px] uppercase tracking-widest hover:underline text-center"
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
