
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import { GeminiService } from '../services/geminiService';
import { Student, SubdomainMetadata, TestPeriod } from '../types';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { useToast } from '../context/ToastContext';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'Users' | 'Diagnostics'>('Configuration');

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">System Administration</h1>
            
            <div className="flex space-x-8 border-b border-gray-100 mb-8 overflow-x-auto">
                {(['Configuration', 'Users', 'Diagnostics'] as const).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-1 font-bold text-sm transition relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
                    </button>
                ))}
            </div>

            {activeTab === 'Configuration' && <ConfigSection />}
            {activeTab === 'Users' && <UserManagementSection />}
            {activeTab === 'Diagnostics' && <DiagnosticsSection />}
        </div>
    );
};

const DiagnosticsSection: React.FC = () => {
    const [status, setStatus] = useState<string>("Checking...");
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        setStatus(GeminiService.getConnectivityStatus());
    }, []);

    const runTest = async () => {
        setIsTesting(true);
        try {
            const res = await GeminiService.generateMicroNarrative("System Diagnostic Ping");
            setTestResult(`SUCCESS: ${res}`);
        } catch (e: any) {
            setTestResult(`FAILED: ${e.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-8 border-l-8 border-indigo-600 bg-white">
                <h2 className="text-2xl font-black text-slate-900 mb-4">Intelligence Engine Diagnostics</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Engine Connection Status</p>
                        <p className={`font-mono text-sm font-bold ${status.includes('ONLINE') ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {status}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Environment Check</p>
                        <ul className="text-xs space-y-2 font-medium text-slate-600">
                            <li>• Vercel API_KEY Visibility: <span className={process.env.API_KEY ? 'text-emerald-600' : 'text-rose-600'}>{process.env.API_KEY ? 'EXPOSED' : 'HIDDEN'}</span></li>
                            <li>• Browser Shim Status: <span className="text-emerald-600">ACTIVE</span></li>
                            <li>• Model Access: <span className="text-slate-400 italic">Determined during test...</span></li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={runTest}
                            disabled={isTesting}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition disabled:opacity-50"
                        >
                            {isTesting ? 'Testing Connectivity...' : 'Run Live API Test'}
                        </button>
                    </div>

                    {testResult && (
                        <div className={`mt-4 p-4 rounded-2xl border text-xs font-bold ${testResult.includes('SUCCESS') ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                            {testResult}
                        </div>
                    )}
                </div>
            </Card>
            
            <Card className="p-8 bg-amber-50 border border-amber-100">
                <div className="flex gap-4">
                    <Icon name="info" className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                        <h3 className="font-black text-amber-900 mb-2">Debugging Vercel Connectivity</h3>
                        <p className="text-sm text-amber-800 leading-relaxed mb-4">
                            If the status above is <strong>OFFLINE</strong>, your <code>API_KEY</code> variable in Vercel is hidden from the browser. 
                        </p>
                        <ol className="text-xs text-amber-800 space-y-2 list-decimal ml-4 font-bold">
                            <li>Go to Vercel Dashboard → Settings → Environment Variables.</li>
                            <li>Ensure <code>API_KEY</code> exists.</li>
                            <li>Try adding a second variable named <code>VITE_API_KEY</code> with the same value (Vite requires this prefix for browser access).</li>
                            <li>Redeploy your application for changes to take effect.</li>
                        </ol>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const ConfigSection: React.FC = () => {
    const { 
        domains, subdomains, thresholds, 
        addDomain, deleteDomain, addSubdomain, deleteSubdomain, 
        updateSubdomain, updateThreshold, resetBenchmarks 
    } = useBenchmarks();
    
    const [newDomain, setNewDomain] = useState('');
    const [newSubdomain, setNewSubdomain] = useState('');
    const [newSubdomainMax, setNewSubdomainMax] = useState(10);
    const [selectedDomainForSub, setSelectedDomainForSub] = useState<string>(domains[0] || '');
    const [editingSub, setEditingSub] = useState<{domain: string, name: string} | null>(null);
    const [editMaxScore, setEditMaxScore] = useState(0);

    const handleAddDomain = () => { if (newDomain.trim()) { addDomain(newDomain.trim()); setNewDomain(''); } };
    const handleAddSubdomain = () => { if (selectedDomainForSub && newSubdomain.trim()) { addSubdomain(selectedDomainForSub, newSubdomain.trim(), newSubdomainMax); setNewSubdomain(''); setNewSubdomainMax(10); } };
    const startEditing = (sub: SubdomainMetadata, domain: string) => { setEditingSub({ domain, name: sub.name }); setEditMaxScore(sub.maxScore); };
    const saveEditing = () => { if (editingSub) { updateSubdomain(editingSub.domain, editingSub.name, editingSub.name, editMaxScore); setEditingSub(null); } };

    return (
        <div className="space-y-10">
            <Card className="p-8 border-t-8 border-rose-500 shadow-xl bg-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -z-0 translate-x-20 -translate-y-20 opacity-40"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                            <Icon name="alert" className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Flagging Thresholds</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated RTI Trigger Points</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Object.values(TestPeriod).map((period) => (
                            <div key={period} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-black text-slate-700">{period}</label>
                                    <span className="text-2xl font-black text-rose-500">{thresholds[period]}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="1" 
                                    value={thresholds[period]} 
                                    onChange={(e) => updateThreshold(period, parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="p-8 shadow-lg bg-white">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900">Academic Domains</h2>
                        <div className="flex gap-2">
                            <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="Subject Name" className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold w-40 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <button onClick={handleAddDomain} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg active:scale-95">Add</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {domains.map(d => (
                            <div key={d} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                <span className="font-bold text-slate-700">{d}</span>
                                <button onClick={() => deleteDomain(d)} className="text-slate-300 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors"><Icon name="close" className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 shadow-lg bg-white">
                     <div className="mb-8 pb-4 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Subdomains & Weighting</h2>
                        <div className="flex flex-col gap-4">
                            <select value={selectedDomainForSub} onChange={(e) => setSelectedDomainForSub(e.target.value)} className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                {domains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const UserManagementSection: React.FC = () => {
    const { students, classProfile, deleteStudent } = useStudents();
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (student: Student) => { setEditingStudent(student); setIsModalOpen(true); };
    const handleDelete = (id: string, name: string) => { if (window.confirm(`Permanently remove ${name}?`)) deleteStudent(id); };
    
    return (
        <Card className="p-8 shadow-xl bg-white">
            <div className="flex justify-between items-center mb-10">
                <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">{classProfile?.className || 'Roster'} Management</h2>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Class Population: {students.length} students</p>
                </div>
            </div>
            
            <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Lvl</th>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Admin Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <img src={student.photoUrl} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 object-cover shadow-sm" alt=""/>
                                        <span className="font-bold text-slate-800">{student.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Lvl {student.level}</span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-2">
                                    <button onClick={() => handleEdit(student)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-100 transition-all">Edit</button>
                                    <button onClick={() => handleDelete(student.id, student.name)} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AddStudentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} studentToEdit={editingStudent} />
        </Card>
    );
};
