import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * Hyper-Robust Environment Shim
 * Must be defined before any other imports that might use process.env
 */
(function initializeEnvironment() {
  if (typeof window !== 'undefined') {
    const win = window as any;
    
    // Create process.env if it doesn't exist
    if (!win.process) win.process = { env: {} };
    if (!win.process.env) win.process.env = {};
    
    // Ensure API_KEY is consistently mapped
    const apiKey = win.process.env.API_KEY || win.API_KEY;
    if (apiKey) {
        win.process.env.API_KEY = apiKey;
        win.API_KEY = apiKey;
    }
    
    console.debug(`[System] Kernel Initialized. API_KEY state: ${!!win.process.env.API_KEY ? 'READY' : 'WAITING_FOR_HANDSHAKE'}`);
  }
})();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Critical: DOM Root not found.");
}

// Startup Watchdog
const watchdog = setTimeout(() => {
    if (rootElement.innerHTML === '') {
        rootElement.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border-radius: 1.5rem; margin: 2rem; border: 1px solid #fecdd3; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <h1 style="font-weight: 900; font-size: 1.5rem; margin-bottom: 1rem; letter-spacing: -0.025em;">System Boot Timeout</h1>
                <p style="font-weight: 500; opacity: 0.8; font-size: 0.875rem;">The application core failed to initialize within the expected timeframe. This is often due to a network restriction or module resolution failure.</p>
                <button onclick="window.location.reload()" style="margin-top: 1.5rem; background: #9f1239; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer;">Force Retry</button>
            </div>
        `;
    }
}, 6000);

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  clearTimeout(watchdog);
} catch (error: any) {
    console.error("Critical Launch Failure:", error);
    clearTimeout(watchdog);
    rootElement.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border-radius: 1.5rem; margin: 2rem; border: 1px solid #fecdd3;">
            <h1 style="font-weight: 900; font-size: 1.5rem; margin-bottom: 1rem; letter-spacing: -0.025em;">Kernel Panic</h1>
            <p style="font-weight: 600; font-family: monospace; background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem;">${error.message}</p>
            <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.7;">Check browser console for detailed stack trace.</p>
        </div>
    `;
}