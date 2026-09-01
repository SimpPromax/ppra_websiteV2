// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

// Import GSAP and register plugins
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// ===== FORCE FULL PAGE RELOADS FOR ALL NAVIGATION =====
// This works in both dev and preview modes
const handleLinkClick = (e) => {
  const target = e.target.closest('a');
  if (!target) return;
  
  // Only handle internal links
  const href = target.getAttribute('href');
  if (!href) return;
  
  // Skip external links, anchor links, and javascript: links
  if (href.startsWith('http') || 
      href.startsWith('#') || 
      href.startsWith('javascript:') || 
      href.startsWith('mailto:') ||
      href.startsWith('tel:')) {
    return;
  }
  
  // Skip if target is _blank
  if (target.getAttribute('target') === '_blank') return;
  
  // Force full page navigation
  e.preventDefault();
  window.location.href = href;
};

// Add event listener to capture all link clicks
document.addEventListener('click', handleLinkClick);

// Also handle back/forward buttons
window.addEventListener('popstate', () => {
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);