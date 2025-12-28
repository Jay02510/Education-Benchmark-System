
import React from 'react';
import { Student } from '../../types';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  // Calculate Latest Avg first to use in status logic
  const latestAssessment = student.assessments[student.assessments.length - 1];
  const latestAvg = latestAssessment 
      ? Math.round((Object.values(latestAssessment.scores) as number[]).reduce((a, b) => a + b, 0) / Object.keys(latestAssessment.scores).length) 
      : 0;

  // Determine Status Logic with Priority
  let statusText = 'On Track';
  let statusColor = 'text-emerald-600 bg-emerald-50'; // Default Green

  if (student.hasAnomaly) {
      // Priority 1: System flagged Intervention (RTI Logic from Context)
      statusText = 'Intervention';
      statusColor = 'text-rose-600 bg-rose-50';
  } else if (latestAvg >= 85) {
      // Priority 2: High Performer (Mastery) - Overrides minor negative growth
      statusText = 'Mastery';
      statusColor = 'text-purple-600 bg-purple-50';
  } else if (student.overallGrowth <= -5) {
      // Priority 3: Significant drop AND not mastery
      statusText = 'Monitor'; 
      statusColor = 'text-amber-600 bg-amber-50';
  }

  return (
    <Card 
        className="group p-6 flex flex-col items-center text-center relative hover:-translate-y-2 transition-all duration-300 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-sm" 
        onClick={onClick}
    >
      {/* Alert Badge for Intervention Only */}
      {student.hasAnomaly && (
        <div className="absolute top-4 right-4 text-rose-500 bg-rose-50 p-1.5 rounded-full animate-pulse ring-4 ring-white" title="Attention Needed">
          <Icon name="alert" className="w-4 h-4" />
        </div>
      )}
      
      {/* Avatar */}
      <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src={student.photoUrl} 
            alt={student.name} 
            className="relative w-24 h-24 rounded-full object-cover border-[6px] border-white shadow-lg group-hover:scale-105 transition-transform duration-300" 
          />
      </div>
      
      {/* Info */}
      <h3 className="font-extrabold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors tracking-tight">{student.name}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 bg-slate-50 px-3 py-1 rounded-full">{student.level}</p>
      
      {/* Metrics */}
      <div className="w-full grid grid-cols-2 gap-3 mt-auto">
         <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50/50 transition-colors">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Latest Avg</span>
             <div className="flex items-center gap-1 text-sm font-black mt-0.5 text-slate-700">
                 {latestAvg}%
             </div>
         </div>
         <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50/50 transition-colors">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status</span>
              <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${statusColor}`}>
                  {statusText}
              </span>
         </div>
      </div>
    </Card>
  );
};
