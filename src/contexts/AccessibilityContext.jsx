import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Safe fallback localStorage parser (SSR safety)
const loadPreference = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(`a11y_${key}`);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const defaultSettings = {
  fontSize: 100,
  highContrast: false,
  grayscale: false,
  invertColors: false,
  dyslexiaFont: false,
  lineHeight: 1.5,
  letterSpacing: 0,
  underlineLinks: false,
  readingMask: false,
  colorblindMode: 'none',
};

export const AccessibilityProvider = ({ children }) => {
  // Load saved preferences from localStorage
  const [settings, setSettings] = useState({
    fontSize: loadPreference('fontSize', defaultSettings.fontSize),
    highContrast: loadPreference('highContrast', defaultSettings.highContrast),
    grayscale: loadPreference('grayscale', defaultSettings.grayscale),
    invertColors: loadPreference('invertColors', defaultSettings.invertColors),
    dyslexiaFont: loadPreference('dyslexiaFont', defaultSettings.dyslexiaFont),
    lineHeight: loadPreference('lineHeight', defaultSettings.lineHeight),
    letterSpacing: loadPreference('letterSpacing', defaultSettings.letterSpacing),
    underlineLinks: loadPreference('underlineLinks', defaultSettings.underlineLinks),
    readingMask: loadPreference('readingMask', defaultSettings.readingMask),
    colorblindMode: loadPreference('colorblindMode', defaultSettings.colorblindMode),
  });

  // Refs for reading mask - optimized with RAF
  const rAFRef = useRef(null);
  const targetYRef = useRef(window.innerHeight / 2);
  const currentYRef = useRef(window.innerHeight / 2);
  const maskDomRef = useRef(null);
  
  // Dual overlay references replace the volatile clip-path ref
  const topOverlayRef = useRef(null);
  const bottomOverlayRef = useRef(null);

  // Apply settings to document
  const applySettingsToDocument = useCallback((currentSettings) => {
    const root = document.documentElement;

    root.style.fontSize = `${currentSettings.fontSize}%`;
    root.style.lineHeight = currentSettings.lineHeight;
    root.style.letterSpacing = `${currentSettings.letterSpacing}px`;

    root.classList.toggle('high-contrast', currentSettings.highContrast);
    root.classList.toggle('grayscale', currentSettings.grayscale);
    root.classList.toggle('invert-colors', currentSettings.invertColors);

    if (currentSettings.highContrast && currentSettings.invertColors) {
      root.classList.add('high-contrast-invert');
    } else {
      root.classList.remove('high-contrast-invert');
    }

    if (currentSettings.highContrast && currentSettings.grayscale) {
      root.classList.add('high-contrast-grayscale');
    } else {
      root.classList.remove('high-contrast-grayscale');
    }

    root.classList.toggle('dyslexia-font', currentSettings.dyslexiaFont);
    root.classList.toggle('underline-links', currentSettings.underlineLinks);

    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (currentSettings.colorblindMode !== 'none') {
      root.classList.add(currentSettings.colorblindMode);
    }

    Object.entries(currentSettings).forEach(([key, value]) => {
      localStorage.setItem(`a11y_${key}`, JSON.stringify(value));
    });
  }, []);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings, applySettingsToDocument]);

  // Unified Mouse & Touch Event Tracking
  useEffect(() => {
    if (!settings.readingMask) return;

    const handlePointerMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      targetYRef.current = clientY;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [settings.readingMask]);

  // High Performance Animation Loop
  useEffect(() => {
    if (!settings.readingMask) {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      return;
    }

    const maskHeight = 80;
    const halfHeight = maskHeight / 2;

    const animate = () => {
      if (!maskDomRef.current || !topOverlayRef.current || !bottomOverlayRef.current) {
        rAFRef.current = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation with damping
      const deltaY = targetYRef.current - currentYRef.current;
      currentYRef.current += deltaY * 0.25;

      // Window Boundary limits
      const minTop = halfHeight;
      const maxTop = window.innerHeight - halfHeight;
      const finalCenterY = Math.max(minTop, Math.min(currentYRef.current, maxTop));

      const topEdge = finalCenterY - halfHeight;
      const bottomEdge = finalCenterY + halfHeight;

      // 1. Position the yellow tracking guide lines
      maskDomRef.current.style.transform = `translate3d(0, ${topEdge}px, 0)`;

      // 2. Scale the height of the top dark panel down to the top line
      topOverlayRef.current.style.height = `${topEdge}px`;

      // 3. Shift and scale the bottom dark panel to start exactly at the bottom line
      bottomOverlayRef.current.style.transform = `translate3d(0, ${bottomEdge}px, 0)`;
      bottomOverlayRef.current.style.height = `${window.innerHeight - bottomEdge}px`;

      rAFRef.current = requestAnimationFrame(animate);
    };

    rAFRef.current = requestAnimationFrame(animate);

    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [settings.readingMask]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem(`a11y_${key}`, JSON.stringify(value));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    Object.keys(defaultSettings).forEach(key => {
      localStorage.setItem(`a11y_${key}`, JSON.stringify(defaultSettings[key]));
    });
  }, []);

  const value = {
    settings,
    updateSetting,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {settings.readingMask && (
        <>
          {/* Top Dark Block */}
          <div
            ref={topOverlayRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              background: 'rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 9998,
              willChange: 'height'
            }}
          />
          
          {/* Bottom Dark Block */}
          <div
            ref={bottomOverlayRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              background: 'rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 9998,
              willChange: 'transform, height'
            }}
          />
          
          {/* Yellow border lines - perfectly clear window inside */}
          <div
            ref={maskDomRef}
            style={{
              position: 'fixed',
              top: 0,
              left: '10%',
              right: '10%',
              height: '80px',
              borderTop: '3px solid rgba(255, 215, 0, 0.8)',
              borderBottom: '3px solid rgba(255, 215, 0, 0.8)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              pointerEvents: 'none',
              zIndex: 9999,
              willChange: 'transform'
            }}
          />
        </>
      )}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;