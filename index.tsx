import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

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