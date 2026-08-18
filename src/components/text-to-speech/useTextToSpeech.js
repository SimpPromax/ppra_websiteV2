import { useState, useEffect, useRef } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const onEndCallbackRef = useRef(null);
  const onStartCallbackRef = useRef(null);
  const isCancelledRef = useRef(false);

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

  // Poll for actual speech state (fixes state sync issues)
  useEffect(() => {
    if (!supported) return;

    const checkSpeechState = () => {
      const synth = window.speechSynthesis;
      
      // Update speaking state based on actual browser state
      const isActuallySpeaking = synth.speaking;
      const isActuallyPaused = synth.paused;
      
      // Only update if different from current state
      if (isActuallySpeaking !== isSpeaking) {
        setIsSpeaking(isActuallySpeaking);
      }
      
      if (isActuallyPaused !== isPaused) {
        setIsPaused(isActuallyPaused);
      }
    };

    // Check state every 100ms while speaking
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

  const speak = (text, options = {}) => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    isCancelledRef.current = false;
    onEndCallbackRef.current = options.onEnd || null;
    onStartCallbackRef.current = options.onStart || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = options.rate || 1.0;
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
      // Ignore "canceled" errors as they're expected
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
    
    // Check if actually speaking and not already paused
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      // State will be updated by the onpause event
    } else {
      console.log('Cannot pause: not speaking or already paused');
    }
  };

  const resume = () => {
    if (!supported) return;
    
    // Check if actually paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      // State will be updated by the onresume event
    } else {
      console.log('Cannot resume: not paused');
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

  const changeRate = (rate) => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = Math.max(0.5, Math.min(2.0, rate));
    }
  };

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    supported,
    voices,
    selectedVoice,
    changeVoice,
    changeRate,
  };
}