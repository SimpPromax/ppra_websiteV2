import React, { useState, useEffect } from 'react';
import { Webchat } from '@botpress/webchat';
import botAvatar from '../assets/commonPics/circle logo for ppra.png';

const clientId = '930f10d0-759c-41a9-871a-6a46bb9b0a82';

// === BRAND COLORS (from your design system) ===
// You can swap the primary color below with:
//   --color-primary-green: #00672F
//   --color-primary-red: #E91C23
const PRIMARY_COLOR = '#201444';          // primary purple
const PRIMARY_DARK = '#100a22';           // dark variant (optional)
const PRIMARY_LIGHT = '#3d2a6b';          // light variant

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggle = () => setIsOpen(!isOpen);

  const config = {
    botName: 'PPRA AI Support',
    botAvatar: botAvatar,
    color: PRIMARY_COLOR,        // <-- brand color applied here
    themeMode: 'light',
  };

  return (
    <>
      {isOpen && (
        <div 
          data-lenis-prevent
          style={{
            position: 'fixed',
            bottom: isMobile ? 80 : 90,
            right: isMobile ? 10 : 20,
            left: isMobile ? 10 : 'auto',
            width: isMobile ? 'calc(100% - 20px)' : '400px',
            height: isMobile ? '70vh' : '600px',
            maxHeight: isMobile ? 500 : 600,
            zIndex: 9998,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
          }}
        >
          <Webchat
            clientId={clientId}
            configuration={config}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          />
        </div>
      )}
      
      {/* Floating toggle button */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: isMobile ? 56 : 64,
          height: isMobile ? 56 : 64,
          zIndex: 9999,
          backgroundColor: PRIMARY_COLOR,   // <-- brand color applied here
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? 28 : 32,
          color: 'white',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 24 : 28} height={isMobile ? 24 : 28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 28 : 32} height={isMobile ? 28 : 32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </>
  );
}