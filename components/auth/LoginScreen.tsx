
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icon';
import { LegalModal } from '../common/LegalModal';

const FEATURES = [
    {
        id: 0,
        title: "AI Chat Assistant",
        description: "Your 24/7 co-pilot. Ask complex questions about data and get instant strategies.",
        icon: "chat",
        color: "indigo",
        ui: (
            <div className="w-full h-full flex flex-col justify-center gap-3 px-2">
                <div className="self-end bg-indigo-500 text-white text-[10px] px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg max-w-[85%]">
                    How's the class doing in Phonics?
                </div>
                <div className="self-start bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 text-[10px] px-3 py-2 rounded-2xl rounded-tl-sm max-w-[90%]">
                    <span className="font-bold text-white">Great!</span> Class average is up 8%. 3 students have mastered CVC words.
                </div>
                <div className="self-end bg-indigo-500 text-white text-[10px] px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg max-w-[85%]">
                    Create a worksheet for them.
                </div>
            </div>
        )
    },
    {
        id: 1,
        title: "Real-Time Tracking",
        description: "Monitor student growth across 8 domains with live dashboards.",
        icon: "analytics",
        color: "blue",
        ui: (
            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">AK</div>
                        <div>
                            <div className="h-2 w-16 bg-white/20 rounded mb-1"></div>
                            <div className="h-1.5 w-8 bg-white/10 rounded"></div>
                        </div>
                    </div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Icon name="trendUp" className="w-3 h-3" /> +12%
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">CL</div>
                        <div>
                            <div className="h-2 w-20 bg-white/20 rounded mb-1"></div>
                            <div className="h-1.5 w-10 bg-white/10 rounded"></div>
                        </div>
                    </div>
                    <div className="text-rose-400 text-xs font-bold flex items-center gap-1">
                        <Icon name="alert" className="w-3 h-3" /> Risk
                    </div>
                </div>
                <div className="mt-2 h-24 w-full bg-gradient-to-t from-indigo-500/20 to-transparent rounded-lg relative overflow-hidden flex items-end justify-between px-2 pb-2 gap-1">
                    {[40, 65, 55, 80, 72, 90].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "AI Pedagogical Insights",
        description: "Instant analysis of performance trends with actionable next steps.",
        icon: "brain",
        color: "purple",
        ui: (
            <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient bg-300%"></div>
                <div className="flex items-center gap-2 mb-3 text-purple-300">
                    <Icon name="brain" className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Analysis</span>
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded animate-pulse"></div>
                    <div className="h-2 w-[90%] bg-white/10 rounded animate-pulse delay-75"></div>
                    <div className="h-2 w-[95%] bg-white/10 rounded animate-pulse delay-150"></div>
                </div>
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-[10px] text-purple-200 font-medium leading-relaxed">
                        "Focus Area: <strong>Inferential Reading</strong>. Recommend grouping students for targeted intervention."
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Instant Resource Gen",
        description: "Create tailored worksheets and lesson plans in seconds.",
        icon: "library",
        color: "emerald",
        ui: (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <div className="w-full p-2 bg-white/5 border border-white/10 rounded-lg mb-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-300">Topic: Past Tense</span>
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-sm shadow-emerald-900/20">Generate</div>
                </div>
                <div className="w-24 aspect-[3/4] bg-white rounded-lg shadow-xl shadow-black/20 transform rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-105 p-2 relative group cursor-pointer">
                    <div className="h-1.5 w-1/3 bg-slate-200 rounded-sm mb-2"></div>
                    <div className="space-y-1 mb-3">
                        <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                        <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                        <div className="h-0.5 w-3/4 bg-slate-100 rounded-sm"></div>
                        <div className="h-0.5 w-full bg-slate-100 rounded-sm"></div>
                    </div>
                     <div className="space-y-1">
                        <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-md"></div>
                        <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-md"></div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                        <Icon name="check" className="w-3 h-3" />
                    </div>
                </div>
            </div>
        )
    }
];

export const LoginScreen: React.FC = () => {
    const { login, signup, loginDemo, isLoading } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'dpa' | 'billing'>('privacy');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentView, setCurrentView] = useState<'home' | 'pricing'>('home');
    const [landingLang, setLandingLang] = useState<'EN' | 'KO'>('EN');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % FEATURES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsLoginModalOpen(true);
    };

    const openLegal = (tab: 'privacy' | 'terms' | 'dpa' | 'billing') => {
        setLegalTab(tab);
        setIsLegalModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (authMode === 'login') { success = await login(email, password); } 
        else { success = await signup(name, email, password); }
        if (success) setIsLoginModalOpen(false);
    };

    const handleDemoLogin = () => {
        loginDemo();
        setIsLoginModalOpen(false);
    };

    const handleNav = (targetView: 'home' | 'pricing', sectionId?: string) => {
        if (targetView !== currentView) {
            setCurrentView(targetView);
            setTimeout(() => {
                if (sectionId) {
                    const element = document.getElementById(sectionId);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        } else if (sectionId) {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden scroll-smooth">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || currentView === 'pricing' ? 'bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-lg' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav('home')}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform duration-300">
                            <Icon name="benchmark" className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Benchmark AI</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <button onClick={() => handleNav('home', 'how-it-works')} className="hover:text-white transition-colors py-2">How it works</button>
                        <button onClick={() => handleNav('pricing')} className={`transition-colors py-2 ${currentView === 'pricing' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-white'}`}>Pricing</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 mr-2">
                             <button onClick={() => setLandingLang('EN')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'EN' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>EN</button>
                             <button onClick={() => setLandingLang('KO')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'KO' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>KO</button>
                        </div>
                        <button onClick={() => openAuth('login')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</button>
                        <button onClick={() => openAuth('signup')} className="px-6 py-2.5 rounded-full bg-white text-[#0B0F19] text-sm font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">Sign Up Free</button>
                    </div>
                </div>
            </nav>

            {currentView === 'home' ? (
                <div className="animate-in fade-in duration-500">
                    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300 mb-6">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                    {landingLang === 'EN' ? 'New: Meet Your AI Teaching Assistant' : '신규 기능: AI 교수 지원 어시스턴트 출시'}
                                </div>
                                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                                    {landingLang === 'EN' ? <>Elevate Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">Teaching Intelligence</span></> : 
                                    <>교수 지능의 <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">새로운 기준</span></>}
                                </h1>
                                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    {landingLang === 'EN' ? "Unlock student potential with the world's most advanced AI assessment platform. Track growth, chat with your data, and generate personalized interventions in seconds." : 
                                    "세계에서 가장 진보된 AI 평가 플랫폼으로 학생의 잠재력을 이끌어내세요. 성장을 추적하고, 데이터와 대화하며, 단 몇 초 만에 맞춤형 개입 전략을 생성합니다."}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <button onClick={() => openAuth('signup')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95">
                                        {landingLang === 'EN' ? 'Start Free Trial' : '무료 체험 시작'}
                                    </button>
                                    <button onClick={handleDemoLogin} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                        <Icon name="brain" className="w-5 h-5" />
                                        {landingLang === 'EN' ? 'Live Demo' : '데모 체험'}
                                    </button>
                                </div>
                            </div>
                            <div className="relative h-[400px] w-full max-w-md mx-auto lg:max-w-none perspective-1000">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {FEATURES.map((feature, index) => {
                                        const isActive = index === activeFeature;
                                        const isPrev = index === (activeFeature - 1 + FEATURES.length) % FEATURES.length;
                                        const isNext = index === (activeFeature + 1) % FEATURES.length;
                                        let transformClass = 'opacity-0 scale-90 translate-x-0 z-0';
                                        if (isActive) transformClass = 'opacity-100 scale-100 z-20 translate-x-0';
                                        else if (isPrev) transformClass = 'opacity-40 scale-90 -translate-x-12 z-10 blur-sm';
                                        else if (isNext) transformClass = 'opacity-40 scale-90 translate-x-12 z-10 blur-sm';
                                        return (
                                            <div key={feature.id} className={`absolute w-full max-w-[320px] bg-[#131825] border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-700 ease-out ${transformClass}`}>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className={`p-3 rounded-xl bg-indigo-500/10 text-indigo-400`}><Icon name={feature.icon} className="w-6 h-6" /></div>
                                                    <div><h3 className="font-bold text-white text-lg leading-tight">{feature.title}</h3><p className="text-[10px] text-slate-400 font-medium uppercase">Spotlight</p></div>
                                                </div>
                                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[180px] flex items-center justify-center relative overflow-hidden">{feature.ui}</div>
                                                <div className="mt-6 text-center"><p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <section className="pt-32 pb-24 px-6 min-h-screen animate-in fade-in zoom-in-95 duration-500">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{landingLang === 'EN' ? 'Institutional Pricing' : '기관 맞춤형 요금제'}</h2>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto">{landingLang === 'EN' ? 'Scale pedagogical intelligence across your entire academy.' : '학원 전체에 고도화된 교육 지능을 도입하세요.'}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            <div className="p-8 rounded-[3rem] bg-[#131825]/80 backdrop-blur border border-white/10 hover:border-white/20 transition-all flex flex-col group">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Starter</h3>
                                <div className="mb-6 flex items-baseline gap-1"><span className="text-5xl font-black text-white tracking-tight">$0</span><span className="text-slate-500 font-bold">/mo</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-slate-300 font-medium flex-1">
                                    <li className="flex items-center gap-3 opacity-60"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Up to 25 Students</li>
                                    <li className="flex items-center gap-3 opacity-60"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Basic Dashboards</li>
                                    <li className="flex items-center gap-3 opacity-60"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Manual Data Entry</li>
                                    <li className="flex items-center gap-3 opacity-30 line-through"><Icon name="close" className="w-5 h-5 text-slate-500 shrink-0" /> No PDF Export</li>
                                </ul>
                                <button onClick={() => openAuth('signup')} className="w-full py-5 rounded-2xl border-2 border-white/10 hover:bg-white hover:text-black font-black uppercase text-xs tracking-widest transition-all">Get Started</button>
                            </div>
                            
                            <div className="p-10 rounded-[3rem] bg-gradient-to-b from-indigo-600 to-indigo-900 border border-indigo-400 shadow-2xl relative transform md:-translate-y-6 z-10 flex flex-col scale-105">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-indigo-900 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">Most Popular</div>
                                <h3 className="text-xl font-bold text-white mb-2">Educator Pro</h3>
                                <div className="mb-6 flex items-baseline gap-1"><span className="text-5xl font-black text-white tracking-tight">$15</span><span className="text-indigo-200 font-bold">/mo</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-white font-medium flex-1">
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 shrink-0 text-emerald-300" /> Unlimited Students</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 shrink-0 text-emerald-300" /> <b>AI Vision Scoring (OCR)</b></li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 shrink-0 text-emerald-300" /> <b>Multilingual PDF Reports</b></li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 shrink-0 text-emerald-300" /> Advanced Intervention Logic</li>
                                </ul>
                                <button onClick={() => openAuth('signup')} className="w-full py-5 bg-white text-indigo-900 font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-xl rounded-2xl border-b-4 border-indigo-200">Go Pro Now</button>
                            </div>

                            <div className="p-8 rounded-[3rem] bg-[#131825]/80 backdrop-blur border border-white/10 hover:border-white/20 transition-all flex flex-col">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Institutional</h3>
                                <div className="mb-6 flex items-baseline gap-1"><span className="text-3xl font-black text-white tracking-tight">Custom</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-slate-300 font-medium flex-1">
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Principal Dashboard</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Cross-Class Analytics</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Custom School Branding</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Dedicated API Access</li>
                                </ul>
                                <button className="w-full py-5 rounded-2xl border-2 border-white/10 hover:bg-white hover:text-black font-black uppercase text-xs tracking-widest transition-all">Contact Sales</button>
                            </div>
                        </div>
                        
                        <div className="mt-16 text-center">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">All plans include 256-bit encryption & PIPA/GDPR compliance.</p>
                        </div>
                    </div>
                </section>
            )}

            <footer className="py-20 px-6 border-t border-white/5 bg-[#080B14]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Icon name="benchmark" className="w-4 h-4 text-white" /></div>
                            <span className="font-bold text-lg text-white">Benchmark AI</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">Empowering ESL institutions with high-precision pedagogical intelligence. Built for hagwons and international academies.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Legal</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><button onClick={() => openLegal('privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
                                <li><button onClick={() => openLegal('terms')} className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
                                <li><button onClick={() => openLegal('billing')} className="hover:text-indigo-400 transition-colors">Pricing & Billing</button></li>
                                <li><button onClick={() => openLegal('dpa')} className="hover:text-indigo-400 transition-colors">Data Processing</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">법률 안내</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><button onClick={() => openLegal('privacy')} className="hover:text-indigo-400 transition-colors">개인정보처리방침</button></li>
                                <li><button onClick={() => openLegal('terms')} className="hover:text-indigo-400 transition-colors">이용약관</button></li>
                                <li><button onClick={() => openLegal('billing')} className="hover:text-indigo-400 transition-colors">결제 및 환불</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-xs">
                    <p>&copy; {new Date().getFullYear()} Benchmark AI Platform. Licensed for institutional use. Contact: jsn.benjamin@gmail.com</p>
                </div>
            </footer>

            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white text-slate-900 w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 transition"><Icon name="close" className="w-6 h-6" /></button>
                        <h2 className="text-3xl font-black mb-8 tracking-tight">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'signup' && <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Full Name" />}
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Email Address" />
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="Password" />
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all mt-4">{isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}</button>
                        </form>
                        <div className="mt-8 text-center text-sm font-medium text-slate-500">
                            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold hover:underline">{authMode === 'login' ? 'Create an account' : 'Already have an account?'}</button>
                        </div>
                    </div>
                </div>
            )}
            <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalTab} />
        </div>
    );
};
