import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'

// Preload critical fonts - Optimized
const preloadFonts = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Cairo:wght@200..1000&display=swap';
  document.head.appendChild(link);
};

// Initialize app
const initApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Preload fonts
  preloadFonts();

  // Add loaded class to body for CSS transitions
  document.body.classList.add('app-loaded');

  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <LanguageProvider>
            <CurrencyProvider>
              <App />
            </CurrencyProvider>
          </LanguageProvider>
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>,
  );
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
