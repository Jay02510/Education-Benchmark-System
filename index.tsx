import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 1. Critical Shim: Gemini SDK and other Node-heritage libs expect 'process' to exist.
// This prevents 'ReferenceError: process is not defined' which causes the white screen.
// Fix: Added 'as any' cast to check for 'process' on window to satisfy TypeScript.
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
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
  console.error("Critical Boot Error:", error);
  // 2. Production Error Overlay: Don't show a white screen if something is wrong.
  rootElement.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e11d48; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #475569; font-weight: bold;">The application failed to start.</p>
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 14px; overflow-x: auto; margin-top: 20px;">
        ${error.message}
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
        Please check the browser console for details or ensure your API key is correctly configured.
      </p>
      <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
        Try Reloading
      </button>
    </div>
  `;
}