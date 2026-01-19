import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useStudents } from '../../context/StudentContext';
import { useNavigation } from '../../context/NavigationContext';
import { TABS } from '../../constants';

export const CommandCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { students } = useStudents();
    const { navigateToStudent, setActiveTab } = useNavigation();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const results = query.length > 1 ? students.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200000] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={() => setIsOpen(false)}>
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-6 py-4 border-b border-slate-100">
                    <Icon name="search" className="w-5 h-5 text-slate-400 mr-4" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search students, standards, or resources... (Esc to close)" 
                        className="flex-1 text-lg font-bold text-slate-800 outline-none placeholder-slate-300"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5 ml-4">
                        <kbd className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-black text-slate-400">ESC</kbd>
                    </div>
                </div>
                
                <div className="p-4">
                    {query.length === 0 ? (
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <button onClick={() => { setActiveTab(TABS.STUDENTS); setIsOpen(false); }} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all text-left">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Icon name="students" className="w-5 h-5" /></div>
                                <span className="font-bold text-slate-700">Go to Roster</span>
                            </button>
                            <button onClick={() => { setActiveTab(TABS.ANALYTICS); setIsOpen(false); }} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 hover:bg-purple-50 hover:border-purple-100 transition-all text-left">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Icon name="analytics" className="w-5 h-5" /></div>
                                <span className="font-bold text-slate-700">Class Insights</span>
                            </button>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profiles</p>
                            {results.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => { navigateToStudent(s.id); setIsOpen(false); }}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden"><img src={s.photoUrl} className="w-full h-full object-cover" alt="" /></div>
                                        <div>
                                            <p className="font-black text-slate-800">{s.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Level {s.level}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.growthVelocity >= 10 ? 'bg-emerald-50 text-emerald-600' : s.growthVelocity < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {s.growthVelocity}% Velocity
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400">
                            <Icon name="search" className="w-10 h-10 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No institutional matches for "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};