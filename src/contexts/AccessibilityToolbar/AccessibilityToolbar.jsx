import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAccessibility } from '../../contexts/AccessibilityContext';

// Icons as React components
const AccessibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <circle cx="12" cy="6" r="2" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="12" y1="14" x2="9" y2="19" />
    <line x1="12" y1="14" x2="15" y2="19" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Magnifying Glass with Plus icon
const MagnifyPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// Magnifying Glass with Minus icon
const MagnifyMinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// Magnifying Glass icon for Reset
const MagnifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const AccessibilityToolbar = () => {
  const [open, setOpen] = useState(false);
  const [showReadingMaskHint, setShowReadingMaskHint] = useState(false);
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const contentRef = useRef(null);

  // Font size controls
  const decreaseFont = () => {
    const newSize = Math.max(70, settings.fontSize - 10);
    updateSetting('fontSize', newSize);
  };

  const increaseFont = () => {
    const newSize = Math.min(200, settings.fontSize + 10);
    updateSetting('fontSize', newSize);
  };

  const resetFont = () => {
    updateSetting('fontSize', 100);
  };

  // Handle reading mask toggle with hint
  const handleReadingMaskToggle = (checked) => {
    updateSetting('readingMask', checked);
    if (checked) {
      setShowReadingMaskHint(true);
      setTimeout(() => setShowReadingMaskHint(false), 4000);
    }
  };

  // Keyboard shortcut: Ctrl+Shift+A to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Tooltip.Provider>
      <div className="fixed top-27 right-6 z-50">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Dialog.Trigger asChild>
                <button
                  className="bg-primary-purple text-white rounded-full p-4 shadow-lg hover:bg-primary-purple-dark transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
                  aria-label="Open accessibility settings (Ctrl+Shift+A)"
                >
                  <AccessibilityIcon />
                </button>
              </Dialog.Trigger>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm">
                Accessibility Settings (Ctrl+Shift+A)
                <Tooltip.Arrow className="fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Dialog.Portal>
            {/* Removed backdrop blur - only transparent overlay */}
            <Dialog.Overlay className="fixed inset-0 z-50" />
            <Dialog.Content 
              ref={contentRef}
              data-lenis-prevent
              className="fixed top-28 right-6 w-96 max-h-[calc(100vh-10rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-6 border border-gray-200 focus:outline-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#201444 #f0f0f0',
              }}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                if (contentRef.current) {
                  contentRef.current.focus();
                }
              }}
            >
              {/* Custom scrollbar styles */}
              <style>
                {`
                  .fixed.top-28.right-6.w-96::-webkit-scrollbar {
                    width: 6px;
                  }
                  .fixed.top-28.right-6.w-96::-webkit-scrollbar-track {
                    background: #f0f0f0;
                    border-radius: 10px;
                  }
                  .fixed.top-28.right-6.w-96::-webkit-scrollbar-thumb {
                    background: #201444;
                    border-radius: 10px;
                  }
                  .fixed.top-28.right-6.w-96::-webkit-scrollbar-thumb:hover {
                    background: #100a22;
                  }
                `}
              </style>

              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pt-0 pb-2 z-10 border-b border-gray-100">
                <Dialog.Title className="text-xl font-bold text-primary-purple flex items-center gap-3">
                  <AccessibilityIcon />
                  Accessibility
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-purple" 
                    aria-label="Close accessibility settings"
                  >
                    <CloseIcon />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-6">
                {/* Font Size with Magnifying Glass Icons */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Font Size</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseFont}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
                      aria-label="Decrease font size"
                    >
                      <MagnifyMinusIcon />
                    </button>
                    <span className="text-sm text-gray-600 min-w-12 text-center font-medium">
                      {settings.fontSize}%
                    </span>
                    <button
                      onClick={increaseFont}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
                      aria-label="Increase font size"
                    >
                      <MagnifyPlusIcon />
                    </button>
                    <button
                      onClick={resetFont}
                      className="px-3 py-1.5 bg-primary-purple/10 hover:bg-primary-purple/20 rounded-lg transition-colors text-sm text-primary-purple flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2"
                      aria-label="Reset font size to 100%"
                    >
                      <MagnifyIcon />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Toggle Controls */}
                <div className="space-y-4">
                  {[
                    { key: 'highContrast', label: 'High Contrast' },
                    { key: 'grayscale', label: 'Grayscale' },
                    { key: 'invertColors', label: 'Invert Colors' },
                    { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font' },
                    { key: 'underlineLinks', label: 'Underline Links' },
                    { key: 'readingMask', label: 'Reading Mask' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700" htmlFor={`switch-${key}`}>
                          {label}
                        </label>
                        <Switch.Root
                          id={`switch-${key}`}
                          checked={settings[key]}
                          onCheckedChange={key === 'readingMask' ? handleReadingMaskToggle : (checked) => updateSetting(key, checked)}
                          className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-primary-green transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2"
                        >
                          <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5.5" />
                        </Switch.Root>
                      </div>
                      {key === 'readingMask' && showReadingMaskHint && (
                        <p className="text-xs text-gray-500 animate-pulse">
                          💡 Move your mouse to position the reading mask
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Colorblind Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Colorblind Mode</label>
                  <select
                    value={settings.colorblindMode}
                    onChange={(e) => updateSetting('colorblindMode', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-Blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                  </select>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Line Height & Letter Spacing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Line Height</label>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{settings.lineHeight}</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Letter Spacing</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.5"
                      value={settings.letterSpacing}
                      onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{settings.letterSpacing}px</span>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full py-2.5 bg-red-50 text-primary-red hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Reset All Settings
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Tooltip.Provider>
  );
};

export default AccessibilityToolbar;