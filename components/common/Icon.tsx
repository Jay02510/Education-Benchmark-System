
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

const icons: Record<string, (props: any) => React.ReactNode> = {
  students: (props) => (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...props} />
      <circle cx="8.5" cy="7" r="4" {...props} />
      <line x1="20" y1="8" x2="20" y2="14" {...props} />
      <line x1="23" y1="11" x2="17" y2="11" {...props} />
    </>
  ),
  benchmark: (props) => (
    <>
      <path d="M3 3v18h18" {...props} />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" {...props} />
    </>
  ),
  analytics: (props) => (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" {...props} />
      <line x1="16" y1="2" x2="16" y2="6" {...props} />
      <line x1="8" y1="2" x2="8" y2="6" {...props} />
      <line x1="3" y1="10" x2="21" y2="10" {...props} />
    </>
  ),
  settings: (props) => (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" {...props} />
      <circle cx="12" cy="12" r="3" {...props} />
    </>
  ),
  admin: (props) => (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...props} />
      <path d="M8 11h8" {...props} />
      <path d="M12 15V7" {...props} />
    </>
  ),
  alert: (props) => (
    <>
      <path d="M12 9v4" {...props} />
      <path d="M12 17h.01" {...props} />
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" {...props} />
    </>
  ),
  arrowUp: (props) => <path d="M12 19V5m-7 7l7-7 7 7" {...props} />,
  arrowDown: (props) => <path d="M12 5v14m7-7l-7 7-7-7" {...props} />,
  arrowRight: (props) => <path d="M5 12h14m-7-7l7 7-7 7" {...props} />,
  chevronLeft: (props) => <path d="M15 18l-6-6 6-6" {...props} />,
  trendUp: (props) => <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...props} />,
  trendDown: (props) => <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" {...props} />,
  trendStable: (props) => <line x1="5" y1="12" x2="19" y2="12" {...props} />,
  check: (props) => <polyline points="20 6 9 17 4 12" {...props} />,
  plus: (props) => (
    <>
      <line x1="12" y1="5" x2="12" y2="19" {...props} />
      <line x1="5" y1="12" x2="19" y2="12" {...props} />
    </>
  ),
  close: (props) => (
    <>
      <line x1="18" y1="6" x2="6" y2="18" {...props} />
      <line x1="6" y1="6" x2="18" y2="18" {...props} />
    </>
  ),
  library: (props) => (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...props} />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...props} />
    </>
  ),
  brain: (props) => (
    <>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" {...props} />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" {...props} />
    </>
  ),
  robot: (props) => (
    <>
      <path d="M12 8V4H8" {...props} />
      <rect width="16" height="12" x="4" y="8" rx="2" {...props} />
      <path d="M2 14h2" {...props} />
      <path d="M20 14h2" {...props} />
      <path d="M15 13v2" {...props} />
      <path d="M9 13v2" {...props} />
    </>
  ),
  chat: (props) => (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...props} />
    </>
  ),
  logout: (props) => (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...props} />
      <polyline points="16 17 21 12 16 7" {...props} />
      <line x1="21" y1="12" x2="9" y2="12" {...props} />
    </>
  ),
  search: (props) => (
    <>
      <circle cx="11" cy="11" r="8" {...props} />
      <line x1="21" y1="21" x2="16.65" y2="16.65" {...props} />
    </>
  ),
  menu: (props) => (
    <>
      <line x1="3" y1="12" x2="21" y2="12" {...props} />
      <line x1="3" y1="6" x2="21" y2="6" {...props} />
      <line x1="3" y1="18" x2="21" y2="18" {...props} />
    </>
  ),
  star: (props) => (
    <path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        fill="currentColor" 
        stroke="none" 
        {...props} 
    />
  ),
  shield: (props) => (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...props} />
  ),
  globe: (props) => (
    <>
      <circle cx="12" cy="12" r="10" {...props} />
      <line x1="2" y1="12" x2="22" y2="12" {...props} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" {...props} />
    </>
  ),
  refresh: (props) => (
    <>
        <path d="M23 4v6h-6" {...props} />
        <path d="M1 20v-6h6" {...props} />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" {...props} />
    </>
  ),
  info: (props) => (
    <>
        <circle cx="12" cy="12" r="10" {...props} />
        <line x1="12" y1="16" x2="12" y2="12" {...props} />
        <line x1="12" y1="8" x2="12.01" y2="8" {...props} />
    </>
  ),
  book: (props) => (
    <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...props} />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...props} />
    </>
  ),
  help: (props) => (
    <>
      <circle cx="12" cy="12" r="10" {...props} />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" {...props} />
      <line x1="12" y1="17" x2="12.01" y2="17" {...props} />
    </>
  )
};

export const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', strokeWidth = 2 }) => {
  const IconRender = icons[name];

  if (!IconRender) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {IconRender({})}
    </svg>
  );
};
