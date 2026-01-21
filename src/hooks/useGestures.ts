import { useRef, useCallback, useState } from 'react';

export interface DragState {
  isDragging: boolean;
  deltaY: number;
  progress: number; // 0-1 for how far the dismiss gesture has gone
}

export interface UseGesturesOptions {
  onSwipeDown?: () => void;
  dismissThreshold?: number; // How far to drag before dismissing (in pixels)
}

/**
 * Hook for swipe-down-to-close gesture with drag tracking.
 * Only handles vertical swipe down - other interactions handled elsewhere.
 */
export const useGestures = ({
  onSwipeDown,
  dismissThreshold = 150,
}: UseGesturesOptions) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    deltaY: 0,
    progress: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingVerticalRef = useRef(false);

  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      deltaY: 0,
      progress: 0,
    });
    isDraggingVerticalRef.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    isDraggingVerticalRef.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine if this is a vertical drag (only on first significant movement)
      if (!isDraggingVerticalRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        // Only track as vertical drag if moving more vertically than horizontally AND moving down
        isDraggingVerticalRef.current = Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0;
      }

      // Update drag state for vertical drags (swipe down to close)
      if (isDraggingVerticalRef.current && deltaY > 0) {
        const progress = Math.min(deltaY / dismissThreshold, 1);
        setDragState({
          isDragging: true,
          deltaY,
          progress,
        });
      }
    },
    [dismissThreshold]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    // Check if we should dismiss (swipe down past threshold)
    if (isDraggingVerticalRef.current && dragState.deltaY > dismissThreshold * 0.5) {
      onSwipeDown?.();
    }

    touchStartRef.current = null;
    resetDragState();
  }, [onSwipeDown, dismissThreshold, dragState.deltaY, resetDragState]);

  return {
    dragState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
