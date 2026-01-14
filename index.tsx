import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * Hyper-Robust Environment Shim
 * Forces process.env.API_KEY to be available globally
 */
(function initializeSystemEnvironment() {
  if (typeof window !== 'undefined') {
    const win = window as any;
    
    // Create hierarchy if missing
    if (!win.process) win.process = { env: {} };
    if (!win.process.env) win.process.env = {};
    
    // Capture API key from any potential source (Vercel, Build Tool, or AI Studio)
    const possibleKey = win.process.env.API_KEY || win.API_KEY || win.ENV?.API_KEY || '';
    
    if (possibleKey) {
        win.process.env.API_KEY = possibleKey;
        win.API_KEY = possibleKey;
        console.debug("[System] API Connectivity Identity Verified.");
    } else {
        console.warn("[System] API Key not detected in immediate environment. Awaiting handshake.");
    }
  }
})();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Critical: DOM Root node 'root' is missing.");
}

// Global Error Catcher for Module Loading
window.onerror = (msg, url, line) => {
    if (msg.toString().includes('Import map')) {
        rootElement.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border-radius: 1.5rem; margin: 2rem; border: 1px solid #fecdd3;">
                <h1 style="font-weight: 800; font-size: 1.25rem;">Browser Compatibility Error</h1>
                <p style="margin-top: 1rem;">This application requires a modern browser with Import Map support.</p>
            </div>
        `;
    }
};

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
    console.error("Critical System Launch Failure:", error);
    rootElement.innerHTML = `<div style="padding: 40px; color: #9f1239;">Kernel Panic: ${error.message}</div>`;
}