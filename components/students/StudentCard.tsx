import React from 'react';
import { Student, VelocityBand } from '../../types';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  const latestAssessment = student.assessments[student.assessments.length - 1];
  
  // Calculate average score safely
  const scores = latestAssessment ? Object.values(latestAssessment.scores).filter(s => typeof s === 'number') : [];
  const latestAvg = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;

  // Determine exactly 3 states: Fast, At Risk, or Stable
  const isFast = student.growthVelocity >= 10 || student.velocityBand === VelocityBand.Fast;
  const isAtRisk = student.growthVelocity < 0 || student.velocityBand === VelocityBand.AtRisk || student.hasAnomaly;
  
  const statusLabel = isAtRisk ? 'At Risk' : isFast ? 'Fast Track' : 'Stable';

  // Left status border
  const statusBorderClass = isAtRisk 
    ? 'border-l-2 border-l-[oklch(0.65_0.20_25)]' 
    : isFast 
      ? 'border-l-2 border-l-[oklch(0.72_0.18_145)]' 
      : 'border-l-2 border-l-[oklch(0.60_0_0_/_0.25)]';

  const statusTextClass = isAtRisk 
    ? 'text-[oklch(0.65_0.20_25)]' 
    : isFast 
      ? 'text-[oklch(0.72_0.18_145)]' 
      : 'text-[oklch(0.60_0_0)]';

  return (
    <div 
        onClick={onClick}
        id={`student-card-${student.id}`}
        className={`flex flex-col p-5 bg-[oklch(0.14_0.01_250)] border-t border-b border-r border-l-2 border-[oklch(0.60_0_0_/_0.15)] ${statusBorderClass} rounded-none shadow-none hover:bg-[oklch(0.18_0.01_250)] transition-colors text-left cursor-pointer select-none group w-full h-full`}
    >
      {/* Risk and Status Label using Mono */}
      <div className="mb-3">
        <span className={`font-mono text-[10px] font-semibold tracking-wide uppercase ${statusTextClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Avatar and Info Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-medium text-white text-base tracking-tight truncate leading-tight group-hover:text-[oklch(0.72_0.18_145)] transition-colors">
            {student.name}
          </h3>
          <p className="font-mono text-[11px] text-[oklch(0.60_0_0)] uppercase tracking-normal mt-1">
            Level {student.level}
          </p>
        </div>
        <div className="w-10 h-10 shrink-0 bg-zinc-950/40 border border-[oklch(0.60_0_0_/_0.15)] overflow-hidden">
          <img 
            src={student.photoUrl} 
            alt={student.name} 
            className="w-full h-full object-cover filter brightness-90 contrast-110" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      
      {/* Performance Stats - tabular-nums, right-aligned, IBM Plex Mono values */}
      <div className="mt-auto space-y-2 pt-3 border-t border-[oklch(0.60_0_0_/_0.10)]">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] text-[oklch(0.60_0_0)]">Latest Avg</span>
          <span className="font-mono text-xs text-right text-zinc-100 font-medium tabular-nums">
            {latestAvg}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] text-[oklch(0.60_0_0)]">Velocity Growth</span>
          <span className={`font-mono text-xs text-right font-medium tabular-nums ${student.growthVelocity >= 0 ? 'text-[oklch(0.72_0.18_145)]' : 'text-[oklch(0.65_0.20_25)]'}`}>
            {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%
          </span>
        </div>
      </div>
    </div>
  );
};
