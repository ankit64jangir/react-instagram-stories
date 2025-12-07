import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
import { User, StoryItem as StoryItemType, StoryItemControls } from '../types';
import { useTimer } from '../hooks/useTimer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { usePreloader } from '../hooks/usePreloader';
import { StoryProgressBars } from './StoryProgressBars';
import { StoryItem } from './StoryItem';

interface StoryViewerProps {
  users: User[];
  initialUserIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_DURATION = 5000;
const SWIPE_THRESHOLD = 60; // pixels

export const StoryViewer: React.FC<StoryViewerProps> = React.memo(({
  users,
  initialUserIndex,
  isOpen,
  onClose,
}) => {
  // State
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const scrollPositionRef = useRef(0);
  const currentDurationRef = useRef(DEFAULT_DURATION);

  // Current data
  const currentUser = users[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const totalStories = currentUser?.stories.length || 0;

  // Update duration ref when story changes
  useEffect(() => {
    currentDurationRef.current = currentStory?.duration || DEFAULT_DURATION;
  }, [currentStory?.duration]);

  // Hooks
  const focusTrapRef = useFocusTrap(isOpen);
  const isPageVisible = usePageVisibility();
  const { preloadStoryItem } = usePreloader();

  // Spring animation for smooth transitions
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { tension: 300, friction: 30 },
  }));

  // Timer onComplete callback
  const handleTimerComplete = useCallback(() => {
    if (!currentUser) return;

    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < users.length - 1) {
      // Transition to next user
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      api.start({ x: 0, immediate: true });
    } else {
      onClose();
    }
  }, [currentUser, currentStoryIndex, totalStories, currentUserIndex, users.length, api, onClose]);

  // Timer
  const timer = useTimer({
    duration: currentDurationRef.current,
    autoStart: isOpen && !isPaused,
    onComplete: handleTimerComplete,
  });

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Navigation functions
  const handleNext = useCallback(() => {
    if (!currentUser) return;

    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      timer.reset();
    } else if (currentUserIndex < users.length - 1) {
      // Transition to next user
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      api.start({ x: 0, immediate: true });
      timer.reset();
    } else {
      onClose();
    }
  }, [currentUser, currentStoryIndex, totalStories, currentUserIndex, users.length, api, timer, onClose]);

  const handlePrevious = useCallback(() => {
    if (!currentUser) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      timer.reset();
    } else if (currentUserIndex > 0) {
      // Transition to previous user
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(users[currentUserIndex - 1].stories.length - 1);
      api.start({ x: 0, immediate: true });
      timer.reset();
    }
  }, [currentUser, currentStoryIndex, currentUserIndex, users, api, timer]);

  const handleClose = useCallback(() => {
    // Restore scroll position
    window.scrollTo(0, scrollPositionRef.current);
    onClose();
  }, [onClose]);

  // Pause/Resume
  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  // Story controls for custom components
  const storyControls: StoryItemControls = useMemo(() => ({
    pause: handlePause,
    resume: handleResume,
    next: handleNext,
    prev: handlePrevious,
    setDuration: (ms: number) => timerRef.current?.setDuration(ms),
  }), [handlePause, handleResume, handleNext, handlePrevious]);

  // Handle taps for story navigation
  const handleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Prevent tap handling during drag
    if (isDragging) return;

    // Don't handle taps on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('.story-viewer-close') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea')) {
      return;
    }

    const clientX = 'touches' in event
      ? event.changedTouches[0]?.clientX
      : 'clientX' in event ? event.clientX : 0;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const isLeftSide = relativeX < rect.width / 2;

    if (isLeftSide) {
      handlePrevious();
    } else {
      handleNext();
    }
  }, [isDragging, handlePrevious, handleNext]);

  // Drag gesture (only for swipes)
  const bind = useDrag(
    ({ movement: [mx, my], velocity: [vx], down }) => {
      // Handle swipes only (no tap handling here)
      if (down) {
        setIsDragging(true);
        handlePause(); // Pause timer during drag

        // Vertical swipe (close)
        if (Math.abs(my) > Math.abs(mx) && Math.abs(my) > 50) {
          if (my > 0) { // Swipe down
            handleClose();
            return;
          }
        }

        // Horizontal swipe (user navigation)
        if (Math.abs(mx) > 20) {
          // Visual feedback
          api.start({
            x: mx,
            immediate: true
          });
        }
      } else if (isDragging) {
        setIsDragging(false);
        handleResume(); // Resume timer after drag

        // Check if swipe threshold met
        if (Math.abs(mx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5) {
          if (mx > 0 && currentUserIndex > 0) {
            // Swipe right - previous user
            setCurrentUserIndex(prev => prev - 1);
            setCurrentStoryIndex(0);
          } else if (mx < 0 && currentUserIndex < users.length - 1) {
            // Swipe left - next user
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
          }
        }

        // Reset position
        api.start({ x: 0 });
        timer.reset();
      }
    },
    {
      axis: 'x',
      filterTaps: true, // Filter out taps, handle them separately
      pointer: { touch: true },
    }
  );

  // Keyboard support
  useKeyboard({
    onLeft: handlePrevious,
    onRight: handleNext,
    onSpace: () => isPaused ? handleResume() : handlePause(),
    onEscape: handleClose,
    enabled: isOpen,
  });

  // Pause on page visibility change
  useEffect(() => {
    if (!isPageVisible) {
      handlePause();
    } else if (isPageVisible && !isPaused) {
      handleResume();
    }
  }, [isPageVisible, handlePause, handleResume, isPaused]);

  // Preload adjacent stories
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const itemsToPreload: StoryItemType[] = [];

    // Current user's adjacent stories
    if (currentStoryIndex < totalStories - 1) {
      itemsToPreload.push(currentUser.stories[currentStoryIndex + 1]);
    }
    if (currentStoryIndex > 0) {
      itemsToPreload.push(currentUser.stories[currentStoryIndex - 1]);
    }

    // Adjacent users' first stories
    if (currentUserIndex < users.length - 1) {
      itemsToPreload.push(users[currentUserIndex + 1].stories[0]);
    }
    if (currentUserIndex > 0) {
      itemsToPreload.push(users[currentUserIndex - 1].stories[0]);
    }

    // Limit concurrent preloads
    const preloadPromises = itemsToPreload.slice(0, 3).map(item =>
      preloadStoryItem(item).catch(() => {})
    );

    Promise.all(preloadPromises);
  }, [isOpen, currentUser, currentUserIndex, currentStoryIndex, totalStories, users, preloadStoryItem]);

  // Save scroll position on open
  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset on user change
  useEffect(() => {
    setCurrentStoryIndex(0);
    api.start({ x: 0, immediate: true });
  }, [currentUserIndex, api]);

  // Handle load errors
  const handleLoadError = useCallback(() => {
    console.warn('Story item failed to load, skipping...');
    setTimeout(handleNext, 500);
  }, [handleNext]);

  // Early return
  if (!isOpen || !currentUser || !currentStory) {
    return null;
  }

  const content = (
    <div
      ref={containerRef}
      className="story-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Stories by ${currentUser?.username || 'user'}`}
      aria-describedby="story-viewer-description"
      {...bind()}
    >
      <div className="story-viewer-overlay" onClick={handleClose} />

      {/* Hidden description for screen readers */}
      <div id="story-viewer-description" className="sr-only">
        Instagram-style stories viewer. Tap left side to go to previous story, right side to go to next story.
        Swipe left or right to navigate between users. Press Escape to close.
      </div>

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Viewing story {currentStoryIndex + 1} of {totalStories} by {currentUser?.username}
      </div>

       <animated.div
         ref={focusTrapRef}
         className="story-viewer-content"
         style={{
           transform: x.to(x => `translate3d(${x}px, 0, 0)`),
         }}
         onClick={handleTap}
         onTouchEnd={handleTap}
         onMouseEnter={handlePause}
         onMouseLeave={handleResume}
       >
        <div className="story-viewer-header">
          <StoryProgressBars
            total={totalStories}
            currentIndex={currentStoryIndex}
            progress={timer.progress}
          />

          <div className="story-viewer-user-info">
            <img
              src={currentUser.avatarUrl}
              alt={`${currentUser.username} avatar`}
              className="story-viewer-avatar"
            />
            <span className="story-viewer-username">{currentUser.username}</span>
          </div>

          <button
            className="story-viewer-close"
            onClick={handleClose}
            aria-label="Close story viewer"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="story-viewer-items">
          <StoryItem
            item={currentStory}
            isActive={true}
            isPaused={isPaused || isDragging}
            onDurationDetected={(duration) => timerRef.current?.setDuration(duration)}
            onLoadError={handleLoadError}
            controls={storyControls}
          />
        </div>

        <div className="story-viewer-nav-hints">
          <div className="story-viewer-nav-hint story-viewer-nav-hint-left" />
          <div className="story-viewer-nav-hint story-viewer-nav-hint-right" />
        </div>
      </animated.div>
    </div>
  );

  return createPortal(content, document.body);
});