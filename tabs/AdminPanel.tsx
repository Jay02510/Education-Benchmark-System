
import React, { useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import { Student, SubdomainMetadata } from '../types';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { PRESETS, FrameworkPreset } from '../data/frameworkPresets';
import { useToast } from '../context/ToastContext';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'Users' | 'Data'>('Configuration');

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Admin Panel</h1>
            
            {/* Sub-nav */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('Configuration')}
                    className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${activeTab === 'Configuration' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    System Configuration
                </button>
                <button 
                    onClick={() => setActiveTab('Users')}
                    className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${activeTab === 'Users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    User & Class Management
                </button>
                <button 
                    onClick={() => setActiveTab('Data')}
                    className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${activeTab === 'Data' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Data Management
                </button>
            </div>

            {activeTab === 'Configuration' && <ConfigSection />}
            {activeTab === 'Users' && <UserManagementSection />}
            {activeTab === 'Data' && <DataManagementSection />}
        </div>
    );
};

const DataManagementSection: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        if (!user) return;
        
        // Collect all data keys for the user
        const data = {
            metadata: {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userId: user.id,
                userName: user.name
            },
            students: JSON.parse(localStorage.getItem(`benchmark_students_${user.id}`) || '[]'),
            profile: JSON.parse(localStorage.getItem(`benchmark_profile_${user.id}`) || 'null'),
            benchmarks: JSON.parse(localStorage.getItem(`benchmark_framework_${user.id}`) || '[]'),
            domains: JSON.parse(localStorage.getItem(`benchmark_domains_${user.id}`) || '[]'),
            subdomains: JSON.parse(localStorage.getItem(`benchmark_subdomains_weighted_${user.id}`) || '{}'),
            resources: JSON.parse(localStorage.getItem(`benchmark_resources_${user.id}`) || '[]'),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `benchmark_backup_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Backup file downloaded successfully.");
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                
                // Basic validation
                if (!json.students || !json.metadata) {
                    throw new Error("Invalid backup file format");
                }

                if (window.confirm(`⚠️ WARNING: This will OVERWRITE all current data for user "${user.name}".\n\nAre you sure you want to restore from this backup?`)) {
                    // Restore data to localStorage
                    localStorage.setItem(`benchmark_students_${user.id}`, JSON.stringify(json.students));
                    localStorage.setItem(`benchmark_profile_${user.id}`, JSON.stringify(json.profile));
                    localStorage.setItem(`benchmark_framework_${user.id}`, JSON.stringify(json.benchmarks));
                    localStorage.setItem(`benchmark_domains_${user.id}`, JSON.stringify(json.domains));
                    localStorage.setItem(`benchmark_subdomains_weighted_${user.id}`, JSON.stringify(json.subdomains));
                    localStorage.setItem(`benchmark_resources_${user.id}`, JSON.stringify(json.resources));
                    
                    showToast("System restored. Reloading...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to restore data. Invalid file.", "error");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Icon name="trendStable" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Data Portability</h2>
                        <p className="text-slate-500 text-sm mt-1 mb-4 max-w-2xl">
                            Backup your classroom data to a local JSON file or restore from a previous backup.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleBackup}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <Icon name="arrowDown" className="w-5 h-5" />
                                Download Backup (.json)
                            </button>
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden" 
                                    accept=".json"
                                />
                                <button 
                                    onClick={handleRestoreClick}
                                    className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2"
                                >
                                    <Icon name="arrowUp" className="w-5 h-5" />
                                    Restore from File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Going Live?</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Recommended: Connect to a Cloud Database (Firebase/Supabase) for production deployment.
                </p>
            </Card>
        </div>
    );
};

const ConfigSection: React.FC = () => {
    const { domains, subdomains, addDomain, deleteDomain, addSubdomain, deleteSubdomain, updateSubdomain, applyPreset, resetBenchmarks } = useBenchmarks();
    const [newDomain, setNewDomain] = useState('');
    const [newSubdomain, setNewSubdomain] = useState('');
    const [newSubdomainMax, setNewSubdomainMax] = useState(10);
    const [selectedDomainForSub, setSelectedDomainForSub] = useState<string>(domains[0] || '');
    
    // Editing State
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

    const handleApplyPreset = (preset: FrameworkPreset) => {
        if (window.confirm(`⚠️ Warning: Applying a preset will replace all Domains and Subdomains. \n\nProceed?`)) {
            applyPreset(preset);
            if (preset.domains.length > 0) {
                setSelectedDomainForSub(preset.domains[0]);
            }
        }
    };

    const handleRestoreMaster = () => {
        if (window.confirm(`Restore Master Documentation Framework? This will reset custom weights.`)) {
            resetBenchmarks();
        }
    };

    return (
        <div className="space-y-8">
            {/* Master Restore & Presets */}
            <Card className="p-6 border-l-4 border-indigo-500">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <Icon name="library" className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Framework Management</h2>
                                <p className="text-slate-500 text-sm">
                                    Manage assessment structure and default weights.
                                </p>
                            </div>
                            <button 
                                onClick={handleRestoreMaster}
                                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition shadow-lg flex items-center gap-2"
                            >
                                <Icon name="check" className="w-4 h-4 text-emerald-400" />
                                Restore Master
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Domain Management */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Domains</h2>
                        <div className="flex gap-2">
                            <input 
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder="New Domain"
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none w-32"
                            />
                            <button 
                                onClick={handleAddDomain}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {domains.map(d => (
                            <div key={d} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="font-semibold text-slate-700">{d}</span>
                                <button 
                                    onClick={() => deleteDomain(d)}
                                    className="text-rose-500 hover:bg-rose-50 p-1 rounded transition"
                                >
                                    <Icon name="close" className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Subdomain Management */}
                <Card className="p-6">
                     <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Subdomains & Weighting</h2>
                        <div className="flex flex-col gap-3">
                            <select 
                                value={selectedDomainForSub} 
                                onChange={(e) => setSelectedDomainForSub(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                            >
                                {domains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <input 
                                    value={newSubdomain}
                                    onChange={(e) => setNewSubdomain(e.target.value)}
                                    placeholder="Name"
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                                />
                                <input 
                                    type="number"
                                    value={newSubdomainMax}
                                    onChange={(e) => setNewSubdomainMax(Number(e.target.value))}
                                    placeholder="Max"
                                    className="w-16 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                                />
                                <button 
                                    onClick={handleAddSubdomain}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {selectedDomainForSub && subdomains[selectedDomainForSub]?.map(sub => (
                             <div key={sub.name} className="flex justify-between items-center p-2 bg-white border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <span className="text-sm text-slate-700 font-medium block">{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingSub?.name === sub.name && editingSub?.domain === selectedDomainForSub ? (
                                        <>
                                            <input 
                                                type="number" 
                                                className="w-12 px-1 py-0.5 border border-blue-300 rounded text-xs font-bold"
                                                value={editMaxScore}
                                                onChange={(e) => setEditMaxScore(Number(e.target.value))}
                                                autoFocus
                                            />
                                            <button onClick={saveEditing} className="text-xs text-green-600 font-bold">Save</button>
                                        </>
                                    ) : (
                                        <div 
                                            className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-500 cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => startEditing(sub, selectedDomainForSub)}
                                            title="Click to edit score"
                                        >
                                            / {sub.maxScore} pts
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => deleteSubdomain(selectedDomainForSub, sub.name)}
                                        className="text-gray-400 hover:text-rose-500 transition ml-2"
                                    >
                                        <Icon name="close" className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!selectedDomainForSub || !subdomains[selectedDomainForSub]?.length) && (
                            <p className="text-sm text-gray-400 italic text-center py-4">No subdomains found.</p>
                        )}
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

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            deleteStudent(id);
        }
    };
    
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                     <h2 className="text-xl font-bold text-slate-800">Class Roster: {classProfile?.className || 'General'}</h2>
                     <p className="text-slate-500 text-sm">Manage student details and accounts.</p>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Level</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Assessments</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <img src={student.photoUrl} className="w-8 h-8 rounded-full bg-gray-200 object-cover" alt=""/>
                                        <span className="font-medium text-slate-800">{student.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600">{student.level}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{student.assessments.length} logged</td>
                                <td className="py-3 px-4 text-right flex justify-end gap-2">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(student);
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline bg-white rounded px-2 py-1 border border-transparent hover:border-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                     <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(student.id, student.name);
                                        }}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline bg-white rounded px-2 py-1 border border-transparent hover:border-rose-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddStudentModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} 
                studentToEdit={editingStudent}
            />
        </Card>
    );
};
