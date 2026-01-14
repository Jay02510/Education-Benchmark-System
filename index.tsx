import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * Enhanced System Initialization Kernel
 * Ensures process.env.API_KEY is available globally and synchronized.
 */
(function kernelBootstrap() {
  if (typeof window !== 'undefined') {
    const win = window as any;
    
    // 1. Initialize process hierarchy if missing
    if (!win.process) win.process = { env: {} };
    if (!win.process.env) win.process.env = {};
    
    // 2. Aggregate API_KEY from all possible injection points
    // This handles Vercel envs, build tool inlining, and platform-specific shims
    const resolvedKey = 
      win.process.env.API_KEY || 
      win.API_KEY || 
      win.ENV?.API_KEY || 
      (typeof process !== 'undefined' ? process.env?.API_KEY : '');
    
    if (resolvedKey && resolvedKey.length > 5) {
        win.process.env.API_KEY = resolvedKey;
        win.API_KEY = resolvedKey;
        
        // Ensure local 'process' variable is also updated if it exists in scope
        try {
          if (typeof process !== 'undefined' && process.env) {
            process.env.API_KEY = resolvedKey;
          }
        } catch (e) {
          // Non-critical: some environments restrict access to 'process'
        }
        
        console.debug("[Kernel] Connectivity identity verified.");
    } else {
        console.warn("[Kernel] Connectivity identity not found. Application will start in Local-Only mode.");
    }
  }
})();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Critical Failure: DOM Root not found.");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
    console.error("Critical System Launch Failure:", error);
    rootElement.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border-radius: 1.5rem; margin: 2rem; border: 1px solid #fecdd3;">
            <h1 style="font-weight: 800; font-size: 1.25rem;">Kernel Panic</h1>
            <p style="margin-top: 1rem; font-family: monospace; font-size: 0.8rem;">${error.message}</p>
            <button onclick="window.location.reload()" style="margin-top: 1.5rem; background: #9f1239; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; border: none; cursor: pointer;">Retry System Boot</button>
        </div>
    `;
}