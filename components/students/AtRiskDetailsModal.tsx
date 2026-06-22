import React from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { Icon } from '../common/Icon';
import { useNavigation } from '../../context/NavigationContext';

interface AtRiskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    atRiskStudents: Student[];
    domainCount: number;
}

export const AtRiskDetailsModal: React.FC<AtRiskDetailsModalProps> = ({ isOpen, onClose, atRiskStudents, domainCount }) => {
    const { navigateToStudent } = useNavigation();

    const handleViewStudent = (id: string) => {
        navigateToStudent(id);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Intervention Required: At-Risk Students" size="lg">
            <div className="space-y-5">
                <p className="text-zinc-400 text-xs font-sans">
                    The system identifies students requiring Tier 2/3 protocols based on negative velocity or scoring gaps.
                </p>
                
                {atRiskStudents.length > 0 ? (
                    <div className="border border-zinc-900 rounded-[4px] overflow-hidden bg-zinc-950">
                        <table className="w-full text-left border-collapse">
                             <thead className="bg-zinc-900/50 border-b border-zinc-900/80">
                                <tr>
                                    <th className="py-3.5 px-5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Student</th>
                                    <th className="py-3.5 px-5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Logic Trigger</th>
                                    <th className="py-3.5 px-5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/60 bg-transparent">
                                {atRiskStudents.map(student => (
                                    <tr key={student.id} className="group hover:bg-zinc-900/20 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[4px] bg-zinc-900 overflow-hidden border border-zinc-800 shrink-0">
                                                    <img src={student.photoUrl} className="w-full h-full object-cover filter brightness-90" alt=""/>
                                                </div>
                                                <div>
                                                    <span className="font-normal text-zinc-150 block text-xs mb-0.5">{student.name}</span>
                                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Level {student.level}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-[4px] border border-rose-500/20 inline-block w-fit mb-0.5">
                                                    {student.interventionStatus?.triggerReason || 'Velocity Drop'}
                                                </span>
                                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider italic">Tier {student.interventionStatus?.tier || 2} Priority</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <button 
                                                onClick={() => handleViewStudent(student.id)}
                                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-750 text-zinc-300 border border-zinc-800 text-[10px] font-mono uppercase tracking-wider rounded-[4px] transition-colors cursor-pointer"
                                            >
                                                Open 360
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-zinc-900/20 rounded-[4px] border border-zinc-900">
                        <div className="bg-emerald-500/10 p-3 rounded-full inline-block mb-3 text-[oklch(0.72_0.18_145)] border border-emerald-500/20">
                             <Icon name="check" className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-sans text-zinc-250 mb-1">Operational Safety</h4>
                        <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">No Active Risk Protocols Found</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-zinc-900">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </Modal>
    );
};
