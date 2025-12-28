
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icon';

// Feature Slides Data
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
                {/* Header Input Mockup */}
                <div className="w-full p-2 bg-white/5 border border-white/10 rounded-lg mb-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-300">Topic: Past Tense</span>
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-sm shadow-emerald-900/20">Generate</div>
                </div>
                
                {/* Document Preview Mockup */}
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
                    
                    {/* Floating Success Badge */}
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
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [activeFeature, setActiveFeature] = useState(0);
    const [currentView, setCurrentView] = useState<'home' | 'pricing'>('home');
    
    // Auth Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Auto-rotate features
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (authMode === 'login') { 
            success = await login(email, password); 
        } else { 
            success = await signup(name, email, password); 
        }
        if (success) setIsLoginModalOpen(false);
    };

    const handleDemoLogin = () => {
        // Use the new simplified demo login
        // No network request, no password, immediate access
        loginDemo();
        setIsLoginModalOpen(false);
    };

    const handleNav = (targetView: 'home' | 'pricing', sectionId?: string) => {
        // Simple and robust navigation logic
        if (targetView !== currentView) {
            setCurrentView(targetView);
            // Wait for render cycle to complete before scrolling
            setTimeout(() => {
                if (sectionId) {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        } else {
            // Already on the view, just scroll
            if (sectionId) {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Parallax/Scroll effect for navbar
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden scroll-smooth">
            
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || currentView === 'pricing' ? 'bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-lg' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => handleNav('home')}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform duration-300">
                            <Icon name="benchmark" className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Benchmark AI</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <button 
                            onClick={() => handleNav('home', 'how-it-works')} 
                            className="hover:text-white transition-colors py-2"
                        >
                            How it works
                        </button>
                        <button 
                            onClick={() => handleNav('pricing')} 
                            className={`transition-colors py-2 ${currentView === 'pricing' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-white'}`}
                        >
                            Pricing
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => openAuth('login')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log In</button>
                        <button 
                            onClick={() => openAuth('signup')}
                            className="px-6 py-2.5 rounded-full bg-white text-[#0B0F19] text-sm font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            Sign Up Free
                        </button>
                    </div>
                </div>
            </nav>

            {currentView === 'home' ? (
                <div className="animate-in fade-in duration-500">
                    {/* Hero Section */}
                    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                        {/* Background Blobs */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] -z-10"></div>

                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                    New: Meet Your AI Teaching Assistant
                                </div>
                                
                                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                    Elevate Your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-gradient">
                                        Teaching Intelligence
                                    </span>
                                </h1>
                                
                                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                    Unlock student potential with the world's most advanced AI assessment platform. 
                                    Track growth, chat with your data, and generate personalized interventions in seconds.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                    <button 
                                        onClick={() => openAuth('signup')}
                                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95"
                                    >
                                        Start Free Trial
                                    </button>
                                    <button 
                                        onClick={handleDemoLogin}
                                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icon name="brain" className="w-5 h-5" />
                                        Live Demo
                                    </button>
                                </div>

                                {/* Trust Indicators */}
                                <div className="mt-10 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                        {/* Rating */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex text-amber-400 gap-0.5">
                                                <Icon name="star" className="w-4 h-4" />
                                                <Icon name="star" className="w-4 h-4" />
                                                <Icon name="star" className="w-4 h-4" />
                                                <Icon name="star" className="w-4 h-4" />
                                                <Icon name="star" className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-bold text-white leading-none">4.9/5 Rating</span>
                                                <span className="text-[10px] text-slate-400 font-medium">from 2,000+ teachers</span>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="hidden sm:block w-px h-8 bg-white/10"></div>

                                        {/* Logos */}
                                        <div className="flex items-center gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                            <span className="text-sm font-serif italic font-bold text-white">Summit Academy</span>
                                            <span className="text-sm font-mono font-bold text-white tracking-tight">TECH<span className="text-indigo-400">HIGH</span></span>
                                            <span className="text-xs font-black text-white tracking-[0.2em]">GLOBAL</span>
                                        </div>
                                    </div>
                                    
                                    {/* Curriculum Compliance Indicators */}
                                    <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                                <Icon name="benchmark" className="w-3 h-3" />
                                            </div>
                                            <span>8-Domain Benchmarks</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-full bg-blue-500/20 text-blue-400">
                                                <Icon name="globe" className="w-3 h-3" />
                                            </div>
                                            <span>International Curriculums</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Feature Carousel */}
                            <div className="relative h-[400px] w-full max-w-md mx-auto lg:max-w-none perspective-1000 animate-in fade-in slide-in-from-right duration-1000 delay-500">
                                {/* Carousel Card Container */}
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
                                            <div 
                                                key={feature.id}
                                                className={`absolute w-full max-w-[320px] bg-[#131825] border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-700 ease-out ${transformClass}`}
                                            >
                                                {/* Header */}
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className={`p-3 rounded-xl bg-${feature.color}-500/10 text-${feature.color}-400`}>
                                                        <Icon name={feature.icon} className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-lg leading-tight">{feature.title}</h3>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Feature Spotlight</p>
                                                    </div>
                                                </div>

                                                {/* Live UI Preview */}
                                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[180px] flex items-center justify-center relative overflow-hidden">
                                                    {feature.ui}
                                                </div>

                                                {/* Description Footer */}
                                                <div className="mt-6 text-center">
                                                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Navigation Dots */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
                                    {FEATURES.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveFeature(i)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeFeature ? 'bg-white w-6' : 'bg-white/20 hover:bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section id="how-it-works" className="py-24 px-6 bg-[#0B0F19] relative scroll-mt-24">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4">How Benchmark Works</h2>
                                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Turn complex classroom data into simple, actionable steps in minutes.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                {/* Connecting Line (Desktop) */}
                                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>

                                {/* Step 1 */}
                                <div className="relative p-6 text-center group">
                                    <div className="w-24 h-24 mx-auto bg-[#131825] border-4 border-[#0B0F19] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-indigo-900/20">
                                        <div className="text-3xl font-bold text-indigo-500">1</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Assess</h3>
                                    <p className="text-slate-400 leading-relaxed">Input student scores manually or import them. Our flexible framework adapts to any curriculum standard.</p>
                                </div>

                                {/* Step 2 */}
                                <div className="relative p-6 text-center group">
                                    <div className="w-24 h-24 mx-auto bg-[#131825] border-4 border-[#0B0F19] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-purple-900/20">
                                        <div className="text-3xl font-bold text-purple-500">2</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Ask & Analyze</h3>
                                    <p className="text-slate-400 leading-relaxed">Chat with your data. Ask your AI Assistant to spot trends, summarize progress, or flag at-risk students instantly.</p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative p-6 text-center group">
                                    <div className="w-24 h-24 mx-auto bg-[#131825] border-4 border-[#0B0F19] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-emerald-900/20">
                                        <div className="text-3xl font-bold text-emerald-500">3</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Act</h3>
                                    <p className="text-slate-400 leading-relaxed">Generate personalized worksheets, lesson plans, and intervention strategies with a single click.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-24 px-6 bg-white/[0.02]">
                        <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 px-6 py-20 text-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your classroom?</h2>
                                <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">Join the platform that turns data into superpowers. Start your free trial today.</p>
                                <button 
                                    onClick={() => openAuth('signup')}
                                    className="px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
                                >
                                    Get Started Now
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                /* Pricing Page View */
                <section className="pt-32 pb-24 px-6 min-h-screen animate-in fade-in zoom-in-95 duration-500">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 backdrop-blur-sm">
                                <Icon name="analytics" className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple, Transparent Pricing</h2>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                                Choose the plan that fits your classroom needs. Upgrade anytime as you grow.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
                            {/* Decoration behind cards */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-indigo-500/10 blur-[100px] -z-10 rounded-full"></div>

                            {/* Free Tier */}
                            <div className="p-8 rounded-3xl bg-[#131825]/80 backdrop-blur border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 duration-300 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Starter</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tight">$0</span>
                                    <span className="text-slate-500 font-bold">/mo</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-8 flex-1 leading-relaxed">Perfect for individual teachers trying out the platform.</p>
                                <ul className="space-y-4 mb-8 text-sm text-slate-300 font-medium">
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Up to 30 Students</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Basic Analytics</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> 5 AI Generations/mo</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Standard Benchmarks</li>
                                </ul>
                                <button onClick={() => openAuth('signup')} className="w-full py-4 rounded-2xl border border-white/20 hover:bg-white hover:text-black font-bold transition-all mt-auto">Start Free</button>
                            </div>

                            {/* Pro Tier - Highlighted */}
                            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-600 to-indigo-900 border border-indigo-400 shadow-2xl shadow-indigo-500/30 relative transform md:-translate-y-4 z-10 flex flex-col">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-indigo-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
                                <h3 className="text-xl font-bold text-white mb-2">Educator Pro</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tight">$15</span>
                                    <span className="text-indigo-200 font-bold">/mo</span>
                                </div>
                                <p className="text-indigo-100 text-sm mb-8 flex-1 leading-relaxed opacity-90">For data-driven teachers who need superpowers.</p>
                                <ul className="space-y-4 mb-8 text-sm text-white font-medium">
                                    <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-indigo-400/30"><Icon name="check" className="w-3 h-3 text-white" /></div> Unlimited Students</li>
                                    <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-indigo-400/30"><Icon name="check" className="w-3 h-3 text-white" /></div> Advanced AI Insights</li>
                                    <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-indigo-400/30"><Icon name="check" className="w-3 h-3 text-white" /></div> Unlimited Resource Gen</li>
                                    <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-indigo-400/30"><Icon name="check" className="w-3 h-3 text-white" /></div> Export PDF Reports</li>
                                    <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-indigo-400/30"><Icon name="check" className="w-3 h-3 text-white" /></div> Priority Support</li>
                                </ul>
                                <button onClick={() => openAuth('signup')} className="w-full py-4 rounded-2xl bg-white text-indigo-900 font-black hover:bg-indigo-50 transition-all shadow-lg mt-auto hover:shadow-xl active:scale-95">Get Pro Access</button>
                            </div>

                            {/* School Tier */}
                            <div className="p-8 rounded-3xl bg-[#131825]/80 backdrop-blur border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 duration-300 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">School & District</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tight">Custom</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-8 flex-1 leading-relaxed">For administrative oversight across multiple classrooms.</p>
                                <ul className="space-y-4 mb-8 text-sm text-slate-300 font-medium">
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Admin Dashboard</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> API Access & SSO</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> Dedicated Account Manager</li>
                                    <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-emerald-500 shrink-0" /> PD Training Sessions</li>
                                </ul>
                                <button className="w-full py-4 rounded-2xl border border-white/20 hover:bg-white hover:text-black font-bold transition-all mt-auto">Contact Sales</button>
                            </div>
                        </div>
                        
                        {/* FAQ or Extra Info */}
                        <div className="mt-24 pt-12 border-t border-white/5 text-center">
                            <h3 className="text-2xl font-bold mb-4">Have specific questions?</h3>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">We offer discounts for non-profits and educational institutions in developing regions.</p>
                            <button className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors">Read the full FAQ</button>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Benchmark AI. All rights reserved.</p>
            </footer>

            {/* Auth Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white text-slate-900 w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition">
                            <Icon name="close" className="w-6 h-6" />
                        </button>
                        
                        <div className="mb-8">
                            <h2 className="text-3xl font-black mb-2 tracking-tight">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                            <p className="text-slate-500 font-medium">Enter your details to continue to your dashboard.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'signup' && (
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                    placeholder="name@school.edu"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all mt-4 shadow-lg active:scale-95"
                            >
                                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm font-medium text-slate-500 mb-4">
                                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"} 
                                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold ml-1 hover:underline">
                                    {authMode === 'login' ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                            <button onClick={handleDemoLogin} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                Try Demo Account (No Signup)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
