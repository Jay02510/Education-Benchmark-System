
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
import { OnboardingWizard } from './components/onboarding/OnboardingWizard.tsx';
import { LoginScreen } from './components/auth/LoginScreen.tsx';
import { PlatformGuideModal } from './components/common/PlatformGuideModal.tsx';
import { BulkAssessmentModal } from './components/students/BulkAssessmentModal.tsx';
import { CommandCenter } from './components/common/CommandCenter.tsx';
import { ChatWidget } from './components/chat/ChatWidget.tsx';
import { ChatProvider } from './context/ChatContext.tsx';
import { FeedbackModal } from './components/common/FeedbackModal.tsx';

type TabName = typeof TABS[keyof typeof TABS];

const NavItem: React.FC<{
    label: TabName;
    iconName: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ label, iconName, isActive, isCollapsed, onClick }) => (
    <li>
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            className={`group flex items-center w-full py-3 px-3 mx-auto rounded-2xl transition-all duration-300 ${
                isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 font-black'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-bold'
            } ${isCollapsed ? 'justify-center w-12 h-12 px-0' : ''}`}
        >
            <div className={`flex items-center justify-center shrink-0 w-8 h-8`}>
                <Icon name={iconName} className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-600'}`} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={`text-xs uppercase tracking-widest ml-3 transition-all duration-300 origin-left ${isCollapsed ? 'w-0 opacity-0 scale-x-0 hidden' : 'w-auto opacity-100 scale-x-100'}`}>
                {label}
            </span>
        </button>
    </li>
);

const MainAppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { activeTab, setActiveTab, isBulkEntryOpen, setBulkEntryOpen } = useNavigation();
    const { classProfile } = useStudents();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
    
    if (!user) return <LoginScreen />;

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800 print:h-auto print:overflow-visible">
            <div className="flex flex-1 overflow-hidden relative">
                {(!classProfile && !user?.isDemo) && <OnboardingWizard />}
                <CommandCenter />
                <ChatWidget />

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-[100] lg:hidden backdrop-blur-sm transition-opacity print:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                )}

                <aside className={`
                    fixed inset-y-0 left-0 z-40 bg-white flex flex-col shadow-[1px_0_40px_rgba(0,0,0,0.02)] border-r border-slate-100 transition-all duration-500 ease-out
                    ${isSidebarCollapsed ? 'w-24 px-4' : 'w-72 p-6'}
                    lg:static print:hidden
                    ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className={`flex items-center gap-3 mb-12 mt-4 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                            <Icon name="benchmark" className="w-6 h-6 text-indigo-400" strokeWidth={3} />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Benchmark</h1>
                        </div>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-12">
                        <div>
                            {!isSidebarCollapsed && <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Command</p>}
                            <ul className="space-y-2">
                                <NavItem label={TABS.STUDENTS} iconName="students" isActive={activeTab === TABS.STUDENTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.STUDENTS)} />
                                <NavItem label={TABS.INSIGHTS} iconName="analytics" isActive={activeTab === TABS.INSIGHTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.INSIGHTS)} />
                                <NavItem label={TABS.LIBRARY} iconName="library" isActive={activeTab === TABS.LIBRARY} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.LIBRARY)} />
                                <NavItem label={TABS.SYSTEM} iconName="settings" isActive={activeTab === TABS.SYSTEM} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.SYSTEM)} />
                            </ul>
                        </div>
                    </nav>

                    <div className={`pt-6 border-t border-slate-50 ${isSidebarCollapsed ? 'flex flex-col items-center gap-6' : 'px-2'}`}>
                        {/* Feedback Trigger */}
                        <button 
                            onClick={() => setIsFeedbackOpen(true)}
                            className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-4 ${isSidebarCollapsed ? 'justify-center px-0 w-12' : ''}`}
                            title="Feedback"
                        >
                            <Icon name="chat" className="w-5 h-5" />
                            {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>}
                        </button>

                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`hidden lg:flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-colors mb-6 ${isSidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 gap-2'}`}
                        >
                            <Icon name={isSidebarCollapsed ? "arrowRight" : "chevronLeft"} className="w-5 h-5" />
                        </button>

                        <div className={`flex items-center gap-4 p-2 rounded-[1.5rem] transition-colors cursor-pointer group ${isSidebarCollapsed ? 'justify-center p-0' : 'hover:bg-slate-50'}`}>
                            <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm shadow-inner border border-indigo-100">
                                {user?.name.charAt(0)}
                            </div>
                            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-xs font-black text-slate-800 truncate uppercase tracking-widest">{user?.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{user?.role}</p>
                            </div>
                             {!isSidebarCollapsed && (
                                 <button onClick={logout} className="text-slate-300 hover:text-rose-500 transition p-2">
                                     <Icon name="logout" className="w-5 h-5" />
                                 </button>
                             )}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative flex flex-col w-full overflow-hidden print:overflow-visible print:h-auto print:w-full bg-[#F8FAFC]">
                     <div className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between z-20 print:hidden">
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
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
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
    );
};

export default App;
