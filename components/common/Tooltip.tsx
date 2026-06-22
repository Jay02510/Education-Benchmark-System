import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-zinc-900 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900 border-l-transparent border-r-transparent border-t-transparent"
  };

  return (
    <div 
      className="relative inline-block font-sans"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="cursor-help border-b border-dashed border-zinc-600 pb-[1.5px] select-none hover:text-zinc-200">
        {children}
      </span>
      
      {isVisible && (
        <div className={`absolute z-[100] w-48 px-3.5 py-2 bg-zinc-90 w-full border border-zinc-850 rounded-[4px] shadow-xl text-[10px] text-zinc-350 leading-relaxed font-sans text-center animate-in fade-in zoom-in-95 duration-100 pointer-events-none ${positionClasses[position]}`}>
          {content}
          <div className={`absolute border-[5px] ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};
