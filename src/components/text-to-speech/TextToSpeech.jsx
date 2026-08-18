import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVolumeHigh, 
  faPause, 
  faStop,
  faSlidersH,
  faMousePointer,
  faKeyboard
} from '@fortawesome/free-solid-svg-icons';

export default function TextToSpeech({ 
  className = "",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
  showVoiceSelector = false,
  showSpeedControl = true,
}) {
  // ===== TTS State =====
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const onEndCallbackRef = useRef(null);
  const onStartCallbackRef = useRef(null);
  const isCancelledRef = useRef(false);

  // ===== Component State =====
  const [error, setError] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [announcement, setAnnouncement] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // ===== HOVER MODE STATE =====
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [hoverDelay, setHoverDelay] = useState(300);
  const [highlightColor, setHighlightColor] = useState('#00672F');

  const currentHoveredElementRef = useRef(null);
  const activeTimerRef = useRef(null);
  const isReadingRef = useRef(false);

  const speeds = [0.8, 1.0, 1.25, 1.5, 2.0];

  // ===== TTS Engine =====
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const enVoice = availableVoices.find(v => v.lang.startsWith('en'));
      setSelectedVoice(enVoice || availableVoices[0] || null);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  // Poll for actual speech state
  useEffect(() => {
    if (!supported) return;

    const checkSpeechState = () => {
      const synth = window.speechSynthesis;
      const isActuallySpeaking = synth.speaking;
      const isActuallyPaused = synth.paused;
      
      if (isActuallySpeaking !== isSpeaking) {
        setIsSpeaking(isActuallySpeaking);
      }
      
      if (isActuallyPaused !== isPaused) {
        setIsPaused(isActuallyPaused);
      }
    };

    let intervalId = null;
    if (isSpeaking || isPaused) {
      intervalId = setInterval(checkSpeechState, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [supported, isSpeaking, isPaused]);

  // ===== Core TTS Functions =====
  const speak = (text, options = {}) => {
    if (!supported || !text) return;

    window.speechSynthesis.cancel();
    isCancelledRef.current = false;
    onEndCallbackRef.current = options.onEnd || null;
    onStartCallbackRef.current = options.onStart || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = options.rate || rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.lang = options.lang || 'en-US';
    
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (!isCancelledRef.current) {
        setIsSpeaking(true);
        setIsPaused(false);
        if (onStartCallbackRef.current) {
          onStartCallbackRef.current();
        }
      }
    };

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        setIsSpeaking(false);
        setIsPaused(false);
        if (options.onError) {
          options.onError(event);
        }
      }
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (!supported) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (!supported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const stop = () => {
    if (!supported) return;
    isCancelledRef.current = true;
    onEndCallbackRef.current = null;
    onStartCallbackRef.current = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const changeVoice = (voice) => {
    setSelectedVoice(voice);
  };

  const changeRate = (newRate) => {
    setRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = Math.max(0.5, Math.min(2.0, newRate));
    }
  };

  // ===== Helper Functions =====

  const findReadableElement = (element) => {
    if (!element) return null;
    
    const readableTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'BUTTON', 'LABEL', 'FIGCAPTION', 'SPAN', 'DIV', 'TD', 'TH'];
    
    if (element.offsetWidth < 10 || element.offsetHeight < 10) {
      return null;
    }

    if (readableTags.includes(element.tagName)) {
      const text = extractText(element);
      if (text && text.trim().length > 1) {
        return element;
      }
    }

    let current = element.parentElement;
    let depth = 0;
    while (current && current !== document.body && depth < 10) {
      if (readableTags.includes(current.tagName)) {
        const text = extractText(current);
        if (text && text.trim().length > 1) {
          return current;
        }
      }
      const role = current.getAttribute('role');
      if (role && ['heading', 'link', 'button', 'img', 'article', 'section', 'main'].includes(role)) {
        const text = extractText(current);
        if (text && text.trim().length > 1) {
          return current;
        }
      }
      current = current.parentElement;
      depth++;
    }
    return null;
  };

  const extractText = (element) => {
    if (!element) return '';

    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') || element.getAttribute('title') || 'Image';
    }
    
    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
      const title = element.getAttribute('title');
      if (title) return title;
    }

    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
      const id = element.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.innerText || label.textContent || '';
      }
      return element.placeholder || element.value || '';
    }

    return element.innerText || element.textContent || '';
  };

  // ===== Highlight Functions =====
  const elementStylesMap = new Map();

  const highlightElement = (element) => {
    clearHighlight();
    if (!element) return;
    
    const originalOutline = element.style.outline;
    const originalOutlineOffset = element.style.outlineOffset;
    const originalBackground = element.style.backgroundColor;
    const originalBoxShadow = element.style.boxShadow;
    const originalTransition = element.style.transition;
    
    elementStylesMap.set(element, {
      originalOutline,
      originalOutlineOffset,
      originalBackground,
      originalBoxShadow,
      originalTransition
    });
    
    element.style.transition = 'outline 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease';
    element.style.outline = `3px solid ${highlightColor}`;
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(0, 103, 47, 0.08)';
    element.style.boxShadow = `0 0 20px rgba(0, 103, 47, 0.2)`;
    
    setHoveredElement(element);
  };

  const clearHighlight = () => {
    if (elementStylesMap.size > 0) {
      for (const [element, styles] of elementStylesMap) {
        element.style.outline = styles.originalOutline || '';
        element.style.outlineOffset = styles.originalOutlineOffset || '';
        element.style.backgroundColor = styles.originalBackground || '';
        element.style.boxShadow = styles.originalBoxShadow || '';
        element.style.transition = styles.originalTransition || '';
      }
      elementStylesMap.clear();
    }
    
    if (hoveredElement) {
      const element = hoveredElement;
      if (!elementStylesMap.has(element)) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.backgroundColor = '';
        element.style.boxShadow = '';
        element.style.transition = '';
      }
      setHoveredElement(null);
    }
    
    document.querySelectorAll('[style*="outline: 3px solid"]').forEach(el => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.backgroundColor = '';
      el.style.boxShadow = '';
      el.style.transition = '';
    });
  };

  const speakHoveredElement = (element) => {
    const text = extractText(element);
    if (text && text.trim().length > 1) {
      stop();
      speak(text, {
        rate,
        voice: selectedVoice,
        onStart: () => {
          setAnnouncement(`Reading: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
          onStart();
        },
        onEnd: () => {
          onEnd();
        },
        onError: (err) => {
          if (err?.error !== 'canceled' && err?.error !== 'interrupted') {
            setError('Playback failed');
            onError(err);
          }
        }
      });
    }
  };

  // ===== MAIN EVENT HANDLERS (FIXED - NO POINTER TYPE CHECKS) =====

  useEffect(() => {
    if (!supported) return;

    if (!hoverEnabled) {
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
      clearHighlight();
      stop();
      currentHoveredElementRef.current = null;
      isReadingRef.current = false;
      return;
    }

    // ===== POINTER EVENTS (Works for both mouse AND touch) =====
    const handlePointerOver = (e) => {
      const element = findReadableElement(e.target);
      if (!element) return;

      if (currentHoveredElementRef.current === element && isReadingRef.current) {
        return;
      }

      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
      
      stop();
      clearHighlight();
      isReadingRef.current = false;
      currentHoveredElementRef.current = element;

      activeTimerRef.current = setTimeout(() => {
        if (currentHoveredElementRef.current === element) {
          clearHighlight();
          highlightElement(element);
          speakHoveredElement(element);
          isReadingRef.current = true;
          activeTimerRef.current = null;
        }
      }, hoverDelay);
      
      setHoverTimer(activeTimerRef.current);
    };

    const handlePointerLeave = (e) => {
      const element = findReadableElement(e.target);
      if (!element) return;

      if (currentHoveredElementRef.current === element) {
        if (activeTimerRef.current) {
          clearTimeout(activeTimerRef.current);
          activeTimerRef.current = null;
          setHoverTimer(null);
        }
        stop();
        clearHighlight();
        isReadingRef.current = false;
        currentHoveredElementRef.current = null;
        setAnnouncement('Stopped reading');
        onEnd();
      }
    };

    // ===== CLICK FALLBACK (For touch devices that don't fire pointer events properly) =====
    const handleClick = (e) => {
      // Only handle click if hover mode is enabled
      if (!hoverEnabled) return;
      
      const element = findReadableElement(e.target);
      if (!element) return;

      if (currentHoveredElementRef.current === element && isReadingRef.current) {
        return;
      }

      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
      
      stop();
      clearHighlight();
      isReadingRef.current = false;
      currentHoveredElementRef.current = element;

      // Read immediately on click (no delay)
      clearHighlight();
      highlightElement(element);
      speakHoveredElement(element);
      isReadingRef.current = true;
    };

    // Register events - pointer events work on both mouse and touch
    document.addEventListener('pointerover', handlePointerOver, true);
    document.addEventListener('pointerleave', handlePointerLeave, true);
    // Click as fallback for touch
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('pointerover', handlePointerOver, true);
      document.removeEventListener('pointerleave', handlePointerLeave, true);
      document.removeEventListener('click', handleClick, true);
      
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
      clearHighlight();
      stop();
      currentHoveredElementRef.current = null;
      isReadingRef.current = false;
    };
  }, [supported, hoverEnabled, hoverDelay, rate, selectedVoice]);

  // ===== KEYBOARD SUPPORT =====

  useEffect(() => {
    if (!supported || !hoverEnabled) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement) {
            const readableElement = findReadableElement(activeElement);
            if (readableElement) {
              clearHighlight();
              highlightElement(readableElement);
              speakHoveredElement(readableElement);
            }
          }
        }, 50);
      }
      
      if (e.key === 'Escape') {
        stop();
        clearHighlight();
        if (activeTimerRef.current) {
          clearTimeout(activeTimerRef.current);
          activeTimerRef.current = null;
        }
        currentHoveredElementRef.current = null;
        isReadingRef.current = false;
        setAnnouncement('Stopped');
        onEnd();
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const readableElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a, button, label, figcaption');
        let currentIndex = -1;
        const activeElement = document.activeElement;
        
        if (activeElement) {
          for (let i = 0; i < readableElements.length; i++) {
            if (readableElements[i] === activeElement || readableElements[i].contains(activeElement)) {
              currentIndex = i;
              break;
            }
          }
        }
        
        const nextIndex = Math.min(currentIndex + 1, readableElements.length - 1);
        if (readableElements[nextIndex]) {
          readableElements[nextIndex].focus();
          clearHighlight();
          highlightElement(readableElements[nextIndex]);
          speakHoveredElement(readableElements[nextIndex]);
        }
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const readableElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a, button, label, figcaption');
        let currentIndex = -1;
        const activeElement = document.activeElement;
        
        if (activeElement) {
          for (let i = 0; i < readableElements.length; i++) {
            if (readableElements[i] === activeElement || readableElements[i].contains(activeElement)) {
              currentIndex = i;
              break;
            }
          }
        }
        
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (readableElements[prevIndex]) {
          readableElements[prevIndex].focus();
          clearHighlight();
          highlightElement(readableElements[prevIndex]);
          speakHoveredElement(readableElements[prevIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [supported, hoverEnabled]);

  // ===== KEYBOARD SHORTCUT: Ctrl+Shift+H =====

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setHoverEnabled(!hoverEnabled);
        setAnnouncement(hoverEnabled ? 'Hover mode disabled' : 'Hover mode enabled');
        if (!hoverEnabled) {
          if (activeTimerRef.current) {
            clearTimeout(activeTimerRef.current);
            activeTimerRef.current = null;
          }
          clearHighlight();
          stop();
          currentHoveredElementRef.current = null;
          isReadingRef.current = false;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [hoverEnabled]);

  // ===== CLEAR ANNOUNCEMENTS =====

  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // ===== UI HANDLERS =====

  const handlePauseResume = () => {
    if (isPaused) {
      resume();
      setAnnouncement('Resumed');
    } else if (isSpeaking) {
      pause();
      setAnnouncement('Paused');
    }
  };

  const handleStop = () => {
    stop();
    clearHighlight();
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }
    currentHoveredElementRef.current = null;
    isReadingRef.current = false;
    setError(null);
    setAnnouncement('Stopped');
    onEnd();
  };

  const handleSpeedSelect = (newRate) => {
    setRate(newRate);
    changeRate(newRate);
    setAnnouncement(`Speed ${newRate}x`);
  };

  const handleToggleHover = () => {
    setHoverEnabled(!hoverEnabled);
    setAnnouncement(hoverEnabled ? 'Hover mode disabled' : 'Hover mode enabled');
    if (!hoverEnabled) {
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
      clearHighlight();
      stop();
      currentHoveredElementRef.current = null;
      isReadingRef.current = false;
    }
  };

  const activeState = isSpeaking && !isPaused;

  // ===== RENDER =====

  if (!supported) {
    return (
      <div className="text-xs italic" style={{ color: 'var(--color-primary-purple-light, #3d2a6b)' }} role="status">
        Text-to-speech unavailable on this browser.
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div 
        className="inline-flex items-center gap-1.5 p-1.5 rounded-full text-white shadow-xl backdrop-blur-md transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-primary-purple-dark, #100a22)',
          border: '1px solid var(--color-primary-purple-light, #3d2a6b)'
        }}
      >
        <button
          type="button"
          onClick={handleToggleHover}
          title={hoverEnabled ? "Disable hover-to-read" : "read aloud-to-read"}
          aria-label={hoverEnabled ? "Disable hover-to-read" : "read aloud-to-read"}
          aria-pressed={hoverEnabled}
          className="relative flex items-center justify-center gap-2.5 px-4 py-2 rounded-full font-medium text-sm text-white transition-all duration-200 cursor-pointer"
          style={{ 
            backgroundColor: hoverEnabled ? 'var(--color-primary-green, #00672F)' : 'var(--color-primary-purple, #201444)'
          }}
        >
          <FontAwesomeIcon 
            icon={hoverEnabled ? faMousePointer : faVolumeHigh} 
            className={hoverEnabled ? 'animate-pulse' : ''}
          />
          <span>
            {hoverEnabled ? 'Hover/Tap to Read' : 'read aloud'}
          </span>
        </button>

        {(isSpeaking || isPaused) && (
          <button
            type="button"
            onClick={handlePauseResume}
            title={isPaused ? "Resume" : "Pause"}
            aria-label={isPaused ? "Resume reading" : "Pause reading"}
            className="p-2 w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ 
              backgroundColor: isPaused ? 'var(--color-primary-purple-light, #3d2a6b)' : 'var(--color-primary-green, #00672F)'
            }}
          >
            <FontAwesomeIcon icon={isPaused ? faPlay : faPause} size="sm" />
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            title="Stop"
            aria-label="Stop playback"
            className="p-2 w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary-red, #E91C23)' }}
          >
            <FontAwesomeIcon icon={faStop} size="sm" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle playback settings"
          aria-expanded={showSettings}
          className="p-2 w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-80 transition-all cursor-pointer"
          style={{ 
            backgroundColor: showSettings ? 'var(--color-primary-purple-light, #3d2a6b)' : 'transparent' 
          }}
        >
          <FontAwesomeIcon icon={faSlidersH} size="sm" />
        </button>

        <span 
          className="hidden sm:inline-block pr-3 text-[10px] font-mono text-gray-300 pl-2"
          style={{ borderLeft: '1px solid var(--color-primary-purple-light, #3d2a6b)' }}
        >
          <span className="block text-[8px] text-gray-400">Ctrl+Shift</span>
          <span className="text-primary-green">H</span>
        </span>
      </div>

      {hoverEnabled && (
        <div 
          className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block w-fit"
          style={{ 
            color: 'var(--color-primary-green, #00672F)',
            backgroundColor: 'rgba(0, 103, 47, 0.1)'
          }}
        >
          <FontAwesomeIcon icon={faMousePointer} className="mr-1" size="xs" />
          Hover or tap any text to read
          <span className="text-gray-400 mx-1">•</span>
          <FontAwesomeIcon icon={faKeyboard} className="mr-1" size="xs" />
          Tab to navigate
        </div>
      )}

      {showSettings && (
        <div 
          className="flex flex-col gap-3 p-3 rounded-xl shadow-2xl text-xs text-white max-w-xs transition-all"
          style={{ 
            backgroundColor: 'var(--color-primary-purple-dark, #100a22)',
            border: '1px solid var(--color-primary-purple-light, #3d2a6b)'
          }}
        >
          {showSpeedControl && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-300">
                Speed
              </span>
              <div 
                className="flex items-center gap-1 p-1 rounded-lg"
                style={{ backgroundColor: 'var(--color-primary-purple, #201444)' }}
              >
                {speeds.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedSelect(s)}
                    className="flex-1 py-1 rounded text-center transition-colors font-mono cursor-pointer text-white"
                    style={{ 
                      backgroundColor: rate === s ? 'var(--color-primary-green, #00672F)' : 'transparent'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-300">
              Hover/Tap Delay
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={hoverDelay}
                onChange={(e) => setHoverDelay(parseInt(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary-green, #00672F) 0%, var(--color-primary-green, #00672F) ${((hoverDelay - 100) / 700) * 100}%, var(--color-primary-purple, #201444) ${((hoverDelay - 100) / 700) * 100}%, var(--color-primary-purple, #201444) 100%)`
                }}
              />
              <span className="text-gray-300 font-mono w-10 text-center">
                {hoverDelay}ms
              </span>
            </div>
          </div>

          {showVoiceSelector && voices.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-300">
                Voice
              </span>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const v = voices.find(v => v.name === e.target.value);
                  if (v) changeVoice(v);
                }}
                className="w-full p-2 text-white rounded-lg focus:outline-none cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--color-primary-purple, #201444)',
                  border: '1px solid var(--color-primary-purple-light, #3d2a6b)'
                }}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-primary-purple-light/30 pt-2 mt-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Keyboard Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-1 mt-1.5 text-[10px] text-gray-300">
              <span className="bg-primary-purple/30 px-1.5 py-0.5 rounded">Ctrl+Shift+H</span>
              <span>Toggle mode</span>
              <span className="bg-primary-purple/30 px-1.5 py-0.5 rounded">Tab</span>
              <span>Navigate & read</span>
              <span className="bg-primary-purple/30 px-1.5 py-0.5 rounded">↑/↓</span>
              <span>Next/prev element</span>
              <span className="bg-primary-purple/30 px-1.5 py-0.5 rounded">Esc</span>
              <span>Stop reading</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p 
          className="text-xs text-white px-2.5 py-1 rounded-md"
          style={{ 
            backgroundColor: 'var(--color-primary-red, #E91C23)',
            border: '1px solid var(--color-primary-red-dark, #b0151b)'
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}