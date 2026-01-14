import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Global shim for process to support direct process.env.API_KEY access in browser.
// We check for existence first to avoid overwriting variables injected by the host.
if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.process) {
    win.process = { env: {} };
  } else if (!win.process.env) {
    win.process.env = {};
  }
  
  // Ensure the variable name is exactly API_KEY as per system requirements
  // and Vercel configuration.
  console.debug("System: Initializing Environment Shim");
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
        <div style="padding: 40px; font-family: sans-serif; text-align: center;">
            <h1 style="color: #e11d48;">Launch Error</h1>
            <p>${error.message}</p>
        </div>
    `;
}