import React, { useState } from 'react';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../context/StudentContext';
import { Icon } from '../components/common/Icon';
import { TestPeriod, SubdomainMetadata } from '../types';
import { GeminiService } from '../services/geminiService';

// Custom lightweight toggle switch styled to guidelines:
// - accent when on (var(--clean-accent)), ink-muted at 30% when off
// - no animation beyond the thumb sliding (transition-transform only)
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleProps> = ({ checked, onChange }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full outline-none focus:ring-0 transition-colors duration-200 ${
                checked ? 'bg-[var(--clean-accent)]' : 'bg-zinc-500/30'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 focus:outline-none transition-transform duration-200 mt-0.5 ${
                    checked ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
};

export const SystemTab: React.FC = () => {
    const { user } = useAuth();
    const { students } = useStudents();
    const { 
        thresholds, updateThreshold, resetBenchmarks, 
        domains, addDomain, deleteDomain, subdomains, addSubdomain, deleteSubdomain
    } = useBenchmarks();
    
    const [activeSection, setActiveSection] = useState<'profile' | 'institutional' | 'security'>('institutional');
    
    // Form and Interactive States
    const [userName, setUserName] = useState(user?.name || '');
    const [newDomainInput, setNewDomainInput] = useState('');
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [newSubName, setNewSubName] = useState('');
    const [newSubMax, setNewSubMax] = useState(10);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Custom Toggles to satisfy styling demands & system settings depth
    const [autoAlerts, setAutoAlerts] = useState(true);
    const [dailyDigest, setDailyDigest] = useState(false);
    const [predictiveAnomalies, setPredictiveAnomalies] = useState(true);
    const [showVelocity, setShowVelocity] = useState(true);
    const [liveAnalysis, setLiveAnalysis] = useState(true);

    const handleAutoCalibrate = async () => {
        setIsCalibrating(true);
        try {
            const suggestions = await GeminiService.suggestDynamicThresholds(students);
            Object.entries(suggestions).forEach(([period, val]) => {
                updateThreshold(period as TestPeriod, val);
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsCalibrating(false);
        }
    };

    const handleAddDomain = () => {
        if (newDomainInput.trim()) {
            addDomain(newDomainInput.trim());
            setNewDomainInput('');
        }
    };

    const handleAddSub = (domain: string) => {
        if (newSubName.trim()) {
            addSubdomain(domain, newSubName.trim(), newSubName.toLowerCase().includes('speaking') ? 5 : newSubMax);
            setNewSubName('');
        }
    };

    const handleProfileSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto h-full flex flex-col pb-48 font-sans">
            {/* Minimal Dashboard Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-normal text-zinc-100 tracking-tight mb-2">Settings & Controls</h1>
                <p className="text-zinc-500 text-sm">Configure personal characteristics, structured parameters, and algorithmic thresholds.</p>
            </div>

            {/* Split Grid - Sidebar Left, Full rows Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
                
                {/* Visual Settings Navigation Panel */}
                <div className="lg:col-span-3">
                    <div className="space-y-1 sticky top-6">
                        {[
                            { id: 'profile', t: 'Personal profile' },
                            { id: 'institutional', t: 'Subject structure' },
                            { id: 'security', t: 'Alert parameters' }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full text-left py-3 px-4 border-l-2 transition-all cursor-pointer ${
                                    activeSection === item.id 
                                        ? 'border-[var(--clean-accent)] text-[var(--clean-accent)] font-medium bg-zinc-900/30' 
                                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <span className="text-sm tracking-tight">{item.t}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Rows Layout Column (No Cards, Breathe naturally on raw background) */}
                <div className="lg:col-span-9 space-y-12">
                    
                    {activeSection === 'profile' && (
                        <div className="animate-in fade-in duration-300">
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                                identity parameters
                            </h4>
                            
                            {/* Row 1: Full Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Full name</div>
                                    <div className="text-xs text-zinc-500 mt-1">Configure user identification details on report exports and ledger changes.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <input 
                                        type="text" 
                                        value={userName} 
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-64 max-w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-[var(--clean-accent)] outline-none rounded text-sm text-zinc-100 placeholder-zinc-700" 
                                    />
                                </div>
                            </div>

                            {/* Row 2: Account Permissions */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Account status</div>
                                    <div className="text-xs text-zinc-500 mt-1">Status levels represent database execution access. Contact administrator for privilege elevation.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 font-mono capitalize">
                                        {user?.role || 'Guest'} Access Level
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal mt-10 lowercase">
                                workspace options
                            </h4>

                            {/* Row 3: Live Analysis Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Enable real-time synchronization</div>
                                    <div className="text-xs text-zinc-500 mt-1">Saves changes in background queries continually rather than batch caching.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <ToggleSwitch checked={liveAnalysis} onChange={setLiveAnalysis} />
                                </div>
                            </div>

                            {/* Row 4: Show Velocity Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Velocity warnings</div>
                                    <div className="text-xs text-zinc-500 mt-1">Render colored dynamic momentum hazard identifiers on student directory lists directly.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <ToggleSwitch checked={showVelocity} onChange={setShowVelocity} />
                                </div>
                            </div>

                            {/* Action Row */}
                            <div className="mt-8 flex justify-end">
                                <button 
                                    onClick={handleProfileSave}
                                    className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded transition-colors cursor-pointer"
                                >
                                    {isSaved ? 'Identity saved' : 'Save profile details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'institutional' && (
                        <div className="animate-in fade-in duration-300">
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                                categories definition
                            </h4>

                            {/* Add Domain (Subject) Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Register learning domain</div>
                                    <div className="text-xs text-zinc-500 mt-1">Add general curriculum modules that compile custom proficiency indexes.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newDomainInput} 
                                            onChange={(e) => setNewDomainInput(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && handleAddDomain()} 
                                            placeholder="e.g. Mathematics" 
                                            className="px-3 py-1.5 bg-zinc-955 border border-zinc-800 focus:border-[var(--clean-accent)] outline-none rounded text-xs text-zinc-100 placeholder-zinc-700 w-48" 
                                        />
                                        <button 
                                            onClick={handleAddDomain} 
                                            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-medium rounded transition-colors cursor-pointer"
                                        >
                                            Add Subject
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal mt-10 lowercase">
                                custom subject taxonomy
                            </h4>

                            {/* Domains Listing rows with dynamic nesting of skills */}
                            <div className="space-y-0">
                                {domains.map(d => (
                                    <div key={d} className="py-4 font-sans" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => setExpandedDomain(expandedDomain === d ? null : d)}
                                                    className="text-sm font-normal text-zinc-100 hover:text-[var(--clean-accent)] text-left transition-colors cursor-pointer"
                                                >
                                                    {d}
                                                </button>
                                                <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-sans">
                                                    {(subdomains[d] || []).length} skills
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setExpandedDomain(expandedDomain === d ? null : d)}
                                                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                                                >
                                                    {expandedDomain === d ? 'Collapse' : 'Structure subdomains'}
                                                </button>
                                                <button 
                                                    onClick={() => deleteDomain(d)}
                                                    className="text-xs text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                                                >
                                                    Remove Domain
                                                </button>
                                            </div>
                                        </div>

                                        {expandedDomain === d && (
                                            <div className="mt-4 ml-2 pl-4 border-l border-zinc-800/80 animate-in fade-in duration-200 space-y-4">
                                                <div className="space-y-2">
                                                    {(subdomains[d] || []).map((sub: SubdomainMetadata) => (
                                                        <div key={sub.name} className="flex items-center justify-between py-1.5 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-zinc-300 font-medium">{sub.name}</span>
                                                                <span className="text-zinc-500 font-mono text-[10px]">(Max: {sub.maxScore || 10})</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => deleteSubdomain(d, sub.name)} 
                                                                className="text-zinc-500 hover:text-red-500 transition-colors cursor-pointer font-sans"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(subdomains[d] || []).length === 0 && (
                                                        <div className="text-xs text-zinc-550 italic py-1">No subdomain criteria registered.</div>
                                                    )}
                                                </div>

                                                {/* Add Subdomain Row Form inline */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <input 
                                                        type="text"
                                                        value={newSubName} 
                                                        onChange={e => setNewSubName(e.target.value)} 
                                                        placeholder="Custom skill (e.g. Speaking)" 
                                                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-[var(--clean-accent)] outline-none rounded text-xs text-zinc-100 placeholder-zinc-700 w-44" 
                                                    />
                                                    <input 
                                                        type="number"
                                                        value={newSubMax} 
                                                        onChange={e => setNewSubMax(parseInt(e.target.value) || 10)} 
                                                        placeholder="10" 
                                                        className="px-2 py-1.5 bg-zinc-955 border border-zinc-800 focus:border-[var(--clean-accent)] outline-none rounded text-xs text-zinc-100 placeholder-zinc-700 w-16 text-center" 
                                                    />
                                                    <button 
                                                        onClick={() => handleAddSub(d)} 
                                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs rounded transition-colors cursor-pointer"
                                                    >
                                                        Add Skill
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="animate-in fade-in duration-300">
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                                safety goals calibration
                            </h4>

                            {/* Calibration smart tools trigger */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Algorithmic calibration</div>
                                    <div className="text-xs text-zinc-500 mt-1">Synthesizes historical trends of this cohort and suggests safety limits based on dynamic growth metrics.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <button 
                                        onClick={handleAutoCalibrate}
                                        disabled={isCalibrating}
                                        className="px-4 py-2 border border-zinc-800 hover:border-[var(--clean-accent)] text-zinc-350 hover:text-[var(--clean-accent)] disabled:opacity-40 transition-colors text-xs font-semibold rounded flex items-center gap-2 cursor-pointer"
                                    >
                                        {isCalibrating ? (
                                            <>
                                                <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                                                <span>Recalibrating model...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="brain" className="w-3.5 h-3.5" />
                                                <span>AI smart calibration</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal mt-10 lowercase">
                                active cohort alerts
                            </h4>

                            {/* Slider Rules for thresholds */}
                            {Object.values(TestPeriod).map((period) => (
                                <div key={period} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex-1 pr-6">
                                        <div className="text-sm font-medium text-zinc-200 capitalize">{period} minimum goal</div>
                                        <div className="text-xs text-zinc-500 mt-1">Defines critical warning point. Score indices registered below this parameter toggle teacher safety warnings.</div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 shrink-0 flex items-center gap-3">
                                        <input 
                                            type="range" 
                                            min="0" max="100" step="1" 
                                            value={thresholds[period]} 
                                            onChange={(e) => updateThreshold(period, parseInt(e.target.value))} 
                                            className="w-40 sm:w-48 appearance-none h-1 bg-zinc-800 rounded-full cursor-pointer accent-[var(--clean-accent)] hover:opacity-100" 
                                        />
                                        <span className="text-sm font-mono font-medium text-[var(--clean-accent)] w-12 text-right">
                                            {thresholds[period]}%
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal mt-10 lowercase">
                                automation notifications
                            </h4>

                            {/* Row Toggle 1: Auto Alerts */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">System hazard logs</div>
                                    <div className="text-xs text-zinc-500 mt-1">Logs alerts internally immediately when growth limits fall negative.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0 font-sans">
                                    <ToggleSwitch checked={autoAlerts} onChange={setAutoAlerts} />
                                </div>
                            </div>

                            {/* Row Toggle 2: Daily Digest */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Daily email dashboard digests</div>
                                    <div className="text-xs text-zinc-500 mt-1">Sends summary status logs regarding student warning states to parent accounts automatically.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <ToggleSwitch checked={dailyDigest} onChange={setDailyDigest} />
                                </div>
                            </div>

                            {/* Row Toggle 3: Anomaly Alerts */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm font-medium text-zinc-200">Predictive growth models</div>
                                    <div className="text-xs text-zinc-500 mt-1">Alerts for anomalous high-slope declines even if actual points remain within limits.</div>
                                </div>
                                <div className="mt-3 sm:mt-0 shrink-0">
                                    <ToggleSwitch checked={predictiveAnomalies} onChange={setPredictiveAnomalies} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Destructive actions (delete, reset): danger color, bottom of page, visually separated with extra spacing */}
                    <div className="mt-20 pt-10 border-t border-red-950/25 space-y-4">
                        <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                            destructive parameters
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                            <div className="flex-1 pr-6">
                                <div className="text-sm font-medium text-red-500">Reset benchmark structures</div>
                                <div className="text-xs text-zinc-500 mt-1">Deletes all newly defined domains, nested skill criteria, and thresholds. Restores systems to initial settings. This action is final.</div>
                            </div>
                            <div className="mt-4 sm:mt-0 shrink-0">
                                <button 
                                    onClick={() => { if(window.confirm("WARNING: This resets all custom domains and goals to defaults. Proceed?")) resetBenchmarks(); }} 
                                    className="px-4 py-2 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-550 text-xs font-semibold rounded transition-colors cursor-pointer"
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
