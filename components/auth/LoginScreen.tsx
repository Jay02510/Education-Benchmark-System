
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
        title: "Real-Time Tracking",
        description: "Monitor student growth across 8 domains with live dashboards.",
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
        title: "Pedagogical Case Studies",
        description: "Generate deep-dive research reports for institutional review.",
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
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsLoginModalOpen(true);
    };

    const handleContactSupport = () => {
        window.location.href = `mailto:jsn.benjamin@gmail.com?subject=Benchmark Institutional Inquiry&body=I am interested in the school-wide licensing options.`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (authMode === 'login') success = await login(email, password);
        else success = await signup(name, email, password);
        if (success) setIsLoginModalOpen(false);
    };

    const handleNav = (view: 'home' | 'pricing') => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white">
            {/*  NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                            <Icon name="benchmark" className="w-6 h-6" />
                        </div>
                        <span className="font-black text-xl tracking-tighter italic">Benchmark AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <button onClick={() => handleNav('home')} className={currentView === 'home' ? 'text-white' : 'hover:text-white transition'}>Product</button>
                        <button onClick={() => handleNav('pricing')} className={currentView === 'pricing' ? 'text-white' : 'hover:text-white transition'}>Pricing</button>
                        <button onClick={() => window.open('https://github.com', '_blank')} className="hover:text-white transition">Documentation</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 mr-4">
                             <button onClick={() => setLandingLang('EN')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'EN' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>EN</button>
                             <button onClick={() => setLandingLang('KO')} className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all ${landingLang === 'KO' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>KO</button>
                        </div>
                        <button onClick={() => openAuth('login')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Log In</button>
                        <button onClick={() => openAuth('signup')} className="px-6 py-2.5 rounded-full bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition active:scale-95 shadow-xl">Join Free</button>
                    </div>
                </div>
            </nav>

            {currentView === 'home' ? (
                <>
                    {/* HERO SECTION */}
                    <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="animate-in slide-in-from-left duration-1000">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-full mb-8">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Institutional OS v8.2</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic">
                                {landingLang === 'EN' ? <>Teach with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence.</span></> : 
                                <>교수를 더 <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">스마트하게.</span></>}
                            </h1>
                            <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
                                {landingLang === 'EN' ? "Transform raw assessment data into growth velocity, instructional pods, and high-impact reports for parents and directors." : 
                                "평가 데이터를 성장 속도, 교육용 그룹, 학부모 및 관리자를 위한 고영향력 리포트로 전환합니다."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => openAuth('signup')} className="px-12 py-6 rounded-[2rem] bg-indigo-600 font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40 border-b-[8px] border-indigo-950 active:scale-95 active:border-b-0">Initialize Free Trial</button>
                                <button onClick={loginDemo} className="px-12 py-6 rounded-[2rem] bg-white/5 border border-white/10 font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                    <Icon name="brain" className="w-5 h-5 text-indigo-400" />
                                    Launch Sandbox
                                </button>
                            </div>
                        </div>

                        <div className="relative group perspective-1000">
                            <div className="relative z-10 w-full aspect-square bg-[#131825] rounded-[4rem] border border-white/10 p-12 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px]"></div>
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl"><Icon name={FEATURES[activeFeature].icon} className="w-8 h-8" /></div>
                                    <div>
                                        <h3 className="text-2xl font-black italic">{FEATURES[activeFeature].title}</h3>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Module</p>
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-[2.5rem] border border-white/5 h-64 mb-8 flex items-center justify-center relative">
                                    <div className="absolute inset-0 p-8 flex items-center justify-center">{FEATURES[activeFeature].ui}</div>
                                </div>
                                <p className="text-slate-400 font-medium leading-relaxed italic">"{FEATURES[activeFeature].description}"</p>
                            </div>
                            {/* Visual Decor */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full"></div>
                        </div>
                    </section>

                    {/* TRUST & COMPLIANCE */}
                    <section className="py-24 bg-white/5 border-y border-white/5 px-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                            <div className="text-center">
                                <p className="text-3xl font-black mb-1">CEFR</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Standards</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black mb-1">PIPA/GDPR</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data Compliance</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black mb-1">AES-256</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Military Encryption</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black mb-1">100k+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Insights Generated</p>
                            </div>
                        </div>
                    </section>

                    {/* HOW IT WORKS */}
                    <section className="py-32 px-6 max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Protocol Deployment.</h2>
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">From implementation to intelligence in 15 minutes.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { t: "Architect", d: "Define your class identity and academic silos (Reading, Writing, Phonics).", i: "admin" },
                                { t: "Sync", d: "Input scores via AI Vision Scanning or bulk entry. No spreadsheets required.", i: "analytics" },
                                { t: "Synthesize", d: "AI generates longitudinal velocity charts and intervention pods automatically.", i: "brain" }
                            ].map((step, idx) => (
                                <div key={idx} className="p-10 bg-[#131825] rounded-[3rem] border border-white/10 hover:border-indigo-500/50 transition-all group">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                                        <Icon name={step.i} className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 italic">0{idx + 1}. {step.t}</h4>
                                    <p className="text-slate-400 font-medium leading-relaxed">{step.d}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                /* PRICING VIEW */
                <div className="pt-48 pb-32 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-6xl font-black tracking-tighter mb-4 italic">{landingLang === 'EN' ? "Pricing Architecture" : "요금 체계"}</h2>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">{landingLang === 'EN' ? "Flexible licensing for teachers and institutional scale." : "교사와 교육기관을 위한 유연한 라이선싱 솔루션."}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {/* STARTER */}
                        <div className="p-10 rounded-[3.5rem] bg-[#131825] border border-white/10 flex flex-col hover:border-white/20 transition-all">
                            <h3 className="text-2xl font-black italic mb-2">Starter</h3>
                            <div className="mb-10 flex items-baseline gap-1">
                                <span className="text-6xl font-black tracking-tighter">$0</span>
                                <span className="text-slate-500 font-bold">/mo</span>
                            </div>
                            <ul className="space-y-6 mb-12 flex-1 text-sm font-bold text-slate-400">
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> Up to 25 Students</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> Basic Dashboards</li>
                                <li className="flex gap-4 opacity-30"><Icon name="close" className="w-5 h-5 shrink-0" /> No PDF Reports</li>
                            </ul>
                            <button onClick={() => openAuth('signup')} className="w-full py-5 rounded-2xl border-2 border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-all">Initialize Stack</button>
                        </div>

                        {/* PRO */}
                        <div className="p-12 rounded-[4rem] bg-indigo-600 shadow-2xl relative transform md:-translate-y-6 flex flex-col scale-105 border-b-[12px] border-indigo-900">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-indigo-900 px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.3em] shadow-xl">Educator Favorite</div>
                            <h3 className="text-2xl font-black italic mb-2 text-white">Educator Pro</h3>
                            <div className="mb-10 text-white flex items-baseline gap-1">
                                <span className="text-6xl font-black tracking-tighter">$15</span>
                                <span className="text-indigo-200 font-bold">/mo</span>
                            </div>
                            <ul className="space-y-6 mb-12 flex-1 text-sm font-bold text-indigo-100">
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-white shrink-0" /> Unlimited Students</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-white shrink-0" /> <b>AI Vision Scoring (OCR)</b></li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-white shrink-0" /> PDF Multilingual Exports</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-white shrink-0" /> 24/7 AI Co-pilot Support</li>
                            </ul>
                            <button onClick={() => openAuth('signup')} className="w-full py-6 bg-white text-indigo-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Upgrade Protocol</button>
                        </div>

                        {/* INSTITUTIONAL */}
                        <div className="p-10 rounded-[3.5rem] bg-[#131825] border border-white/10 flex flex-col hover:border-white/20 transition-all">
                            <h3 className="text-2xl font-black italic mb-2">Institutional</h3>
                            <div className="mb-10"><span className="text-3xl font-black tracking-tighter">School License</span></div>
                            <ul className="space-y-6 mb-12 flex-1 text-sm font-bold text-slate-400">
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> Principal Dashboard</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> White-label Academy Branding</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> Dedicated API Access</li>
                                <li className="flex gap-4"><Icon name="check" className="w-5 h-5 text-indigo-500 shrink-0" /> Executive Research Briefings</li>
                            </ul>
                            <button onClick={handleContactSupport} className="w-full py-5 rounded-2xl bg-indigo-600/10 border-2 border-indigo-500/30 text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3">
                                <Icon name="chat" className="w-4 h-4" /> Contact Technical Sales
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="py-32 px-6 border-t border-white/5 bg-[#080B14]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="md:col-span-2 max-w-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center"><Icon name="benchmark" className="w-4 h-4" /></div>
                            <span className="font-black italic">Benchmark AI Platform</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">The definitive pedagogical operating system for hagwons and international prep schools. Powered by Gemini AI Intelligence.</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Legal Infrastructure</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-bold">
                            <li><button onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }} className="hover:text-white transition">Privacy Protocol</button></li>
                            <li><button onClick={() => { setLegalTab('billing'); setIsLegalModalOpen(true); }} className="hover:text-white transition">Billing & Refund Policy</button></li>
                            <li><button onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }} className="hover:text-white transition">Terms of Service</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Network Status</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-sm font-bold text-slate-400">All Nodes Operational</span>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Benchmark AI Research Group. All Rights Reserved.
                </div>
            </footer>

            {/* AUTH MODAL */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white text-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-100">
                        <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition p-2"><Icon name="close" className="w-6 h-6" /></button>
                        <h2 className="text-4xl font-black mb-8 tracking-tighter italic">{authMode === 'login' ? 'System Login' : 'Create Identity'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {authMode === 'signup' && <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">Official Name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="Full Name" /></div>}
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="name@school.edu" /></div>
                            <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-1">Security Key</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 outline-none font-bold" placeholder="••••••••" /></div>
                            <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all mt-4 border-b-8 border-slate-950 active:scale-95 active:border-b-0 shadow-2xl">{isLoading ? 'Initializing Node...' : (authMode === 'login' ? 'Authenticate' : 'Establish Protocol')}</button>
                        </form>
                        <div className="mt-8 text-center">
                            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">{authMode === 'login' ? 'Request New Instance' : 'Already Synced? Login'}</button>
                        </div>
                    </div>
                </div>
            )}
            <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} initialTab={legalTab} />
        </div>
    );
};
