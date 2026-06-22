import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useStudents } from '../../context/StudentContext';
import { Icon } from '../common/Icon';
import { Student, VelocityBand } from '../../types';

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
            
            ctx.fillStyle = '#09090b';
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
                velocityBand: VelocityBand.Stable,
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
            <div className="space-y-6 font-sans">
                {showCropper ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-4 text-center">
                            <h3 className="text-zinc-200 font-medium text-xs font-mono uppercase tracking-wider">Portrait Alignment</h3>
                            <p className="text-[10px] text-zinc-500 block mt-1">Position the avatar cleanly inside the ring</p>
                        </div>
                        
                        <div 
                            ref={cropperRef}
                            className="relative w-64 h-64 mx-auto rounded-[4px] overflow-hidden bg-zinc-900 cursor-move border border-zinc-805 shadow-2xl group"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img 
                                src={originalImage!} 
                                alt="" 
                                className="absolute pointer-events-none select-none max-w-none"
                                style={{
                                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                                    top: '50%',
                                    left: '50%',
                                    maxHeight: '100%'
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[85%] h-[85%] rounded-full border border-[oklch(0.72_0.18_145)]/40 ring-[200px] ring-black/40"></div>
                            </div>
                        </div>

                        <div className="mt-6 px-6">
                            <div className="flex items-center gap-3">
                                <Icon name="search" className="w-3.5 h-3.5 text-zinc-550" />
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="4" 
                                    step="0.01" 
                                    value={zoom} 
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[oklch(0.72_0.18_145)]"
                                />
                                <Icon name="plus" className="w-3.5 h-3.5 text-zinc-500" />
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-zinc-900">
                            <button 
                                onClick={() => setShowCropper(false)} 
                                className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={applyCrop} 
                                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-[4px] text-xs transition-colors cursor-pointer"
                            >
                                Set Portrait
                            </button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className={`w-24 h-24 rounded-[4px] bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center transition-all ${isUploading ? 'opacity-50' : 'hover:border-zinc-700'}`}>
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover filter brightness-95" />
                                    ) : (
                                        <Icon name="students" className="w-8 h-8 text-zinc-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[4px]">
                                        <Icon name="plus" className="w-6 h-6 text-zinc-100" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-zinc-90 w-full border border-zinc-900 hover:border-zinc-800 text-zinc-350 hover:text-zinc-200 text-[10px] font-mono uppercase tracking-wider rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer">
                                    <Icon name="admin" className="w-3 h-3 text-[oklch(0.72_0.18_145)]" />
                                    <span>Upload</span>
                                </button>
                                <button onClick={generateRandomAvatar} className="px-3 py-1.5 bg-zinc-90 w-full border border-zinc-900 hover:border-zinc-800 text-zinc-350 hover:text-zinc-200 text-[10px] font-mono uppercase tracking-wider rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer">
                                    <Icon name="brain" className="w-3 h-3 text-[oklch(0.72_0.18_145)]" />
                                    <span>AI Avatar</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider mb-1.5 ml-0.5 select-none animate-fade-in">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alice Chen"
                                    className="w-full px-3.5 py-2.5 border border-zinc-900 bg-zinc-950 text-zinc-150 rounded-[4px] focus:border-zinc-700 outline-none text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider mb-1.5 select-none ml-0.5">Benchmark Level</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2.5 border border-zinc-900 bg-zinc-950 text-zinc-150 rounded-[4px] focus:border-zinc-700 outline-none text-xs cursor-pointer select-none">
                                    <option value="5">Level 5 (Pre-A1)</option>
                                    <option value="6-1">Level 6-1 (Starters)</option>
                                    <option value="6-2">Level 6-2 (Movers)</option>
                                    <option value="7-2">Level 7-2 (Flyers)</option>
                                    <option value="7-3">Level 7-3 (KET/PET)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end gap-3 border-t border-zinc-900">
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={!name.trim()} 
                                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                            >
                                <Icon name={studentToEdit ? "check" : "plus"} className="w-3.5 h-3.5" />
                                <span>{studentToEdit ? "Update Student" : "Add to Roster"}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
