import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import MensaApp from './MensaApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MensaApp />
  </StrictMode>,
);
