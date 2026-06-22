import React, { useState } from 'react';
import { StudentsTab } from './tabs/StudentsTab.tsx';
import { InsightsTab } from './tabs/InsightsTab.tsx';
import { LibraryTab } from './tabs/LibraryTab.tsx';
import { SystemTab } from './tabs/SystemTab.tsx';
import { TABS } from './constants.ts';
import { Icon } from './components/common/Icon.tsx';
import { StudentProvider, useStudents } from './context/StudentContext.tsx';
import { ResourceProvider } from './context/ResourceContext.tsx';
import { BenchmarkProvider } from './context/BenchmarkContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard.tsx';
import { LoginScreen } from './components/auth/LoginScreen.tsx';
import { PlatformGuideModal } from './components/common/PlatformGuideModal.tsx';
import { BulkAssessmentModal } from './components/students/BulkAssessmentModal.tsx';
import { CommandCenter } from './components/common/CommandCenter.tsx';
import { ChatWidget } from './components/chat/ChatWidget.tsx';
import { ChatProvider } from './context/ChatContext.tsx';
import { FeedbackModal } from './components/common/FeedbackModal.tsx';
import { LegalModal } from './components/common/LegalModal.tsx';

type TabName = typeof TABS[keyof typeof TABS];

// --- DESKTOP NAV ITEM (RE-STYLED COMPONENT) ---
const NavItem: React.FC<{
    label: TabName;
    isCollapsed: boolean;
    isActive: boolean;
    iconName: string;
    onClick: () => void;
}> = ({ label, iconName, isActive, isCollapsed, onClick }) => (
    <li role="listitem">
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            aria-current={isActive ? "page" : undefined}
            className={`group flex items-center w-full py-3 h-10 transition-all duration-300 focus-visible:outline-none focus:outline-none rounded-none shadow-none ${
                isActive
                    ? 'bg-zinc-900/40 border-l-[2px] border-[oklch(0.72_0.18_145)] text-white font-medium'
                    : 'text-zinc-400 border-l-[2px] border-transparent hover:bg-zinc-900/50 hover:text-white font-normal'
            } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
        >
            <div className="flex items-center justify-center shrink-0 w-5 h-5">
                <Icon 
                    name={iconName} 
                    className={`w-4 h-4 transition-colors ${isActive ? 'text-[oklch(0.72_0.18_145)]' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                />
            </div>
            <span className={`text-[14px] font-normal tracking-tight ml-3 transition-all duration-300 origin-left truncate ${isCollapsed ? 'w-0 opacity-0 scale-x-0 hidden' : 'w-auto opacity-100 scale-x-100'}`}>
                {label}
            </span>
        </button>
    </li>
);

// --- MAIN LAYOUT SHELL ---
const MainAppLayout: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const { language } = useLanguage();
    const { activeTab, setActiveTab, isBulkEntryOpen, setBulkEntryOpen } = useNavigation();
    const { classProfile } = useStudents();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);

    const handleTabChange = (tab: TabName) => {
        setActiveTab(tab);
    };

    const renderTab = () => {
        switch (activeTab) {
            case TABS.STUDENTS: return <StudentsTab />;
            case TABS.INSIGHTS: return <InsightsTab />;
            case TABS.LIBRARY: return <LibraryTab />;
            case TABS.SYSTEM: return <SystemTab />;
            default: return <StudentsTab />;
        }
    };
    
    // REDESIGNED LOADING STATE WITH A SUBTLE FADE-IN WORDMARK (PREMIUM VS AI CLICHÉ)
    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[oklch(0.10_0.01_250)] font-sans select-none animate-fadeIn">
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes fadeIn {
                        0% { opacity: 0; transform: scale(0.98); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.30, 1) forwards;
                    }
                    @keyframes shimmerLine {
                        0% { left: -50%; }
                        100% { left: 100%; }
                    }
                    .animate-shimmer-line {
                        animation: shimmerLine 1.5s infinite ease-in-out;
                    }
                `}} />
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold">
                            <Icon name="benchmark" className="w-5 h-5 text-zinc-950" strokeWidth={3} />
                        </div>
                        <span className="text-base font-semibold text-white tracking-tight">Benchmark AI</span>
                    </div>
                    <div className="w-24 h-[1px] bg-zinc-900 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-[oklch(0.72_0.18_145)] rounded-full animate-shimmer-line w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!user) return <LoginScreen />;

    return (
        <div className="flex flex-col h-screen clean-bg font-sans overflow-hidden text-zinc-100 print:h-auto print:overflow-visible">
            
            {/* INJECT DESIGN SYSTEM VARIABLES AND DENSE STYLING DECLARATIONS */}
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
                
                @media (max-width: 480px) {
                    .mobile-label {
                        display: none !important;
                    }
                }
            `}} />

            {/* 💡 PERSISTENT INDUSTRIAL DEMO BAR */}
            {user?.isDemo && (
                <div className="bg-indigo-950 border-b border-indigo-500/20 text-indigo-200 px-4 py-2.5 text-center text-[12px] tracking-normal font-normal relative z-[1000] flex items-center justify-center gap-4 flex-wrap select-none font-sans">
                    <span className="select-none">
                        {language === 'EN' 
                          ? 'Demo active. Changes are temporary. Create a permanent account to save students.' 
                          : '인터랙티브 데모 활성화 상태입니다. 입력 정보는 임시 유지되며 계정 생성 시 데이터가 저장됩니다.'}
                    </span>
                    <button 
                        onClick={logout} 
                        className="px-3 py-1 bg-indigo-600 text-white rounded-[4px] hover:bg-indigo-500 transition active:scale-95 text-[11px] font-medium focus-visible:outline-none focus:outline-none"
                    >
                        {language === 'EN' ? 'Create account' : '계정 등록'}
                    </button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {(!classProfile && !user?.isDemo) && <OnboardingWizard />}
                <CommandCenter />
                <ChatWidget />

                {/* REDESIGNED MAIN SIDEBAR PANEL (0PX RADIUS, SYSTEM DIVIDERS, COLLAPSIBLE COHESIVE SYSTEM) */}
                <aside 
                    aria-label="Main navigation"
                    className={`
                    hidden lg:flex flex-col clean-surface border-r border-[oklch(0.60_0_0_/_0.15)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.32,1)]
                    ${isSidebarCollapsed ? 'w-16 py-6 items-center' : 'w-[240px] py-6'}
                    print:hidden rounded-none select-none
                `}>
                    
                    {/* Brand wordmark logo */}
                    <div className={`flex items-center gap-2.5 mb-8 mt-2 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-5'}`}>
                        <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold">
                            <Icon name="benchmark" className="w-5 h-5 text-zinc-950" strokeWidth={3} />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            <h1 className="text-base font-semibold text-white tracking-tight leading-none">Benchmark AI</h1>
                        </div>
                    </div>
                    
                    {/* Static simple navigation lists */}
                    <nav className="flex-1 space-y-1">
                        <ul role="list" className="space-y-1">
                            <NavItem label={TABS.STUDENTS} iconName="students" isActive={activeTab === TABS.STUDENTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.STUDENTS)} />
                            <NavItem label={TABS.INSIGHTS} iconName="analytics" isActive={activeTab === TABS.INSIGHTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.INSIGHTS)} />
                            <NavItem label={TABS.LIBRARY} iconName="library" isActive={activeTab === TABS.LIBRARY} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.LIBRARY)} />
                            <NavItem label={TABS.SYSTEM} iconName="settings" isActive={activeTab === TABS.SYSTEM} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.SYSTEM)} />
                        </ul>
                    </nav>

                    {/* Support items split by low opacity dividers */}
                    <div className={`pt-4 border-t border-[oklch(0.60_0_0_/_0.15)] space-y-1 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                        <button 
                            onClick={() => setIsFeedbackOpen(true)}
                            className={`flex items-center w-full py-2.5 transition-colors text-zinc-400 hover:text-white hover:bg-zinc-900/50 ${isSidebarCollapsed ? 'justify-center w-10 h-10 rounded-[4px]' : 'px-5 rounded-none'}`}
                            title="Feedback"
                        >
                            <Icon name="chat" className="w-4 h-4 shrink-0" />
                            {!isSidebarCollapsed && <span className="text-[14px] font-normal ml-3">Feedback</span>}
                        </button>

                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            className={`flex items-center w-full py-2.5 transition-colors text-zinc-400 hover:text-white hover:bg-zinc-900/50 ${isSidebarCollapsed ? 'justify-center w-10 h-10 rounded-[4px]' : 'px-5 rounded-none'}`}
                            title="Platform Guide"
                        >
                            <Icon name="help" className="w-4 h-4 shrink-0" />
                            {!isSidebarCollapsed && <span className="text-[14px] font-normal ml-3">Platform Guide</span>}
                        </button>

                        {/* Zero background collapsible sidebar chevron trigger */}
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-[4px] text-zinc-500 hover:text-white transition-colors focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.18_145)] mt-3 ${isSidebarCollapsed ? '' : 'mx-5'}`}
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Icon name={isSidebarCollapsed ? "arrowRight" : "chevronLeft"} className="w-4 h-4" />
                        </button>

                        {/* Initials in accent-dim circle user avatar */}
                        <div className={`flex items-center gap-3 pt-3 mt-2 border-t border-[oklch(0.60_0_0_/_0.15)] transition-colors cursor-pointer group ${isSidebarCollapsed ? 'justify-center' : 'px-5'}`}>
                            <div className="w-8 h-8 shrink-0 rounded-full bg-[oklch(0.20_0.06_145)] flex items-center justify-center text-[oklch(0.72_0.18_145)] font-semibold text-xs border border-[oklch(0.72_0.18_145)/0.2]">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className={`flex-1 overflow-hidden transition-all duration-300 text-left ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
                                <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
                            </div>
                            {!isSidebarCollapsed && (
                                 <button onClick={logout} className="text-zinc-500 hover:text-red-400 transition p-1 rounded-[4px] hover:bg-zinc-900 focus-visible:outline-none focus:outline-none" title="Log out">
                                     <Icon name="logout" className="w-4 h-4" />
                                 </button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* --- MAIN PAGE WORKSPACE (ALT REMOVING SIDE DRAWER ON MOBILE TO PORT BOTTOM NAV) --- */}
                <main 
                    aria-label={`${activeTab} Content`}
                    className="flex-1 relative flex flex-col w-full overflow-hidden print:overflow-visible print:h-auto print:w-full bg-transparent"
                >
                     {/* Elegant minimal top banner on mobile */}
                     <div className="lg:hidden bg-[oklch(0.14_0.01_250)] border-b border-[oklch(0.60_0_0_/_0.15)] p-4 flex items-center justify-between z-20 print:hidden select-none">
                         <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-[4px] bg-[oklch(0.72_0.18_145)] flex items-center justify-center text-zinc-950 font-bold text-xs">
                                 B
                             </div>
                             <span className="font-semibold text-white tracking-tight uppercase text-xs">BENCHMARK AI</span>
                         </div>
                         <span className="font-mono text-[11px] clean-text-accent font-medium lowercase">
                             {activeTab} active
                         </span>
                     </div>

                     {/* Main dynamic Tab wrapper (providing sufficient bottom padding on mobile screens) */}
                     <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent print:overflow-visible print:h-auto pb-20 lg:pb-0">
                        {renderTab()}
                     </div>
                     
                     <BulkAssessmentModal isOpen={isBulkEntryOpen} onClose={() => setBulkEntryOpen(false)} />
                     <PlatformGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
                     <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                     <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
                </main>
            </div>

            {/* --- MOBILE BOTTOM NAVIGATION TAB BAR (REPLACES HAMBURGER DRAWER DRAWINGS) --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[oklch(0.14_0.01_250)] border-t border-[oklch(0.60_0_0_/_0.15)] flex justify-between items-stretch h-16 px-2 print:hidden select-none">
                {[
                    { tab: TABS.STUDENTS, icon: "students", label: language === 'EN' ? "Students" : "학생 관리" },
                    { tab: TABS.INSIGHTS, icon: "analytics", label: language === 'EN' ? "Insights" : "통계 분석" },
                    { tab: TABS.LIBRARY, icon: "library", label: language === 'EN' ? "Library" : "교재 은행" },
                    { tab: TABS.SYSTEM, icon: "settings", label: language === 'EN' ? "System" : "시스템" }
                ].map(({ tab, icon, label }) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className="flex-1 flex flex-col items-center justify-center gap-1.5 relative focus:outline-none"
                        >
                            <Icon 
                                name={icon} 
                                className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[oklch(0.72_0.18_145)]' : 'text-zinc-500'}`} 
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {/* Hidden below 480px, visible above */}
                            <span 
                                className={`text-[11px] font-medium transition-colors mobile-label ${isActive ? 'text-white font-medium' : 'text-zinc-500'}`}
                            >
                                {label}
                            </span>
                            {/* Underline accent state decoration */}
                            {isActive && (
                                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[oklch(0.72_0.18_145)] rounded-t-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>

        </div>
    );
};

// --- AUTH AND CONTEXT PROPAGATORS ---
const App: React.FC = () => {
    return (
        <LanguageProvider>
            <ToastProvider>
                <AuthProvider>
                    <BenchmarkProvider>
                        <StudentProvider>
                            <ResourceProvider>
                                <NavigationProvider>
                                    <ChatProvider>
                                        <MainAppLayout />
                                    </ChatProvider>
                                </NavigationProvider>
                            </ResourceProvider>
                        </StudentProvider>
                    </BenchmarkProvider>
                </AuthProvider>
            </ToastProvider>
        </LanguageProvider>
    );
};

export default App;
