import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'paper' | 'intelligence';
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, variant = 'default' }) => {
  const baseClasses = "rounded-[2.4rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden";
  
  const variantClasses = {
    default: "bg-white/90 backdrop-blur-lg border border-slate-200/50 shadow-premium hover:shadow-premium-hover transition-all duration-300",
    glass: "bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.03)] hover:border-white/80 hover:bg-white/65 transition-all duration-300",
    paper: "bg-[#fcfdfa] border border-[#ecece8] shadow-[0_12px_30px_rgba(40,40,30,0.03)] relative before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] before:opacity-[0.03] before:pointer-events-none transition-all duration-300",
    intelligence: "bg-[#0b0f19]/95 backdrop-blur-xl border border-[#1e293b]/50 shadow-[0_30px_60px_rgba(7,10,19,0.2)] text-white hover:border-indigo-500/20 transition-all duration-300"
  };

  const clickableClasses = onClick ? "cursor-pointer hover:-translate-y-1.5 active:scale-[0.98] ring-1 ring-transparent hover:ring-indigo-500/10" : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};