
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icon } from '../common/Icon';
import { LegalModal } from '../common/LegalModal';

export const LoginScreen: React.FC = () => {
    const { login, signup, loginDemo, isLoading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'dpa' | 'billing'>('privacy');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [activeFeature, setActiveFeature] = useState(0);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [betaCode, setBetaCode] = useState('');

    const FEATURES = [
        {
            id: 0,
            title: t('feature_chat'),
            description: t('feature_chat_desc'),
            icon: "chat",
            ui: (
                <div className="w-full h-full flex flex-col justify-center gap-3 px-2">
                    <div className="self-end bg-indigo-500 text-white text-[10px] px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg max-w-[85%]">
                        How's the class doing in Phonics?
                    </div>
                    <div className="self-start bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 text-[10px] px-3 py-2 rounded-2xl rounded-tl-sm max-w-[90%]">
                        <span className="font-bold text-white">Insight:</span> Class average is up 8%. 3 students have mastered CVC words.
                    </div>
                </div>
            )
        },
        {
            id: 1,
            title: t('feature_tracking'),
            description: t('feature_tracking_desc'),
            icon: "analytics",
            ui: (
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[8px]">AK</div>
                            <div className="h-1.5 w-12 bg-white/20 rounded"></div>
                        </div>
                        <div className="text-emerald-400 text-[8px] font-bold">+12%</div>
                    </div>
                    <div className="h-16 w-full flex items-end gap-1 px-1">
                        {[40, 70, 55, 90, 65, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: t('feature_case'),
            description: t('feature_case_desc'),
            icon: "benchmark",
            ui: (
                <div className="w-full h-full p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="benchmark" className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Research Journal</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1 w-full bg-white/20 rounded"></div>
                        <div className="h-1 w-3/4 bg-white/10 rounded"></div>
                        <div className="h-1 w-full bg-white/10 rounded"></div>
                    </div>
                    <div className="mt-4 p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
                        <p className="text-[8px] text-indigo-200">"Trend identified: Significant correlation between Level 5 Reading and Writing velocity."</p>
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % FEATURES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [FEATURES.length]);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsLoginModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (authMode === 'login') success = await login(email, password);
        else success = await signup(name, email, password, betaCode);
        if (success) setIsLoginModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans overflow-x-hidden">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                            <Icon name="benchmark" className="w-6 h-6" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic">Benchmark AI</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {/* Language Toggle */}
                        <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/10 mr-4">
                            <button onClick={() => setLanguage('EN')} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'EN' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>EN</button>
                            <button onClick={() => setLanguage('KO')} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === 'KO' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>KO</button>
                        </div>
                        
                        <button onClick={() => openAuth('login')} className="text-xs font-black uppercase text-slate-400 hover:text-white transition">{t('nav_login')}</button>
                        <button onClick={() => openAuth('signup')} className="px-6 py-2.5 rounded-full bg-white text-slate-900 text-xs font-black uppercase hover:bg-indigo-50 transition active:scale-95 shadow-xl">{t('nav_join')}</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 md:pt-48 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                <div className="animate-in fade-in slide-in-from-left duration-1000">
                    <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter mb-8 italic leading-[0.95] md:leading-[0.9]">
                        {t('hero_title_1')} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            {t('hero_title_2')}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-xl font-medium leading-relaxed">
                        {t('hero_sub')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => openAuth('signup')} className="px-10 py-5 md:px-12 md:py-6 rounded-[2rem] bg-indigo-600 font-black uppercase text-xs tracking-widest hover:bg-indigo-500 shadow-2xl border-b-[8px] border-indigo-950 active:scale-95 active:border-b-0 transition-all">
                            {t('cta_start')}
                        </button>
                        <button onClick={loginDemo} className="px-10 py-5 md:px-12 md:py-6 rounded-[2rem] bg-white/5 border border-white/10 font-black uppercase text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                            <Icon name="brain" className="w-5 h-5 text-indigo-400" />
                            {t('cta_sandbox')}
                        </button>
                    </div>
                    
                    {/* Mobile Lang Toggle */}
                    <div className="mt-10 sm:hidden flex justify-center">
                         <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button onClick={() => setLanguage('EN')} className={`px-4 py-2 text-[10px] font-black rounded-lg ${language === 'EN' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>English</button>
                            <button onClick={() => setLanguage('KO')} className={`px-4 py-2 text-[10px] font-black rounded-lg ${language === 'KO' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>한국어</button>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full aspect-square bg-[#131825] rounded-[3rem] md:rounded-[4rem] border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right duration-1000">
                    <div className="flex items-center gap-4 mb-10 md:mb-12">
                        <div className="p-4 bg-indigo-600 rounded-3xl"><Icon name={FEATURES[activeFeature].icon} className="w-8 h-8" /></div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black italic">{FEATURES[activeFeature].title}</h3>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Module</p>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-[2.5rem] border border-white/5 h-56 md:h-64 mb-8 flex items-center justify-center p-6 md:p-8 transition-all duration-500">
                        {FEATURES[activeFeature].ui}
                    </div>
                    <p className="text-slate-400 font-medium italic text-sm md:text-base">"{FEATURES[activeFeature].description}"</p>
                </div>
            </section>

            {/* Modals */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-white text-slate-900 w-full max-w-md p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-slate-100">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><Icon name="close" className="w-6 h-6" /></button>
                        <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tighter italic">
                            {authMode === 'login' ? t('auth_login_title') : t('auth_signup_title')}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                            {authMode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">{t('field_name')}</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="Full Name" />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">{t('field_email')}</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="name@school.edu" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">{t('field_pass')}</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="••••••••" />
                            </div>
                            {authMode === 'signup' && (
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-indigo-500 ml-1">{t('field_beta')}</label>
                                    <input type="text" value={betaCode} onChange={e => setBetaCode(e.target.value)} className="w-full px-6 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl focus:border-indigo-600 outline-none font-bold placeholder:text-indigo-200" placeholder="BENCHMARK40" />
                                </div>
                            )}
                            <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all border-b-8 border-slate-950 active:scale-95 active:border-b-0">
                                {isLoading ? 'Syncing...' : (authMode === 'login' ? t('btn_auth') : t('btn_init'))}
                            </button>
                        </form>
                        <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-8 w-full text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline text-center">
                            {authMode === 'login' ? t('link_request') : t('link_existing')}
                        </button>
                    </div>
                </div>
            )}
            <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalTab} />
        </div>
    );
};
