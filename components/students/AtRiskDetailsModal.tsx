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
            <div className="space-y-4">
                <p className="text-slate-500 text-sm font-medium">
                    The system identifies students requiring Tier 2/3 protocols based on negative velocity or scoring gaps.
                </p>
                
                {atRiskStudents.length > 0 ? (
                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-rose-50/50 border-b border-rose-100">
                                <tr>
                                    <th className="py-4 px-6 text-[10px] font-black text-rose-800 uppercase tracking-widest">Student</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-rose-800 uppercase tracking-widest">Logic Trigger</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-rose-800 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {atRiskStudents.map(student => (
                                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                                                    <img src={student.photoUrl} className="w-full h-full object-cover" alt=""/>
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-800 block leading-none mb-1">{student.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level {student.level}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 inline-block w-fit mb-1">
                                                    {student.interventionStatus?.triggerReason || 'Velocity Drop'}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Tier {student.interventionStatus?.tier || 2} Priority</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button 
                                                onClick={() => handleViewStudent(student.id)}
                                                className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
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
                    <div className="text-center py-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="bg-emerald-100 p-4 rounded-full inline-block mb-4 text-emerald-600 shadow-xl shadow-emerald-200">
                             <Icon name="check" className="w-8 h-8" strokeWidth={3} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">Operational Safety</h4>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Active Risk Protocols Found</p>
                    </div>
                )}

                <div className="flex justify-end pt-6">
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </Modal>
    );
};