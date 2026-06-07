import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { I18nProvider } from './i18n/index.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import ToastContainer from './components/Toast.tsx';
import NetworkStatus from './components/NetworkStatus.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
            <ToastContainer />
            <NetworkStatus />
          </NotificationProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
