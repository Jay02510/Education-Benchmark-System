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
        <div className="fixed inset-0 z-[200000] bg-black/60 flex items-start justify-center pt-[15vh] px-4 font-sans" onClick={() => setIsOpen(false)}>
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[4px] shadow-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-6 py-4 border-b border-zinc-900">
                    <Icon name="search" className="w-4 h-4 text-zinc-500 mr-4 shrink-0" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search student directories, parameters, or insights... (Esc to close)" 
                        className="flex-1 text-xs text-zinc-200 outline-none placeholder-zinc-650 bg-transparent font-sans"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1.5 ml-4">
                        <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded text-[9px] font-mono text-zinc-500">ESC</kbd>
                    </div>
                </div>
                
                <div className="p-4 bg-zinc-950">
                    {query.length === 0 ? (
                        <div className="grid grid-cols-2 gap-3 p-2 select-none">
                            <button 
                                onClick={() => { setActiveTab(TABS.STUDENTS); setIsOpen(false); }} 
                                className="flex items-center gap-3 p-4 rounded-[4px] border border-zinc-90 w-full hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
                            >
                                <div className="p-2 bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] rounded-[4px] border border-[oklch(0.72_0.18_145)]/20 shrink-0"><Icon name="students" className="w-4 h-4" /></div>
                                <div>
                                    <span className="text-xs font-semibold text-zinc-250 block">Go to Roster</span>
                                    <span className="text-[9px] text-zinc-500 mt-0.5 italic block">Standard profiles view</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => { setActiveTab(TABS.INSIGHTS); setIsOpen(false); }} 
                                className="flex items-center gap-3 p-4 rounded-[4px] border border-zinc-9 w-full hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
                            >
                                <div className="p-2 bg-zinc-900 text-zinc-400 rounded-[4px] border border-zinc-85 shrink-0"><Icon name="analytics" className="w-4 h-4" /></div>
                                <div>
                                    <span className="text-xs font-semibold text-zinc-250 block">Class Insights</span>
                                    <span className="text-[9px] text-zinc-500 mt-0.5 block italic">Aggregated analytics tab</span>
                                </div>
                            </button>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            <p className="px-3 py-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wider select-none">Student Profiles matched</p>
                            {results.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => { navigateToStudent(s.id); setIsOpen(false); }}
                                    className="w-full flex items-center justify-between p-3 rounded-[4px] hover:bg-zinc-900/30 transition-all text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-[4px] bg-zinc-900 overflow-hidden shrink-0 select-none"><img src={s.photoUrl} className="w-full h-full object-cover" alt="" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-200">{s.name}</p>
                                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mt-0.5">Level {s.level}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono uppercase tracking-wider shrink-0 mr-1 select-none border ${
                                        s.growthVelocity >= 10 
                                            ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)]/20' 
                                            : s.growthVelocity < 0 
                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                                : 'bg-zinc-900 text-zinc-500 border-zinc-850'
                                    }`}>
                                        {s.growthVelocity}% Velocity
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-zinc-550 select-none">
                            <Icon name="search" className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="text-xs leading-relaxed font-sans">No institutional matches found for query "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
