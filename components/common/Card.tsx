import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  // Modern aesthetic: Rounded-3xl, soft diffused shadows, subtle border
  const baseClasses = "bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 ease-out";
  const clickableClasses = onClick ? "cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-100" : "";
  
  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};