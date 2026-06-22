import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'paper' | 'intelligence';
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, variant = 'default' }) => {
  const baseClasses = "rounded-[4px] transition-all duration-300 overflow-hidden";
  
  const variantClasses = {
    default: "bg-zinc-950 border border-zinc-900 text-zinc-100 shadow-md",
    glass: "bg-zinc-950 border border-zinc-900 text-zinc-100 shadow-md",
    paper: "bg-zinc-950 border border-zinc-900 text-zinc-100 shadow-md",
    intelligence: "bg-zinc-950 border border-zinc-900 text-zinc-100 shadow-md"
  };

  const clickableClasses = onClick ? "cursor-pointer hover:border-zinc-800 active:scale-[0.99]" : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};
