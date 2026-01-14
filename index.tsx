import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * Global shim for process.env.
 * This ensures that code referencing process.env.API_KEY doesn't throw ReferenceErrors.
 * It is designed to be non-destructive to existing globals.
 */
if (typeof window !== 'undefined') {
  const win = window as any;
  
  // Initialize process if missing
  if (!win.process) {
    win.process = { env: {} };
  } else if (!win.process.env) {
    win.process.env = {};
  }
  
  // Diagnostic log for deployment debugging
  const keyExists = !!(win.process.env.API_KEY || (win as any).API_KEY);
  console.debug(`[System] Environment initialized. API_KEY state: ${keyExists ? 'Detected' : 'Not Found'}`);
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
    console.error("Critical Launch Failure:", error);
    rootElement.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff1f2; color: #9f1239; border-radius: 1rem; margin: 2rem; border: 1px solid #fecdd3;">
            <h1 style="font-weight: 800; font-size: 1.5rem; margin-bottom: 1rem;">System Launch Failure</h1>
            <p style="font-weight: 500; opacity: 0.8;">${error.message}</p>
        </div>
    `;
}