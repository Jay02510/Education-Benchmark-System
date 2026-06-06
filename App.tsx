
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

const NavItem: React.FC<{
    label: TabName;
    iconName: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ label, iconName, isActive, isCollapsed, onClick }) => (
    <li role="listitem">
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            aria-current={isActive ? "page" : undefined}
            className={`group flex items-center w-full py-3 px-3 mx-auto rounded-xl transition-all duration-300 focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isActive
                    ? 'bg-slate-900 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
            } ${isCollapsed ? 'justify-center w-12 h-12 px-0' : ''}`}
        >
            <div className={`flex items-center justify-center shrink-0 w-8 h-8`}>
                <Icon name={iconName} className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-800'}`} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={`text-xs uppercase tracking-widest ml-3 transition-all duration-300 origin-left ${isCollapsed ? 'w-0 opacity-0 scale-x-0 hidden' : 'w-auto opacity-100 scale-x-100'}`}>
                {label}
            </span>
        </button>
    </li>
);

const MainAppLayout: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const { language } = useLanguage();
    const { activeTab, setActiveTab, isBulkEntryOpen, setBulkEntryOpen } = useNavigation();
    const { classProfile } = useStudents();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);

    const handleTabChange = (tab: TabName) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); 
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
    
    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F19]">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce mb-6">
                    <Icon name="benchmark" className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
                <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading School Data...</p>
            </div>
        );
    }
    
    if (!user) return <LoginScreen />;

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800 print:h-auto print:overflow-visible">
            {/* 💡 PERSISTENT DEMO BAR */}
            {user?.isDemo && (
                <div className="bg-amber-50/90 border-b border-amber-200 text-amber-900 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest relative z-[1000] flex items-center justify-center gap-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Icon name="brain" className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span className="font-black">{language === 'EN' ? 'Interactive Demo Mode Active' : '인터랙티브 데모 모드 활성'}</span>
                    </div>
                    <span className="hidden md:inline text-amber-300">|</span>
                    <span className="hidden md:inline font-semibold normal-case tracking-normal text-amber-800 text-[11px]">
                        {language === 'EN' ? 'Changes are not saved. Create an account to manage your own students.' : '변경사항은 저장되지 않습니다. 학생 관리를 시작하려면 계정을 만드세요.'}
                    </span>
                    <button onClick={logout} className="px-4 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm active:scale-95 text-[10px] font-bold tracking-normal uppercase focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        {language === 'EN' ? 'Create Account' : '계정 생성'}
                    </button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {(!classProfile && !user?.isDemo) && <OnboardingWizard />}
                <CommandCenter />
                <ChatWidget />

                {isMobileMenuOpen && (
                    <div 
                        aria-hidden="true"
                        role="presentation"
                        className="fixed inset-0 bg-slate-900/60 z-[100] lg:hidden backdrop-blur-sm transition-opacity print:hidden" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                    />
                )}

                <aside 
                    aria-label="Main navigation"
                    className={`
                    fixed inset-y-0 left-0 z-40 bg-white/75 backdrop-blur-2xl flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.015)] border-r border-slate-200/50 transition-all duration-500 ease-out
                    ${isSidebarCollapsed ? 'w-24 px-4' : 'w-72 p-6'}
                    lg:static print:hidden
                    ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className={`flex items-center gap-3 mb-12 mt-4 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-slate-950 flex items-center justify-center shadow-xl shadow-indigo-500/10">
                            <Icon name="benchmark" className="w-6 h-6 text-indigo-400" strokeWidth={3} />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Benchmark</h1>
                        </div>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-12">
                        <div>
                            {!isSidebarCollapsed && <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Command</p>}
                            <ul role="list" className="space-y-1">
                                <NavItem label={TABS.STUDENTS} iconName="students" isActive={activeTab === TABS.STUDENTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.STUDENTS)} />
                                <NavItem label={TABS.INSIGHTS} iconName="analytics" isActive={activeTab === TABS.INSIGHTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.INSIGHTS)} />
                                <NavItem label={TABS.LIBRARY} iconName="library" isActive={activeTab === TABS.LIBRARY} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.LIBRARY)} />
                                <NavItem label={TABS.SYSTEM} iconName="settings" isActive={activeTab === TABS.SYSTEM} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.SYSTEM)} />
                            </ul>
                        </div>
                    </nav>

                    <div className={`pt-6 border-t border-slate-100 ${isSidebarCollapsed ? 'flex flex-col items-center gap-6' : 'px-2'}`}>
                        <button 
                            onClick={() => setIsFeedbackOpen(true)}
                            className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-600 focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:text-indigo-600 hover:bg-slate-100/50 transition-all mb-4 ${isSidebarCollapsed ? 'justify-center px-0 w-12' : ''}`}
                            title="Feedback"
                        >
                            <Icon name="chat" className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>}
                        </button>

                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-600 focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 hover:text-indigo-600 hover:bg-slate-100/50 transition-all mb-4 ${isSidebarCollapsed ? 'justify-center px-0 w-12' : ''}`}
                            title="Platform Guide"
                        >
                            <Icon name="help" className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Platform Guide</span>}
                        </button>

                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`hidden lg:flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-colors focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 mb-6 ${isSidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 gap-2'}`}
                        >
                            <Icon name={isSidebarCollapsed ? "arrowRight" : "chevronLeft"} className="w-5 h-5" />
                        </button>

                        <div className={`flex items-center gap-4 p-2 rounded-[1.5rem] transition-colors cursor-pointer group ${isSidebarCollapsed ? 'justify-center p-0' : 'hover:bg-slate-100/50'}`}>
                            <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm shadow-inner border border-indigo-100">
                                {user?.name.charAt(0)}
                            </div>
                            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-xs font-black text-slate-800 truncate uppercase tracking-widest">{user?.name}</p>
                                <p className="text-[9px] font-bold text-slate-600 uppercase">{user?.role}</p>
                            </div>
                             {!isSidebarCollapsed && (
                                 <button onClick={logout} className="text-slate-400 hover:text-rose-500 transition p-2 rounded-lg focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                                     <Icon name="logout" className="w-5 h-5" />
                                 </button>
                             )}
                        </div>
                    </div>
                </aside>

                <main 
                    aria-label={`${activeTab} Content`}
                    className="flex-1 relative flex flex-col w-full overflow-hidden print:overflow-visible print:h-auto print:w-full bg-transparent"
                >
                     <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-20 print:hidden">
                         <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-900 p-2 -ml-2 rounded-xl bg-slate-50 transition flex items-center gap-2">
                             <Icon name="menu" className="w-6 h-6" /> 
                         </button>
                         <span className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">{activeTab}</span>
                         <div className="w-10 h-10"></div>
                     </div>

                     <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent print:overflow-visible print:h-auto">
                        {renderTab()}
                     </div>
                     <BulkAssessmentModal isOpen={isBulkEntryOpen} onClose={() => setBulkEntryOpen(false)} />
                     <PlatformGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
                     <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
                     <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
                </main>
            </div>
        </div>
    );
};

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
