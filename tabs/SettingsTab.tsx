import React from 'react';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';

const SettingsSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <Card className="p-8 mb-6 bg-white border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-4 tracking-tight">{title}</h2>
        <div className="space-y-2">
            {children}
        </div>
    </Card>
);

const FormRow: React.FC<{label: string, children: React.ReactNode}> = ({ label, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
        <label className="text-slate-600 font-bold text-sm">{label}</label>
        {children}
    </div>
);

export const SettingsTab: React.FC = () => {
    return (
        <div className="p-8 md:p-12 h-full overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-100">
                        <Icon name="settings" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
                        <p className="text-slate-400 font-medium mt-1">Configure your personal workspace and AI preferences</p>
                    </div>
                </div>
                
                <SettingsSection title="Profile Information">
                    <FormRow label="Full Name">
                        <input type="text" defaultValue="Jane Doe" className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl w-64 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </FormRow>
                     <FormRow label="Email Address">
                        <input type="email" defaultValue="jane.doe@school.edu" className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl w-64 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </FormRow>
                </SettingsSection>

                <SettingsSection title="Automated Alerts">
                    <FormRow label="Enable AI Proactive Alerts">
                        <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"/>
                    </FormRow>
                    <FormRow label="Assessment Cycle Reminders">
                         <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"/>
                    </FormRow>
                     <FormRow label="Parent Notification Sync">
                         <input type="checkbox" className="h-6 w-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"/>
                    </FormRow>
                </SettingsSection>
                
                 <SettingsSection title="AI Intelligence Config">
                    <FormRow label="Flagging Sensitivity">
                        <select className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl w-64 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                            <option>Standard (-5% deviation)</option>
                            <option>High Sensitivity (-3% deviation)</option>
                            <option>Performance Only (-8% deviation)</option>
                        </select>
                    </FormRow>
                     <FormRow label="Share Diagnostic Metadata">
                        <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500"/>
                    </FormRow>
                </SettingsSection>

                <div className="flex justify-center pt-8 pb-20">
                    <button className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95">
                        Save System Changes
                    </button>
                </div>
            </div>
        </div>
    );
};