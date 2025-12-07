import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseTimerOptions {
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface UseTimerReturn {
  progress: number; // 0 to 1
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setDuration: (ms: number) => void;
}

export const useTimer = ({
  duration,
  onComplete,
  autoStart = true,
}: UseTimerOptions): UseTimerReturn => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [currentDuration, setCurrentDuration] = useState(duration);
  
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (!startTimeRef.current || isPaused) return;

    const elapsed = Date.now() - startTimeRef.current + accumulatedTimeRef.current;
    const newProgress = Math.min(elapsed / currentDuration, 1);
    
    setProgress(newProgress);

    if (newProgress >= 1) {
      onComplete?.();
      return;
    }

    rafRef.current = requestAnimationFrame(updateProgress);
  }, [currentDuration, isPaused, onComplete]);

  const pause = useCallback(() => {
    if (isPaused) return;
    
    if (startTimeRef.current) {
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
    }
    
    setIsPaused(true);
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [isPaused]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    
    startTimeRef.current = Date.now();
    setIsPaused(false);
  }, [isPaused]);

  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    accumulatedTimeRef.current = 0;
    setProgress(0);
    setIsPaused(false);
  }, []);

  const setDuration = useCallback((ms: number) => {
    setCurrentDuration(ms);
  }, []);

  // Start/restart animation loop when paused state changes
  useEffect(() => {
    if (!isPaused) {
      startTimeRef.current = Date.now();
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPaused, updateProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    progress,
    isPaused,
    pause,
    resume,
    reset,
    setDuration,
  };
};
