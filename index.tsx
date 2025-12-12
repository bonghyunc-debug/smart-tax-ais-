import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CgwWizardApp from './src/cgw/CgwWizardApp';
import CgwUnavailable from './src/cgw/CgwUnavailable';

const ENABLE_CGW = String(process.env.FEATURE_CGW).toLowerCase() === 'true';
const isCgwPath = window.location.pathname.startsWith('/cgw');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (isCgwPath) {
  const Entry = ENABLE_CGW ? CgwWizardApp : CgwUnavailable;
  root.render(
    <React.StrictMode>
      <Entry />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
