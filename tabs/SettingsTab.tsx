import React, { useState } from 'react';
import { Icon } from '../components/common/Icon';
import { useToast } from '../context/ToastContext';

const Toggle: React.FC<{ active: boolean, onChange: (v: boolean) => void }> = ({ active, onChange }) => {
    return (
        <button 
            type="button" 
            onClick={() => onChange(!active)}
            className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer select-none transition-colors duration-150 ${
                active ? 'bg-[oklch(0.72_0.18_145)]' : 'bg-zinc-800/30'
            }`}
        >
            <div className={`bg-zinc-950 w-4 h-4 rounded-full shadow-sm transform transition-transform duration-150 ${
                active ? 'translate-x-4' : 'translate-x-0'
            }`} />
        </button>
    );
};

export const SettingsTab: React.FC = () => {
    const { showToast } = useToast();
    const [reminders, setReminders] = useState(true);
    const [sync, setSync] = useState(false);
    const [sensitivity, setSensitivity] = useState('Standard (-5% deviation)');
    const [username, setUsername] = useState('Jane Doe');
    const [email, setEmail] = useState('jane.doe@school.edu');

    const handleSave = () => {
        showToast("System changes written to persistent state");
    };

    const handleReset = () => {
        const confirm = window.confirm("Are you sure you want to purge the current classroom sandbox? This action is irreversible.");
        if (confirm) {
            localStorage.clear();
            showToast("Database cluster scrubbed. Please reload.", "warning");
        }
    };

    return (
        <div className="p-6 md:p-12 h-full overflow-y-auto bg-[oklch(0.14_0.01_250)] font-sans">
            <div className="max-w-3xl mx-auto space-y-12">
                
                {/* Modern minimal flat header */}
                <div className="flex items-center gap-4 border-b border-zinc-900 pb-8">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                        <Icon name="settings" className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white uppercase font-sans">System Diagnostics & Params</h1>
                        <p className="text-zinc-550 text-[10px] font-mono uppercase tracking-wider block mt-1">active workspace configuration</p>
                    </div>
                </div>

                {/* Profile Information Section */}
                <div>
                    <h2 className="text-[13px] font-sans text-zinc-500 font-normal lowercase mb-2">profile information</h2>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <label className="text-zinc-400 text-xs">Full Name</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            className="bg-zinc-950 border border-zinc-90 w-64 px-3 py-1.5 rounded-[4px] text-xs text-zinc-200 outline-none focus:border-zinc-700" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <label className="text-zinc-400 text-xs">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="bg-zinc-950 border border-zinc-90 w-64 px-3 py-1.5 rounded-[4px] text-xs text-zinc-200 outline-none focus:border-zinc-700" 
                        />
                    </div>
                </div>

                {/* Automated Alerts Section */}
                <div>
                    <h2 className="text-[13px] font-sans text-zinc-500 font-normal lowercase mb-2">automated alerts</h2>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <label className="text-zinc-400 text-xs">Enable Assessment Reminders</label>
                        <Toggle active={reminders} onChange={setReminders} />
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <label className="text-zinc-400 text-xs">Parent Notification Sync</label>
                        <Toggle active={sync} onChange={setSync} />
                    </div>
                </div>

                {/* Platform Calibration Section */}
                <div>
                    <h2 className="text-[13px] font-sans text-zinc-500 font-normal lowercase mb-2">platform calibration</h2>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <label className="text-zinc-400 text-xs">RTI Sensitivity Deviation</label>
                        <select 
                            value={sensitivity} 
                            onChange={e => setSensitivity(e.target.value)}
                            className="bg-zinc-950 border border-zinc-90 w-64 px-3 py-1.5 rounded-[4px] text-xs text-zinc-300 outline-none cursor-pointer focus:border-zinc-700 font-sans"
                        >
                            <option className="bg-zinc-950 text-zinc-300">Standard (-5% deviation)</option>
                            <option className="bg-zinc-950 text-zinc-300">High Sensitivity (-3% deviation)</option>
                            <option className="bg-zinc-950 text-zinc-300">Performance Only (-8% deviation)</option>
                        </select>
                    </div>
                </div>

                {/* Standard Actions Control */}
                <div className="pt-6">
                    <button 
                        onClick={handleSave}
                        className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Save Configuration
                    </button>
                </div>

                {/* Destructive Actions Section (danger color, visually separated with extra spacing at bottom) */}
                <div className="pt-20 border-t border-zinc-900/40">
                    <h2 className="text-[13px] font-sans text-rose-500/80 font-normal lowercase mb-2">danger zone</h2>
                    
                    <div className="flex items-center justify-between py-4 border-b border-[0.5px] border-zinc-900">
                        <div>
                            <span className="text-xs text-rose-500 font-medium block">Scrub sandbox database</span>
                            <span className="text-[10px] text-zinc-600 block mt-0.5">Purge local client state and clean up workspace registers</span>
                        </div>
                        <button 
                            onClick={handleReset}
                            className="px-4 py-1.5 border border-[oklch(0.65_0.20_25)]/30 hover:border-[oklch(0.65_0.20_25)] hover:bg-[oklch(0.65_0.20_25)]/10 text-rose-400 hover:text-rose-300 rounded-[4px] text-[10px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
                        >
                            Purge State
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
