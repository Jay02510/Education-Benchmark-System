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
    default: "bg-white border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)]",
    glass: "bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.04)]",
    paper: "bg-[#FCFCFB] border border-[#F1F1EF] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.02)] relative before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] before:opacity-5 before:pointer-events-none",
    intelligence: "bg-slate-900 border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.2)] text-white"
  };

  const clickableClasses = onClick ? "cursor-pointer hover:shadow-[0_40px_80px_rgba(99,102,241,0.12)] hover:-translate-y-2 active:scale-[0.97] hover:border-indigo-100" : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};