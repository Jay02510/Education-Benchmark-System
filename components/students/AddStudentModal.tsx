
import React, { useState, useEffect } from 'react';
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

    const generateRandomAvatar = () => {
        const seed = name.trim() || Math.random().toString(36).substring(7);
        // Use a different seed if name is empty to allow randomizing before typing
        const finalSeed = name.trim() ? `${name.trim()}-${Math.random()}` : Math.random().toString();
        setPhotoUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${finalSeed}`);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;

        // Default avatar if none provided
        const finalPhotoUrl = photoUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`;

        if (studentToEdit) {
            // Edit Mode
            const updated: Student = {
                ...studentToEdit,
                name: name.trim(),
                level: level,
                photoUrl: finalPhotoUrl
            };
            updateStudent(updated);
        } else {
            // Add Mode
            const newStudent: Student = {
                id: `s-${Date.now()}`,
                name: name.trim(),
                level: level,
                class: classProfile?.className || 'General',
                photoUrl: finalPhotoUrl,
                overallGrowth: 0,
                hasAnomaly: false,
                assessments: [],
                interventionStatus: null,
            };
            addStudent(newStudent);
        }
        
        setName('');
        setPhotoUrl('');
        onClose();
    };

    if (!isOpen) return null;

    // Helper to visualize current photo or placeholder
    const previewUrl = photoUrl.trim() || (name.trim() ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}` : null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={studentToEdit ? "Edit Student" : "Add New Student"}>
            <div className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Icon name="students" className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <button 
                            onClick={generateRandomAvatar}
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 text-indigo-600 transition"
                            title="Randomize Avatar"
                        >
                            <Icon name="refresh" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="5">Level 5</option>
                        <option value="6-1">Level 6-1</option>
                        <option value="6-2">Level 6-2</option>
                        <option value="7-2">Level 7-2</option>
                        <option value="7-3">Level 7-3</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL (Optional)</label>
                    <input 
                        type="text" 
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-600"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to auto-generate an avatar based on name.</p>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <Icon name={studentToEdit ? "check" : "plus"} className="w-4 h-4" />
                        <span>{studentToEdit ? "Save Changes" : "Add Student"}</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};
