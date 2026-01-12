
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useStudents } from '../../context/StudentContext';
import { Icon } from '../common/Icon';
import { Student } from '../../types';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, studentToEdit }) => {
    const { addStudent, updateStudent, classProfile } = useStudents();
    const [name, setName] = useState('');
    const [level, setLevel] = useState(classProfile?.gradeLevel || '5');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    
    // Cropper State
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
            setShowCropper(false);
            setOriginalImage(null);
        }
    }, [isOpen, studentToEdit, classProfile]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setOriginalImage(base64);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setShowCropper(true);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const applyCrop = () => {
        const canvas = canvasRef.current;
        const cropper = cropperRef.current;
        if (!canvas || !cropper || !originalImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            const size = 512;
            canvas.width = size;
            canvas.height = size;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, size, size);

            const displaySize = cropper.offsetWidth;
            const centerX = size / 2;
            const centerY = size / 2;
            
            const aspect = img.width / img.height;
            let iw, ih;
            if (aspect > 1) {
                ih = displaySize;
                iw = displaySize * aspect;
            } else {
                iw = displaySize;
                ih = displaySize / aspect;
            }

            const finalScale = (size / displaySize) * zoom;
            ctx.clearRect(0,0,size,size);
            ctx.save();
            ctx.translate(centerX + offset.x * (size/displaySize), centerY + offset.y * (size/displaySize));
            ctx.scale(finalScale, finalScale);
            ctx.drawImage(img, -iw/2, -ih/2, iw, ih);
            ctx.restore();

            setPhotoUrl(canvas.toDataURL('image/jpeg', 0.9));
            setShowCropper(false);
        };
        img.src = originalImage;
    };

    const generateRandomAvatar = () => {
        const finalSeed = name.trim() ? `${name.trim()}-${Math.random()}` : Math.random().toString();
        setPhotoUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${finalSeed}`);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const finalPhotoUrl = photoUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`;

        if (studentToEdit) {
            updateStudent({ ...studentToEdit, name: name.trim(), level, photoUrl: finalPhotoUrl });
        } else {
            addStudent({
                id: `s-${Date.now()}`,
                name: name.trim(),
                level,
                class: classProfile?.className || 'General',
                photoUrl: finalPhotoUrl,
                overallGrowth: 0,
                growthVelocity: 0,
                hasAnomaly: false,
                assessments: [],
                interventionStatus: null,
                actionLog: [],
            });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={studentToEdit ? "Edit Profile" : "Add Student"} size={showCropper ? 'lg' : 'md'}>
            <div className="space-y-6">
                {showCropper ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-6 text-center">
                            <h3 className="font-black text-slate-800 text-lg">Portrait Alignment</h3>
                            <p className="text-xs text-slate-500 font-medium">Position the face inside the white circle</p>
                        </div>
                        
                        <div 
                            ref={cropperRef}
                            className="relative w-72 h-72 mx-auto rounded-[3rem] overflow-hidden bg-slate-900 cursor-move border-4 border-white shadow-2xl group"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img 
                                src={originalImage!} 
                                alt="" 
                                className="absolute pointer-events-none transition-transform duration-75 select-none"
                                style={{
                                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                                    top: '50%',
                                    left: '50%',
                                    maxWidth: 'none',
                                    maxHeight: '100%'
                                }}
                            />
                            {/* Visual Safe Zone Circle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[90%] h-[90%] rounded-full border-2 border-white/40 ring-[200px] ring-black/40"></div>
                            </div>
                        </div>

                        <div className="mt-8 px-10">
                            <div className="flex items-center gap-4">
                                <Icon name="search" className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="4" 
                                    step="0.01" 
                                    value={zoom} 
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <Icon name="plus" className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 mt-8">
                            <button onClick={() => setShowCropper(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition">Cancel</button>
                            <button onClick={applyCrop} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95">Set Profile Photo</button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className={`w-32 h-32 rounded-[2.8rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${isUploading ? 'opacity-50' : 'group-hover:ring-4 group-hover:ring-indigo-100'}`}>
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon name="students" className="w-12 h-12 text-slate-300" />
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Icon name="plus" className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5">
                                    <Icon name="admin" className="w-3 h-3 text-indigo-500" />
                                    Upload
                                </button>
                                <button onClick={generateRandomAvatar} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5">
                                    <Icon name="brain" className="w-3 h-3 text-purple-500" />
                                    AI Avatar
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alice Chen"
                                    className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Benchmark Level</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800">
                                    <option value="5">Level 5 (Pre-A1)</option>
                                    <option value="6-1">Level 6-1 (Starters)</option>
                                    <option value="6-2">Level 6-2 (Movers)</option>
                                    <option value="7-2">Level 7-2 (Flyers)</option>
                                    <option value="7-3">Level 7-3 (KET/PET)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                            <button onClick={onClose} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition">Cancel</button>
                            <button onClick={handleSubmit} disabled={!name.trim()} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95 flex items-center space-x-2">
                                <Icon name={studentToEdit ? "check" : "plus"} className="w-4 h-4" />
                                <span>{studentToEdit ? "Update Student" : "Add to Roster"}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
