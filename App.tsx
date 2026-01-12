
import React, { useState, useEffect } from 'react';
import { StudentsTab } from './tabs/StudentsTab';
import { BenchmarkFrameworkTab } from './tabs/BenchmarkFrameworkTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { AdminPanel } from './tabs/AdminPanel';
import { TABS } from './constants';
import { Icon } from './components/common/Icon';
import { StudentProvider, useStudents } from './context/StudentContext';
import { ResourceProvider } from './context/ResourceContext';
import { BenchmarkProvider } from './context/BenchmarkContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ChatProvider } from './context/ChatContext';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { LoginScreen } from './components/auth/LoginScreen';
import { ChatWidget } from './components/chat/ChatWidget';

type TabName = typeof TABS[keyof typeof TABS];

const NavItem: React.FC<{
    label: TabName;
    iconName: string;
    isActive: boolean;
    isCollapsed: boolean;
    isDisabled?: boolean;
    onClick: () => void;
}> = ({ label, iconName, isActive, isCollapsed, isDisabled, onClick }) => (
    <li>
        <button
            onClick={isDisabled ? undefined : onClick}
            title={isCollapsed ? label : ''}
            className={`group flex items-center w-full py-3 px-3 mx-auto rounded-xl transition-all duration-200 ease-out ${
                isDisabled ? 'opacity-40 cursor-not-allowed filter grayscale' :
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 font-medium'
            } ${isCollapsed ? 'justify-center w-10 h-10 px-0' : ''}`}
        >
            <div className={`flex items-center justify-center shrink-0 w-8 h-8`}>
                <Icon name={iconName} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} strokeWidth={2} />
            </div>
            <span className={`text-sm tracking-wide whitespace-nowrap ml-2 transition-all duration-300 origin-left ${isCollapsed ? 'w-0 opacity-0 scale-x-0 hidden' : 'w-auto opacity-100 scale-x-100'}`}>
                {label} {isDisabled && <span className="text-[9px] font-black ml-1 bg-slate-200 text-slate-500 px-1 rounded">PRO</span>}
            </span>
        </button>
    </li>
);

const ConnectivityBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    useEffect(() => {
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-rose-600 text-white text-[11px] font-bold py-1.5 px-4 text-center animate-in slide-in-from-top duration-300 flex items-center justify-center gap-2 z-[100] sticky top-0">
            <Icon name="alert" className="w-3 h-3" />
            OFFLINE MODE — Changes saved locally but not synced to cloud.
        </div>
    );
};

const MainAppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { activeTab, setActiveTab } = useNavigation();
    const { classProfile } = useStudents();
    const { showToast } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleTabChange = (tab: TabName) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); 
    };

    const renderTab = () => {
        switch (activeTab) {
            case TABS.STUDENTS: return <StudentsTab />;
            case TABS.BENCHMARK: return <BenchmarkFrameworkTab />;
            case TABS.ANALYTICS: return <AnalyticsTab />;
            case TABS.SETTINGS: return <SettingsTab />;
            case TABS.ADMIN: return <AdminPanel />;
            default: return <StudentsTab />;
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800 print:h-auto print:overflow-visible">
            <ConnectivityBanner />
            
            <div className="flex flex-1 overflow-hidden">
                {(!classProfile && !user?.isDemo) && <OnboardingWizard />}

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity print:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                )}

                <aside className={`
                    fixed inset-y-0 left-0 z-40 bg-white flex flex-col shadow-[1px_0_20px_rgba(0,0,0,0.03)] border-r border-slate-100 transition-all duration-300 ease-out
                    ${isSidebarCollapsed ? 'w-20 px-3' : 'w-72 p-4'}
                    lg:static print:hidden
                    ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className={`flex items-center gap-3 mb-10 mt-4 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Icon name="benchmark" className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Benchmark</h1>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                                {user?.isDemo ? 'Live Demo Mode' : 'Educator Pro'}
                            </p>
                        </div>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-8">
                        <div>
                            {!isSidebarCollapsed && <p className="px-3 ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Workspace</p>}
                            <ul className="space-y-1">
                                <NavItem label={TABS.STUDENTS} iconName="students" isActive={activeTab === TABS.STUDENTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.STUDENTS)} />
                                <NavItem label={TABS.BENCHMARK} iconName="benchmark" isActive={activeTab === TABS.BENCHMARK} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.BENCHMARK)} />
                                <NavItem label={TABS.ANALYTICS} iconName="analytics" isActive={activeTab === TABS.ANALYTICS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.ANALYTICS)} />
                            </ul>
                        </div>
                        
                        <div>
                            {!isSidebarCollapsed && <p className="px-3 ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System</p>}
                             <ul className="space-y-1">
                                <NavItem 
                                    label={TABS.SETTINGS} 
                                    iconName="settings" 
                                    isActive={activeTab === TABS.SETTINGS} 
                                    isCollapsed={isSidebarCollapsed} 
                                    isDisabled={user?.isDemo}
                                    onClick={() => handleTabChange(TABS.SETTINGS)} 
                                />
                                <NavItem 
                                    label={TABS.ADMIN} 
                                    iconName="admin" 
                                    isActive={activeTab === TABS.ADMIN} 
                                    isCollapsed={isSidebarCollapsed} 
                                    isDisabled={user?.isDemo}
                                    onClick={() => handleTabChange(TABS.ADMIN)} 
                                />
                             </ul>
                         </div>

                         {user?.isDemo && !isSidebarCollapsed && (
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mx-1">
                                <p className="text-xs font-bold text-indigo-800 mb-1">Demo Access</p>
                                <p className="text-[10px] text-indigo-600 mb-3">Settings & Admin require a full Pro account.</p>
                                <button onClick={logout} className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 w-full shadow-sm">
                                    Exit Demo
                                </button>
                            </div>
                         )}
                    </nav>

                    <div className={`pt-4 border-t border-slate-100 ${isSidebarCollapsed ? 'flex flex-col items-center gap-4' : 'px-2'}`}>
                        <div 
                            className={`flex items-center justify-center gap-2 mb-4 py-1.5 rounded-lg border transition-all ${isSidebarCollapsed ? 'px-2' : 'w-full'} ${navigator.onLine ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}
                            title={navigator.onLine ? "Connected to Cloud Database" : "No Internet Connection"}
                        >
                            <div className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${navigator.onLine ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${navigator.onLine ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            </div>
                            {!isSidebarCollapsed && <span className="text-[10px] font-bold uppercase tracking-wider">{navigator.onLine ? 'Sync Active' : 'Offline Mode'}</span>}
                        </div>

                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`hidden lg:flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors mb-4 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-full py-2 gap-2'}`}
                        >
                            <Icon name={isSidebarCollapsed ? "arrowRight" : "chevronLeft"} className="w-5 h-5" />
                            {!isSidebarCollapsed && <span className="text-xs font-bold">Collapse Sidebar</span>}
                        </button>

                        <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group ${isSidebarCollapsed ? 'justify-center p-0' : 'hover:bg-slate-50'}`}>
                            <div className="w-9 h-9 shrink-0 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                                 <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                    {user?.name.charAt(0)}
                                 </div>
                            </div>
                            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                            </div>
                             {!isSidebarCollapsed && (
                                 <button onClick={logout} className="text-slate-400 hover:text-rose-500 transition p-1">
                                     <Icon name="logout" className="w-4 h-4" />
                                 </button>
                             )}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative flex flex-col w-full overflow-hidden print:overflow-visible print:h-auto print:w-full bg-[#F8FAFC]">
                     <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-20 relative print:hidden">
                         <div className="flex items-center gap-3">
                             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-700 hover:text-indigo-600 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2">
                                 <Icon name="menu" className="w-6 h-6" /> 
                                 <span className="font-bold text-sm">Menu</span>
                             </button>
                         </div>
                         <span className="font-bold text-slate-800 text-sm absolute left-1/2 -translate-x-1/2">{activeTab}</span>
                         <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                             {user?.name.charAt(0)}
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent print:overflow-visible print:h-auto">
                        {renderTab()}
                     </div>

                     <ChatWidget />
                </main>
            </div>
        </div>
    );
};

const AuthWrapper: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium text-sm">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    if (!user) return <LoginScreen />;

    return (
        <NavigationProvider>
            <StudentProvider>
                <BenchmarkProvider>
                    <ResourceProvider>
                        <ChatProvider>
                            <MainAppLayout />
                        </ChatProvider>
                    </ResourceProvider>
                </BenchmarkProvider>
            </StudentProvider>
        </NavigationProvider>
    );
};

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AuthWrapper />
            </AuthProvider>
        </ToastProvider>
    );
}
