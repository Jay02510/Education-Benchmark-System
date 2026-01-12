import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useStudents } from '../../context/StudentContext';
import { Icon } from '../common/Icon';
import { Student } from '../../types';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentToEdit?: Student | null; // Optional prop for edit mode
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, studentToEdit }) => {
    const { addStudent, updateStudent, classProfile } = useStudents();
    const [name, setName] = useState('');
    const [level, setLevel] = useState(classProfile?.gradeLevel || '5');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (studentToEdit) {
                setName(studentToEdit.name);
                setLevel(studentToEdit.level);
                setPhotoUrl(studentToEdit.photoUrl);
            } else {
                setName('');
                setLevel(classProfile?.gradeLevel || '5');
                setPhotoUrl('');
            }
        }
    }, [isOpen, studentToEdit, classProfile]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setPhotoUrl(base64);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const generateRandomAvatar = () => {
        const finalSeed = name.trim() ? `${name.trim()}-${Math.random()}` : Math.random().toString();
        setPhotoUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${finalSeed}`);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;

        // Default avatar if none provided
        const finalPhotoUrl = photoUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`;

        if (studentToEdit) {
            const updated: Student = {
                ...studentToEdit,
                name: name.trim(),
                level: level,
                photoUrl: finalPhotoUrl
            };
            updateStudent(updated);
        } else {
            const newStudent: Student = {
                id: `s-${Date.now()}`,
                name: name.trim(),
                level: level,
                class: classProfile?.className || 'General',
                photoUrl: finalPhotoUrl,
                overallGrowth: 0,
                growthVelocity: 0,
                hasAnomaly: false,
                assessments: [],
                interventionStatus: null,
                actionLog: [],
            };
            addStudent(newStudent);
        }
        
        setName('');
        setPhotoUrl('');
        onClose();
    };

    if (!isOpen) return null;

    const previewUrl = photoUrl.trim() || (name.trim() ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}` : null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={studentToEdit ? "Edit Student Record" : "Add New Student"}>
            <div className="space-y-6">
                {/* Profile Photo Management */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                        <div className={`w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${isUploading ? 'opacity-50' : 'group-hover:ring-4 group-hover:ring-indigo-100'}`}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Icon name="students" className="w-12 h-12 text-slate-300" />
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Icon name="plus" className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={triggerFileInput}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
                        >
                            <Icon name="admin" className="w-3 h-3" /> {/* Using admin icon as a 'file' placeholder */}
                            Upload Photo
                        </button>
                        <button 
                            onClick={generateRandomAvatar}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
                        >
                            <Icon name="refresh" className="w-3 h-3" />
                            AI Avatar
                        </button>
                    </div>
                    {isUploading && <p className="text-[10px] font-bold text-indigo-600 mt-2 animate-pulse">Processing Image...</p>}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Student Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alexander Hamilton"
                            className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800"
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Assigned Grade Level</label>
                        <select 
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800"
                        >
                            <option value="5">Level 5 (Pre-A1)</option>
                            <option value="6-1">Level 6-1 (Starters)</option>
                            <option value="6-2">Level 6-2 (Movers)</option>
                            <option value="7-2">Level 7-2 (Flyers)</option>
                            <option value="7-3">Level 7-3 (KET/PET)</option>
                        </select>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="flex gap-3">
                            <Icon name="info" className="w-5 h-5 text-indigo-500 shrink-0" />
                            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                                <strong>Professional Tip:</strong> Using real photos makes printed report cards significantly more professional for parents.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!name.trim() || isUploading}
                        className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center space-x-2"
                    >
                        <Icon name={studentToEdit ? "check" : "plus"} className="w-4 h-4" />
                        <span>{studentToEdit ? "Update Student" : "Add to Roster"}</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};