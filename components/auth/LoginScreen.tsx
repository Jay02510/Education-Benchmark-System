
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
                        <div className="h-2 w-16 bg-white/20 rounded"></div>
                    </div>
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Icon name="trendUp" className="w-3 h-3" /> +12%
                    </div>
                </div>
                <div className="mt-2 h-24 w-full bg-gradient-to-t from-indigo-500/20 to-transparent rounded-lg relative overflow-hidden flex items-end justify-between px-2 pb-2 gap-1">
                    {[40, 65, 55, 80, 72, 90].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
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

    const handleContactSupport = () => {
        window.location.href = `mailto:jsn.benjamin@gmail.com?subject=Benchmark Institutional Inquiry`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (authMode === 'login') { success = await login(email, password); } 
        else { success = await signup(name, email, password); }
        if (success) setIsLoginModalOpen(false);
    };

    const handleNav = (view: 'home' | 'pricing') => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center"><Icon name="benchmark" className="w-5 h-5" /></div>
                        <span className="font-bold text-xl">Benchmark AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <button onClick={() => handleNav('home')} className={currentView === 'home' ? 'text-white' : ''}>Product</button>
                        <button onClick={() => handleNav('pricing')} className={currentView === 'pricing' ? 'text-white' : ''}>Pricing</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 mr-2">
                             <button onClick={() => setLandingLang('EN')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'EN' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>EN</button>
                             <button onClick={() => setLandingLang('KO')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'KO' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>KO</button>
                        </div>
                        <button onClick={() => openAuth('login')} className="text-sm font-bold text-slate-300">Log In</button>
                        <button onClick={() => openAuth('signup')} className="px-6 py-2 rounded-full bg-white text-slate-900 text-sm font-bold">Sign Up</button>
                    </div>
                </div>
            </nav>

            {currentView === 'home' ? (
                <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95]">
                        {landingLang === 'EN' ? "Teach with Intelligence." : "교수를 더 스마트하게."}
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
                        {landingLang === 'EN' ? "The world's most advanced pedagogical AI for ESL academies and international schools." : "ESL 학원 및 국제 학교를 위한 세계 최고의 교육 전문 AI 플랫폼."}
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => openAuth('signup')} className="px-10 py-5 rounded-[2rem] bg-indigo-600 font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all border-b-8 border-indigo-900">Start for Free</button>
                        <button onClick={loginDemo} className="px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">Live Demo</button>
                    </div>
                </div>
            ) : (
                <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4">{landingLang === 'EN' ? "Pricing Plans" : "요금 안내"}</h2>
                        <p className="text-slate-400">{landingLang === 'EN' ? "Scale intelligence across your classroom or campus." : "교실 혹은 캠퍼스 전체를 위한 최적의 플랜을 선택하세요."}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        <div className="p-8 rounded-[3rem] bg-[#131825] border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <div className="mb-6"><span className="text-4xl font-black">$0</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-400">
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Up to 25 Students</li>
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Basic Dashboards</li>
                            </ul>
                            <button onClick={() => openAuth('signup')} className="w-full py-4 rounded-2xl border border-white/20 font-bold">Get Started</button>
                        </div>
                        <div className="p-10 rounded-[3.5rem] bg-indigo-600 shadow-2xl relative transform md:-translate-y-4 flex flex-col scale-105">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-900 px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">Most Popular</div>
                            <h3 className="text-xl font-bold mb-2 text-white">Educator Pro</h3>
                            <div className="mb-6 text-white"><span className="text-4xl font-black">$15</span><span className="text-sm font-bold opacity-60">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm text-indigo-100">
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300" /> Unlimited Students</li>
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300" /> <b>AI Vision Scoring (OCR)</b></li>
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300" /> PDF Report Export</li>
                            </ul>
                            <button onClick={() => openAuth('signup')} className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-xl">Go Pro Now</button>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-[#131825] border border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Institutional</h3>
                            <div className="mb-6"><span className="text-2xl font-black">Custom Licensing</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-sm text-slate-400">
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Principal Dashboard</li>
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Academy Branding</li>
                                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-500" /> Dedicated API Access</li>
                            </ul>
                            <button onClick={handleContactSupport} className="w-full py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                                <Icon name="chat" className="w-4 h-4" /> Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-20 px-6 border-t border-white/5 bg-[#080B14]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-xs">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center"><Icon name="benchmark" className="w-4 h-4" /></div>
                            <span className="font-bold">Benchmark AI</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">Built for hagwons and international prep schools.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-12 text-sm">
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px]">Legal (EN)</h4>
                            <ul className="space-y-3 text-slate-400">
                                <li><button onClick={() => openLegal('privacy')} className="hover:text-white transition">Privacy Policy</button></li>
                                <li><button onClick={() => openLegal('billing')} className="hover:text-white transition">Pricing & Billing</button></li>
                                <li><button onClick={() => openLegal('terms')} className="hover:text-white transition">Terms</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase tracking-widest text-[10px]">법률 안내 (KO)</h4>
                            <ul className="space-y-3 text-slate-400">
                                <li><button onClick={() => openLegal('privacy')} className="hover:text-white transition">개인정보처리방침</button></li>
                                <li><button onClick={() => openLegal('billing')} className="hover:text-white transition">결제 정책</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white text-slate-900 w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-400"><Icon name="close" className="w-6 h-6" /></button>
                        <h2 className="text-3xl font-black mb-8">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'signup' && <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" placeholder="Full Name" />}
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" placeholder="Email" />
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold" placeholder="Password" />
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">{authMode === 'login' ? 'Sign In' : 'Sign Up'}</button>
                        </form>
                    </div>
                </div>
            )}
            <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalTab} />
        </div>
    );
};
