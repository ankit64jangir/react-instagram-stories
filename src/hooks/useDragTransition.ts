import { useRef, useCallback, useState } from 'react';

export interface UseDragTransitionOptions {
  onDragChange?: (progress: number, direction: 'left' | 'right' | null) => void;
  onDragEnd?: (shouldTransition: boolean, direction: 'left' | 'right') => void;
  onTapLeft?: () => void;
  onTapRight?: () => void;
  onSwipeDown?: () => void;
  dragThreshold?: number;
  transitionThreshold?: number;
}

export const useDragTransition = ({
  onDragChange,
  onDragEnd,
  onTapLeft,
  onTapRight,
  onSwipeDown,
  dragThreshold = 10,
  transitionThreshold = 0.3, // 30% of screen width
}: UseDragTransitionOptions) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    };
    isDraggingRef.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!touchStartRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - touchStartRef.current.x;
      const deltaY = clientY - touchStartRef.current.y;

      // Check for vertical swipe down
      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 50) {
        onSwipeDown?.();
        touchStartRef.current = null;
        return;
      }

      // Start dragging if moved beyond threshold
      if (!isDraggingRef.current && Math.abs(deltaX) > dragThreshold) {
        isDraggingRef.current = true;
        setIsDragging(true);
      }

      if (isDraggingRef.current) {
        const width = window.innerWidth;
        const progress = Math.abs(deltaX) / width;
        const direction = deltaX > 0 ? 'right' : 'left';
        
        onDragChange?.(Math.min(progress, 1), direction);
      }
    },
    [onDragChange, onSwipeDown, dragThreshold]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!touchStartRef.current) return;

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      const deltaX = clientX - touchStartRef.current.x;
      const deltaY = clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      if (isDraggingRef.current) {
        // Determine if should complete transition
        const width = window.innerWidth;
        const progress = Math.abs(deltaX) / width;
        const shouldTransition = progress > transitionThreshold;
        const direction = deltaX > 0 ? 'right' : 'left';

        onDragEnd?.(shouldTransition, direction);
        
        isDraggingRef.current = false;
        setIsDragging(false);
      } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
        // Tap detection
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const tapX = clientX - rect.left;
        const isLeftSide = tapX < rect.width / 2;

        if (isLeftSide) {
          onTapLeft?.();
        } else {
          onTapRight?.();
        }
      }

      touchStartRef.current = null;
    },
    [onDragEnd, onTapLeft, onTapRight, transitionThreshold]
  );

  return {
    isDragging,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseMove: handleTouchMove,
    onMouseUp: handleTouchEnd,
  };
};
