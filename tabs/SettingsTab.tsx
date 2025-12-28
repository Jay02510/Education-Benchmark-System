
import React from 'react';
import { Card } from '../components/common/Card';

const SettingsSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-3">{title}</h2>
        {children}
    </Card>
);

const FormRow: React.FC<{label: string, children: React.ReactNode}> = ({ label, children }) => (
    <div className="flex items-center justify-between py-3">
        <label className="text-slate-600 font-medium">{label}</label>
        {children}
    </div>
);

export const SettingsTab: React.FC = () => {
    return (
        <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            
            <SettingsSection title="Profile">
                <FormRow label="Name">
                    <input type="text" defaultValue="Jane Doe" className="px-3 py-1 border rounded-md w-64" />
                </FormRow>
                 <FormRow label="Email">
                    <input type="email" defaultValue="jane.doe@school.edu" className="px-3 py-1 border rounded-md w-64" />
                </FormRow>
            </SettingsSection>

            <SettingsSection title="Notification Preferences">
                <FormRow label="AI Proactive Alerts">
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                </FormRow>
                <FormRow label="Assessment Reminders">
                     <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                </FormRow>
                 <FormRow label="Parent Messages">
                     <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                </FormRow>
            </SettingsSection>
            
             <SettingsSection title="AI Settings">
                <FormRow label="AI Alert Threshold">
                    <select className="px-3 py-1 border rounded-md w-64">
                        <option>Standard (-5% deviation)</option>
                        <option>Sensitive (-3% deviation)</option>
                        <option>Lenient (-8% deviation)</option>
                    </select>
                </FormRow>
                 <FormRow label="Share Anonymized Data">
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                </FormRow>
            </SettingsSection>
        </div>
    );
};
   