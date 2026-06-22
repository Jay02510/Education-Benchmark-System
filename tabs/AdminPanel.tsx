import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { Student, TestPeriod, SubdomainMetadata } from '../types';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'Users'>('Configuration');

    return (
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto pb-20 font-sans text-zinc-150">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-6 mb-8 select-none">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-850 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                    <Icon name="settings" className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white uppercase">System Administration</h1>
                    <p className="text-zinc-550 text-[10px] font-mono uppercase tracking-wider block mt-1">configure standard parameters</p>
                </div>
            </div>
            
            <div className="flex space-x-6 border-b border-zinc-900 mb-8 overflow-x-auto select-none">
                {(['Configuration', 'Users'] as const).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-1.5 font-mono text-xs uppercase tracking-wider transition-colors relative cursor-pointer ${
                            activeTab === tab ? 'text-[oklch(0.72_0.18_145)] font-semibold' : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                    >
                        <span>{tab}</span>
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[oklch(0.72_0.18_145)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'Configuration' && <ConfigSection />}
            {activeTab === 'Users' && <UserManagementSection />}
        </div>
    );
};

const ConfigSection: React.FC = () => {
    const { 
        domains, subdomains, thresholds, 
        addDomain, deleteDomain, addSubdomain, updateSubdomain, updateThreshold 
    } = useBenchmarks();
    
    const [newDomain, setNewDomain] = useState('');
    const [newSubdomain, setNewSubdomain] = useState('');
    const [newSubdomainMax, setNewSubdomainMax] = useState(10);
    const [selectedDomainForSub, setSelectedDomainForSub] = useState<string>(domains[0] || '');

    const [editingSub, setEditingSub] = useState<{domain: string, name: string} | null>(null);
    const [editMaxScore, setEditMaxScore] = useState(0);

    const handleAddDomain = () => { 
        if (newDomain.trim()) { 
            addDomain(newDomain.trim()); 
            setNewDomain(''); 
        } 
    };

    const handleAddSubdomain = () => { 
        if (selectedDomainForSub && newSubdomain.trim()) { 
            addSubdomain(selectedDomainForSub, newSubdomain.trim(), newSubdomainMax); 
            setNewSubdomain(''); 
            setNewSubdomainMax(10); 
        } 
    };

    const startEditing = (sub: SubdomainMetadata, domain: string) => { 
        setEditingSub({ domain, name: sub.name }); 
        setEditMaxScore(sub.maxScore); 
    };

    const saveEditing = () => { 
        if (editingSub) { 
            updateSubdomain(editingSub.domain, editingSub.name, editingSub.name, editMaxScore); 
            setEditingSub(null); 
        } 
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-zinc-950 border border-zinc-900 rounded-[4px] relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 select-none">
                        <div className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-[4px] text-rose-455">
                            <Icon name="alert" className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-xs font-mono uppercase tracking-wider text-rose-400">Alert Limits</h2>
                            <p className="text-[10px] text-zinc-550 block mt-0.5">Define thresholds for support level interventions</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.values(TestPeriod).map((period) => (
                            <div key={period} className="space-y-3.5 bg-zinc-90 w-full p-4 rounded-[4px] border border-zinc-900">
                                <div className="flex justify-between items-center select-none">
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{period}</label>
                                    <span className="text-sm font-semibold font-mono text-rose-400">{thresholds[period]}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="1" 
                                    value={thresholds[period]} 
                                    onChange={(e) => updateThreshold(period, parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-805 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-zinc-950 border border-zinc-900 rounded-[4px]">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-900">
                        <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider select-none">Subjects</h2>
                        <div className="flex gap-2">
                            <input 
                                value={newDomain} 
                                onChange={(e) => setNewDomain(e.target.value)} 
                                placeholder="e.g. Literacy" 
                                className="px-3 py-1.5 border border-zinc-900 bg-zinc-95 w-40 rounded-[4px] text-xs outline-none focus:border-zinc-700 font-sans" 
                            />
                            <button onClick={handleAddDomain} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer">Add</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {domains.map(d => (
                            <div key={d} className="flex justify-between items-center p-3 bg-zinc-90 rounded-[4px] border border-zinc-900 hover:border-zinc-850 transition-colors">
                                <span className="text-xs font-medium text-zinc-350">{d}</span>
                                <button onClick={() => deleteDomain(d)} className="text-zinc-600 hover:text-rose-455 p-1 rounded-[4px] hover:bg-zinc-950 transition-colors cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 bg-zinc-950 border border-zinc-900 rounded-[4px]">
                     <div className="mb-6 pb-2 border-b border-zinc-900">
                        <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider select-none">Subdomains & Weighting</h2>
                     </div>
                     <div className="space-y-4">
                        <select 
                            value={selectedDomainForSub} 
                            onChange={(e) => setSelectedDomainForSub(e.target.value)} 
                            className="w-full px-3 py-2 border border-zinc-900 bg-zinc-950 text-zinc-200 rounded-[4px] text-xs outline-none cursor-pointer focus:border-zinc-700"
                        >
                            {domains.map(d => <option key={d} value={d} className="bg-zinc-950 text-zinc-300">{d}</option>)}
                        </select>

                        <div className="flex gap-2">
                            <input 
                                value={newSubdomain} 
                                onChange={(e) => setNewSubdomain(e.target.value)} 
                                placeholder="New Subdomain key" 
                                className="flex-1 px-3 py-1.5 border border-zinc-900 bg-zinc-95 w-40 rounded-[4px] text-xs outline-none focus:border-zinc-700" 
                            />
                            <input 
                                type="number" 
                                min="1" 
                                value={newSubdomainMax} 
                                onChange={(e) => setNewSubdomainMax(parseInt(e.target.value) || 1)} 
                                className="w-16 px-2 py-1.5 border border-zinc-900 bg-zinc-95 text-center rounded-[4px] text-xs outline-none focus:border-zinc-700 font-mono" 
                            />
                            <button onClick={handleAddSubdomain} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer">Add</button>
                        </div>

                        <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                            {(subdomains[selectedDomainForSub] || []).map(sub => (
                                <div key={sub.name} className="flex justify-between items-center p-2.5 bg-zinc-90 rounded-[2px] border border-zinc-900">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-300 font-sans">{sub.name}</span>
                                        <span className="text-[10px] font-mono text-zinc-550">(Max: {sub.maxScore})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => startEditing(sub, selectedDomainForSub)} 
                                            className="text-[10px] font-mono text-[oklch(0.72_0.18_145)] hover:underline cursor-pointer"
                                        >
                                            Edit Max
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </Card>
            </div>

            {/* Editing Max Dialog Overlay */}
            {editingSub && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1100000] backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-[4px] p-5">
                        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Configure max score</h3>
                        <p className="text-[11px] text-zinc-500 mb-4">Set diagnostic upper bounds for subdomain "{editingSub.name}".</p>
                        
                        <input 
                            type="number" 
                            value={editMaxScore} 
                            onChange={(e) => setEditMaxScore(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[4px] text-zinc-200 text-sm outline-none mb-4 font-mono text-center"
                        />

                        <div className="flex gap-2 justify-end">
                            <button 
                                onClick={() => setEditingSub(null)} 
                                className="px-3.5 py-1.5 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveEditing} 
                                className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                            >
                                Save Max
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagementSection: React.FC = () => {
    const { students, classProfile, deleteStudent } = useStudents();
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (student: Student) => { 
        setEditingStudent(student); 
        setIsModalOpen(true); 
    };

    const handleDelete = (id: string, name: string) => { 
        if (window.confirm(`Permanently remove ${name}?`)) {
            deleteStudent(id); 
        }
    };
    
    return (
        <Card className="p-6 bg-zinc-950 border border-zinc-905 rounded-[4px]">
            <div className="flex justify-between items-start mb-8 select-none">
                <div>
                     <h2 className="text-sm font-medium text-zinc-200 uppercase tracking-tight">{classProfile?.className || 'Roster'} Management</h2>
                     <p className="text-zinc-[600] text-[9.5px] font-mono uppercase tracking-wider mt-1">Class Population: {students.length} students</p>
                </div>
            </div>
            
            <div className="overflow-x-auto rounded-[4px] border border-zinc-900">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-950 border-b border-zinc-900 font-mono">
                        <tr>
                            <th className="py-3 px-4 text-[9px] font-normal text-zinc-500 uppercase tracking-wider">Student Identity</th>
                            <th className="py-3 px-4 text-[9px] font-normal text-zinc-500 uppercase tracking-wider">Target Level</th>
                            <th className="py-3 px-4 text-[9px] font-normal text-zinc-500 uppercase tracking-wider text-right">Admin Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-zinc-950">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-zinc-900/20 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3 select-none">
                                        <img src={student.photoUrl} className="w-8 h-8 rounded-[2px] bg-zinc-900 border border-zinc-850 object-cover" alt=""/>
                                        <span className="text-xs text-zinc-300 font-medium">{student.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-mono select-none">
                                    <span className="text-[10px] font-mono text-[oklch(0.72_0.18_145)] bg-[oklch(0.72_0.18_145)]/10 px-2.5 py-0.5 rounded-[2px] border border-[oklch(0.72_0.18_145)]/20">Lvl {student.level}</span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2 font-mono">
                                    <button onClick={() => handleEdit(student)} className="text-[10px] text-[oklch(0.72_0.18_145)] hover:underline cursor-pointer">Edit</button>
                                    <button onClick={() => handleDelete(student.id, student.name)} className="text-[10px] text-rose-455 hover:underline pl-4 cursor-pointer">Remove</button>
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
