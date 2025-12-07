import { useEffect } from 'react';

export interface UseKeyboardOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useKeyboard = ({
  onLeft,
  onRight,
  onSpace,
  onEscape,
  enabled = true,
}: UseKeyboardOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onRight?.();
          break;
        case ' ':
          e.preventDefault();
          onSpace?.();
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onLeft, onRight, onSpace, onEscape, enabled]);
};
