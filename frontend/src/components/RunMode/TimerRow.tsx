import React, { useState, useEffect, useRef } from 'react';

interface TimerRowProps {
  id: string;
  label: string;
  initialSeconds: number;
}

const TimerRow: React.FC<TimerRowProps> = ({ label, initialSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      intervalRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          clearInterval(intervalRef.current!);
          // TODO: Trigger native local notification/alarm here
        }
      }, 100); // 100ms update for precise testing and rendering
    } else {
      endTimeRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimeLeft(initialSeconds);
  };

  const isFinished = timeLeft === 0;

  return (
    <div className={`flex items-center justify-between p-3 mb-2 rounded-xl border-2 transition-colors ${isRunning ? 'border-blue-500 bg-blue-50' : isFinished ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>

      {/* Label */}
      <div className="flex-1 font-medium text-gray-800 truncate pr-4">
        {label}
      </div>

      {/* Controls Area */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          disabled={isFinished}
          aria-label={isRunning ? 'pause' : 'play'}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRunning ? (
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
             <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        {/* Time Display */}
        <div className={`font-mono text-2xl font-bold w-20 text-right ${isFinished ? 'text-red-600' : 'text-gray-900'}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Reset Button (Only show if touched) */}
        {timeLeft !== initialSeconds && (
          <button
            onClick={resetTimer}
            aria-label="reset"
            className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200 transition-transform active:scale-95 ml-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TimerRow;
