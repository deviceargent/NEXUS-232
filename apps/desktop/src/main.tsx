import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@nexus/ui';
import { NexusProvider } from './app/context.js';
import { MainLayout } from './layout/main-layout.js';
import './app/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider initialConfig={{ mode: 'dark', density: 'compact', accentColor: '#38bdf8' }}>
      <NexusProvider>
        <MainLayout />
      </NexusProvider>
    </ThemeProvider>
  </React.StrictMode>
);
