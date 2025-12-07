import { useRef, useCallback } from 'react';

export interface UseGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onTapLeft?: () => void;
  onTapRight?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  longPressDelay?: number;
  swipeThreshold?: number;
}

export const useGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  onTapLeft,
  onTapRight,
  onLongPressStart,
  onLongPressEnd,
  longPressDelay = 500,
  swipeThreshold = 50,
}: UseGesturesOptions) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      isLongPressRef.current = false;

      // Start long press timer
      clearLongPressTimer();
      longPressTimerRef.current = window.setTimeout(() => {
        isLongPressRef.current = true;
        onLongPressStart?.();
      }, longPressDelay);
    },
    [onLongPressStart, longPressDelay, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // If moved significantly, cancel long press
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPressTimer();

      if (isLongPressRef.current) {
        isLongPressRef.current = false;
        onLongPressEnd?.();
        touchStartRef.current = null;
        return;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Swipe detection
      if (Math.abs(deltaX) > swipeThreshold && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (deltaY > swipeThreshold && deltaTime < 300) {
        onSwipeDown?.();
      } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Tap detection
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const tapX = touch.clientX - rect.left;
        const isLeftSide = tapX < rect.width / 2;

        if (isLeftSide) {
          onTapLeft?.();
        } else {
          onTapRight?.();
        }
      }

      touchStartRef.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeDown, onTapLeft, onTapRight, onLongPressEnd, swipeThreshold, clearLongPressTimer]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      touchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };

      isLongPressRef.current = false;

      clearLongPressTimer();
      longPressTimerRef.current = window.setTimeout(() => {
        isLongPressRef.current = true;
        onLongPressStart?.();
      }, longPressDelay);
    },
    [onLongPressStart, longPressDelay, clearLongPressTimer]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      clearLongPressTimer();

      if (isLongPressRef.current) {
        isLongPressRef.current = false;
        onLongPressEnd?.();
        touchStartRef.current = null;
        return;
      }

      if (!touchStartRef.current) return;

      const deltaTime = Date.now() - touchStartRef.current.time;

      if (deltaTime < 300) {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const isLeftSide = tapX < rect.width / 2;

        if (isLeftSide) {
          onTapLeft?.();
        } else {
          onTapRight?.();
        }
      }

      touchStartRef.current = null;
    },
    [onTapLeft, onTapRight, onLongPressEnd, clearLongPressTimer]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  };
};
