
import React from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { Icon } from '../common/Icon';

interface AtRiskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    atRiskStudents: Student[];
    domainCount: number;
}

export const AtRiskDetailsModal: React.FC<AtRiskDetailsModalProps> = ({ isOpen, onClose, atRiskStudents, domainCount }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Intervention Required: At-Risk Students" size="lg">
            <div className="space-y-4">
                <p className="text-gray-500 text-sm">
                    The following students have been flagged by the system due to low average scores (below 65%) or significant negative growth trends.
                </p>
                
                {atRiskStudents.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-rose-50 border-b border-rose-100">
                                <tr>
                                    <th className="py-3 px-4 text-xs font-bold text-rose-800 uppercase">Student</th>
                                    <th className="py-3 px-4 text-xs font-bold text-rose-800 uppercase">Alert Reason</th>
                                    <th className="py-3 px-4 text-xs font-bold text-rose-800 uppercase">Growth</th>
                                    <th className="py-3 px-4 text-xs font-bold text-rose-800 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {atRiskStudents.map(student => {
                                    const latest = student.assessments[student.assessments.length - 1];
                                    const avg = latest 
                                        ? Math.round((Object.values(latest.scores) as number[]).reduce((a, b) => a + b, 0) / domainCount)
                                        : 0;
                                    
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={student.photoUrl} className="w-8 h-8 rounded-full bg-gray-200" alt=""/>
                                                    <div>
                                                        <span className="font-bold text-slate-800 block">{student.name}</span>
                                                        <span className="text-xs text-slate-500">{student.level}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md inline-block w-fit">
                                                        {student.interventionStatus?.triggerReason || 'General Alert'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-1">Tier {student.interventionStatus?.tier || 1} Intervention</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className={`flex items-center font-semibold ${student.overallGrowth < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    <Icon name={student.overallGrowth >= 0 ? 'trendUp' : 'trendDown'} className="w-4 h-4 mr-1"/>
                                                    {student.overallGrowth > 0 ? '+' : ''}{student.overallGrowth}%
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <div className="bg-emerald-100 p-3 rounded-full inline-block mb-3">
                             <Icon name="check" className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-gray-700 font-medium">No students currently flagged.</p>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
