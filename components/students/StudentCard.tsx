
import React from 'react';
import { Student, VelocityBand } from '../../types';
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

  // Semantic Logic Triggers
  let badgeColor = 'bg-slate-100 text-slate-400';
  let badgeLabel = 'Stable';
  let badgeIcon = 'check';

  if (student.growthVelocity >= 10) {
      badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      badgeLabel = 'Fast track';
      badgeIcon = 'trendUp';
  } else if (student.growthVelocity < -8) {
      badgeColor = 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse';
      badgeLabel = 'Regression';
      badgeIcon = 'alert';
  } else if (student.growthVelocity < 0) {
      badgeColor = 'bg-orange-50 text-orange-600 border-orange-100';
      badgeLabel = 'Stalling';
      badgeIcon = 'alert';
  }

  return (
    <Card 
        variant="glass"
        className="group p-6 flex flex-col items-center text-center border-white/60 hover:border-white transition-all duration-300 relative" 
        onClick={onClick}
    >
      {/* Dynamic Velocity Rail */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${student.growthVelocity >= 10 ? 'bg-emerald-400' : student.growthVelocity < 0 ? 'bg-rose-400' : 'bg-indigo-400 opacity-20'}`}></div>

      {/* Intelligence Badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 z-20 ${badgeColor}`}>
        <Icon name={badgeIcon} className="w-2.5 h-2.5" />
        {badgeLabel}
      </div>
      
      {/* Avatar Section */}
      <div className="relative mb-6 mt-2">
          <div className="relative w-20 h-20 rounded-[2rem] bg-white p-1 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden z-10">
            <img 
                src={student.photoUrl} 
                alt={student.name} 
                className="w-full h-full object-cover rounded-[1.8rem]" 
            />
          </div>
      </div>
      
      <h3 className="font-black text-slate-800 text-md mb-1 tracking-tight group-hover:text-indigo-600 transition-colors truncate w-full">{student.name}</h3>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Level {student.level}</span>
      </div>
      
      {/* Performance Stats */}
      <div className="w-full grid grid-cols-2 gap-2 mt-auto">
         <div className="flex flex-col items-center py-2.5 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-all duration-300 border border-white/20">
             <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
               <Tooltip content="Current average across all tested subjects.">Score</Tooltip>
             </span>
             <span className="text-xs font-black text-slate-700">{latestAvg}%</span>
         </div>
         <div className="flex flex-col items-center py-2.5 bg-white/40 rounded-2xl group-hover:bg-white/80 transition-all duration-300 border border-white/20">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
                <Tooltip content="Percentage points gained or lost since last test cycle.">Growth Rate</Tooltip>
              </span>
              <span className={`text-xs font-black ${student.growthVelocity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%
              </span>
         </div>
      </div>
    </Card>
  );
};
