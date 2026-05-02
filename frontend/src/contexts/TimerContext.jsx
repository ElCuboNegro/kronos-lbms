import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  // timers: { [stepId_or_key]: { endTime: number, duration: number, pausedLeft: number | null } }
  const [timers, setTimers] = useState({});

  useEffect(() => {
    // Load from local storage to survive reloads
    const saved = localStorage.getItem('lbms_timers');
    if (saved) {
      try {
        setTimers(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading timers", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lbms_timers', JSON.stringify(timers));
  }, [timers]);

  const startTimer = useCallback((id, minutes) => {
    setTimers(prev => {
      // If resuming from pause
      const current = prev[id];
      if (current && current.pausedLeft) {
        return {
          ...prev,
          [id]: { ...current, endTime: Date.now() + current.pausedLeft, pausedLeft: null }
        };
      }
      // Start fresh
      return {
        ...prev,
        [id]: { endTime: Date.now() + minutes * 60000, duration: minutes * 60000, pausedLeft: null }
      };
    });
  }, []);

  const pauseTimer = useCallback((id, timeLeft) => {
    setTimers(prev => ({
      ...prev,
      [id]: { ...prev[id], pausedLeft: timeLeft, endTime: null }
    }));
  }, []);

  const resetTimer = useCallback((id) => {
    setTimers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  // Beep functionality using Web Audio API (no assets needed)
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

      // Beep pattern
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.4);
      }, 400);

    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  }, []);

  return (
    <TimerContext.Provider value={{ timers, startTimer, pauseTimer, resetTimer, playBeep }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  return useContext(TimerContext);
}
