
import React from 'react';
import { Student } from '../../types';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { Tooltip } from '../common/Tooltip';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  const latestAssessment = student.assessments[student.assessments.length - 1];
  const latestAvg = latestAssessment 
      ? Math.round((Object.values(latestAssessment.scores) as number[]).reduce((a, b) => a + b, 0) / Object.keys(latestAssessment.scores).length) 
      : 0;

  // Determine Status Logic
  let statusText = 'On Track';
  let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  let glowColor = 'group-hover:shadow-emerald-200/50';

  if (student.hasAnomaly) {
      statusText = 'Intervention';
      statusColor = 'text-rose-600 bg-rose-50 border-rose-100';
      glowColor = 'group-hover:shadow-rose-200/50';
  } else if (latestAvg >= 85) {
      statusText = 'Mastery';
      statusColor = 'text-indigo-600 bg-indigo-50 border-indigo-100';
      glowColor = 'group-hover:shadow-indigo-200/50';
  } else if (student.overallGrowth <= -5) {
      statusText = 'Monitor'; 
      statusColor = 'text-amber-600 bg-amber-50 border-amber-100';
      glowColor = 'group-hover:shadow-amber-200/50';
  }

  return (
    <Card 
        variant="glass"
        className={`group p-6 flex flex-col items-center text-center border-white/60 hover:border-white ${glowColor}`} 
        onClick={onClick}
    >
      {/* Dynamic Status Indicator */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter transition-all duration-500 z-20 ${statusColor}`}>
        {statusText}
      </div>
      
      {/* Avatar with dynamic ring and intervention badge */}
      <div className="relative mb-6 mt-2">
          <div className={`absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${student.hasAnomaly ? 'bg-rose-400' : 'bg-indigo-400'}`}></div>
          
          {/* Status Badge Over Image */}
          {student.hasAnomaly && (
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-rose-500 rounded-full border-2 border-white shadow-lg z-30 flex items-center justify-center animate-bounce">
                <Icon name="alert" className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          )}

          <div className="relative w-24 h-24 rounded-[2.5rem] bg-white p-1 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden z-10">
            <img 
                src={student.photoUrl} 
                alt={student.name} 
                className="w-full h-full object-cover rounded-[2.2rem]" 
            />
          </div>
      </div>
      
      <h3 className="font-black text-slate-800 text-lg mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</h3>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">Level {student.level}</span>
      </div>
      
      {/* Performance Stats */}
      <div className="w-full grid grid-cols-2 gap-2 mt-auto">
         <div className="flex flex-col items-center py-3 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-all duration-300 border border-white/20">
             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
               <Tooltip content="Current skill level based on latest test results.">Proficiency</Tooltip>
             </span>
             <span className="text-sm font-black text-slate-700">{latestAvg}%</span>
         </div>
         <div className="flex flex-col items-center py-3 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-all duration-300 border border-white/20">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
                <Tooltip content="The speed of improvement. Higher is faster learning.">Velocity</Tooltip>
              </span>
              <span className={`text-sm font-black ${student.growthVelocity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%
              </span>
         </div>
      </div>
    </Card>
  );
};
