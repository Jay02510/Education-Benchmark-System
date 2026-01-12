
import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent"
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="cursor-help border-b border-dotted border-current pb-px">
        {children}
      </span>
      
      {isVisible && (
        <div className={`absolute z-[100] w-48 px-4 py-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 text-[11px] font-bold text-slate-600 leading-relaxed animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${positionClasses[position]}`}>
          {content}
          <div className={`absolute border-[6px] ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};
