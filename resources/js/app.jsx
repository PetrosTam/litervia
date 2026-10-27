import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LiterviaApp from './LiterviaApp.jsx';
import '../css/app.css';

const mountPoint = document.getElementById('app');

if (!mountPoint) {
  throw new Error('Missing React mount point: #app');
}

// On a direct Research visit there is no selected hero; React uses a static
// fallback if a later in-app navigation opens Home without a document reload.
let initialHeroImage = null;
if (mountPoint.dataset.heroImage) {
  try {
    initialHeroImage = JSON.parse(mountPoint.dataset.heroImage);
  } catch {
    initialHeroImage = null;
  }
}

const queryClient = new QueryClient();

createRoot(mountPoint).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LiterviaApp initialHeroImage={initialHeroImage} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
