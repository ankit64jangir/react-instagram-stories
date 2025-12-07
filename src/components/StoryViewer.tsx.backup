import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDrag } from '@use-gesture/react';
import { useSpring, animated, config } from '@react-spring/web';
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

export const StoryViewer: React.FC<StoryViewerProps> = ({
  users,
  initialUserIndex,
  isOpen,
  onClose,
}) => {
  // All state hooks first
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [customPaused, setCustomPaused] = useState(false);
  const [nextUserIndex, setNextUserIndex] = useState<number | null>(null);
  
  // All refs
  const timerRef = useRef<any>(null);
  const isTransitioningRef = useRef(false);
  
  // Spring animation for smooth drag
  const [{ x, rotateY, opacity }, api] = useSpring(() => ({
    x: 0,
    rotateY: 0,
    opacity: 1,
    config: config.stiff,
  }));
  
  // Custom hooks
  const containerRef = useFocusTrap(isOpen);
  const isPageVisible = usePageVisibility();
  const { preloadStoryItem } = usePreloader();

  // Compute current user/story (safe to do before early return)
  const currentUser = users[currentUserIndex] || null;
  const currentStory = currentUser?.stories[currentStoryIndex] || null;
  const totalStories = currentUser?.stories.length || 0;
  const currentDuration = currentStory?.duration || DEFAULT_DURATION;
  
  // Get next user for transition
  const nextUser = nextUserIndex !== null ? users[nextUserIndex] : null;
  const nextStory = nextUser?.stories[0] || null;

  // All useCallback hooks
  const handleNext = useCallback(() => {
    if (!currentUser) return;
    
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      timerRef.current?.reset();
    } else if (currentUserIndex < users.length - 1) {
      setNextUserIndex(currentUserIndex + 1);
      setUserTransition('left');
      setTimeout(() => {
        setCurrentUserIndex((prev) => prev + 1);
        setCurrentStoryIndex(0);
        timerRef.current?.reset();
        setUserTransition('none');
        setNextUserIndex(null);
      }, 400);
    } else {
      onClose();
    }
  }, [currentUser, currentStoryIndex, totalStories, currentUserIndex, users.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (!currentUser) return;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      timerRef.current?.reset();
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      setNextUserIndex(prevUserIndex);
      setUserTransition('right');
      setTimeout(() => {
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex(users[prevUserIndex].stories.length - 1);
        timerRef.current?.reset();
        setUserTransition('none');
        setNextUserIndex(null);
      }, 400);
    }
  }, [currentUser, currentStoryIndex, currentUserIndex, users]);

  const handleNextUser = useCallback(() => {
    if (currentUserIndex < users.length - 1) {
      console.log('Transitioning to next user with LEFT animation');
      setNextUserIndex(currentUserIndex + 1);
      setUserTransition('left');
      setTimeout(() => {
        setCurrentUserIndex((prev) => prev + 1);
        setCurrentStoryIndex(0);
        timerRef.current?.reset();
        setUserTransition('none');
        setNextUserIndex(null);
        console.log('Transition complete');
      }, 400);
    } else {
      onClose();
    }
  }, [currentUserIndex, users.length, onClose]);

  const handlePrevUser = useCallback(() => {
    if (currentUserIndex > 0) {
      console.log('Transitioning to previous user with RIGHT animation');
      const prevUserIndex = currentUserIndex - 1;
      setNextUserIndex(prevUserIndex);
      setUserTransition('right');
      setTimeout(() => {
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex(0);
        timerRef.current?.reset();
        setUserTransition('none');
        setNextUserIndex(null);
        console.log('Transition complete');
      }, 400);
    }
  }, [currentUserIndex]);

  const handleTogglePause = useCallback(() => {
    if (timerRef.current) {
      if (timerRef.current.isPaused) {
        timerRef.current.resume();
      } else {
        timerRef.current.pause();
      }
    }
  }, []);

  const handleDurationDetected = useCallback(
    (duration: number) => {
      if (!currentStory?.duration && timerRef.current) {
        timerRef.current.setDuration(duration);
      }
    },
    [currentStory?.duration]
  );

  const handleLoadError = useCallback(() => {
    console.warn('Story item failed to load, skipping...');
    setTimeout(handleNext, 500);
  }, [handleNext]);

  // Timer hook
  const timer = useTimer({
    duration: currentDuration,
    autoStart: isOpen,
    onComplete: handleNext,
  });

  // Store timer in ref
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Compute isPaused
  const isPaused = timer.isPaused || isHovered || customPaused || !isPageVisible;

  // Story item controls for custom components
  const storyControls: StoryItemControls = useMemo(
    () => ({
      pause: () => setCustomPaused(true),
      resume: () => setCustomPaused(false),
      next: handleNext,
      prev: handlePrevious,
      setDuration: (ms: number) => timerRef.current?.setDuration(ms),
    }),
    [handleNext, handlePrevious]
  );

  // Drag-based transition handlers
  const handleDragChange = useCallback((progress: number, direction: 'left' | 'right' | null) => {
    setDragProgress(progress);
    setDragDirection(direction);
    
    // Set next user index based on direction
    if (!isTransitioningRef.current && progress > 0.1) {
      if (direction === 'left' && currentUserIndex < users.length - 1) {
        setNextUserIndex(currentUserIndex + 1);
      } else if (direction === 'right' && currentUserIndex > 0) {
        setNextUserIndex(currentUserIndex - 1);
      }
    }
  }, [currentUserIndex, users.length]);

  const handleDragEnd = useCallback((shouldTransition: boolean, direction: 'left' | 'right') => {
    if (shouldTransition) {
      isTransitioningRef.current = true;
      
      if (direction === 'left' && currentUserIndex < users.length - 1) {
        handleNextUser();
      } else if (direction === 'right' && currentUserIndex > 0) {
        handlePrevUser();
      }
      
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 400);
    } else {
      // Reset to original position
      setNextUserIndex(null);
    }
    
    setDragProgress(0);
    setDragDirection(null);
  }, [currentUserIndex, users.length, handleNextUser, handlePrevUser]);

  const dragHandlers = useDragTransition({
    onDragChange: handleDragChange,
    onDragEnd: handleDragEnd,
    onTapLeft: handlePrevious,
    onTapRight: handleNext,
    onSwipeDown: onClose,
  });

  // Keyboard handlers
  useKeyboard({
    onLeft: handlePrevious,
    onRight: handleNext,
    onSpace: handleTogglePause,
    onEscape: onClose,
    enabled: isOpen,
  });

  // All useEffect hooks
  // Sync timer pause state
  useEffect(() => {
    if (isPaused && !timer.isPaused) {
      timer.pause();
    } else if (!isPaused && timer.isPaused) {
      timer.resume();
    }
  }, [isPaused, timer]);

  // Preload adjacent stories
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const preloadAdjacent = async () => {
      const itemsToPreload: StoryItemType[] = [];

      if (currentStoryIndex < totalStories - 1) {
        itemsToPreload.push(currentUser.stories[currentStoryIndex + 1]);
      }

      if (currentStoryIndex > 0) {
        itemsToPreload.push(currentUser.stories[currentStoryIndex - 1]);
      }

      if (currentStoryIndex === totalStories - 1 && currentUserIndex < users.length - 1) {
        itemsToPreload.push(users[currentUserIndex + 1].stories[0]);
      }

      for (const item of itemsToPreload) {
        preloadStoryItem(item).catch(() => {});
      }
    };

    preloadAdjacent();
  }, [isOpen, currentUser, currentUserIndex, currentStoryIndex, totalStories, users, preloadStoryItem]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(initialUserIndex);
      setCurrentStoryIndex(0);
      setUserTransition('none');
      setCustomPaused(false);
      if (timerRef.current) {
        timerRef.current.reset();
      }
    }
  }, [isOpen, initialUserIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Preload next user's first story during transition
  useEffect(() => {
    if (nextUser && nextStory) {
      preloadStoryItem(nextStory).catch(() => {});
    }
  }, [nextUser, nextStory, preloadStoryItem]);

  // Debug: Log transition state changes
  useEffect(() => {
    if (userTransition !== 'none') {
      console.log('User transition state:', userTransition);
    }
  }, [userTransition]);

  // Early return AFTER all hooks
  if (!isOpen || !currentUser || !currentStory) {
    return null;
  }

  const renderStoryContent = (user: User, storyIndex: number, isNext: boolean = false) => {
    const story = user.stories[storyIndex];
    const userTotalStories = user.stories.length;
    
    return (
      <div className="story-viewer-content" key={user.id}>
        {/* Header */}
        <div className="story-viewer-header">
          <StoryProgressBars
            total={userTotalStories}
            currentIndex={storyIndex}
            progress={isNext ? 0 : timer.progress}
          />

          <div className="story-viewer-user-info">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="story-viewer-avatar"
            />
            <span className="story-viewer-username">{user.username}</span>
          </div>

          {!isNext && (
            <button
              className="story-viewer-close"
              onClick={onClose}
              aria-label="Close story viewer"
            >
              ×
            </button>
          )}
        </div>

        {/* Story Items */}
        <div className="story-viewer-items">
          <div className="story-viewer-item-wrapper">
            <StoryItem
              item={story}
              isActive={!isNext}
              isPaused={isPaused || isNext}
              onDurationDetected={handleDurationDetected}
              onLoadError={handleLoadError}
              controls={storyControls}
            />
          </div>
        </div>

        {/* Navigation hints */}
        {!isNext && (
          <div className="story-viewer-nav-hints">
            <div className="story-viewer-nav-hint story-viewer-nav-hint-left" />
            <div className="story-viewer-nav-hint story-viewer-nav-hint-right" />
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div
      className={`story-viewer ${userTransition !== 'none' ? `story-viewer-transition-${userTransition}` : ''}`}
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandlers}
    >
      <div className="story-viewer-overlay" onClick={onClose} />

      {/* Current user story */}
      <div 
        className={`story-viewer-slide ${userTransition !== 'none' ? 'slide-current' : ''}`}
        style={{
          transform: dragProgress > 0 && dragDirection
            ? `translate3d(${dragDirection === 'left' ? -dragProgress * 100 : dragProgress * 100}%, 0, 0) rotateY(${dragDirection === 'left' ? dragProgress * 90 : -dragProgress * 90}deg)`
            : undefined,
          opacity: dragProgress > 0 ? 1 - dragProgress * 0.7 : 1,
        }}
      >
        {renderStoryContent(currentUser, currentStoryIndex, false)}
      </div>

      {/* Next user story (during transition or drag) */}
      {(nextUser && nextStory) && (
        <div 
          className={`story-viewer-slide ${userTransition !== 'none' ? `slide-next-${userTransition}` : ''}`}
          style={{
            transform: dragProgress > 0 && dragDirection
              ? `translate3d(${dragDirection === 'left' ? (1 - dragProgress) * 100 : -(1 - dragProgress) * 100}%, 0, 0) rotateY(${dragDirection === 'left' ? -(1 - dragProgress) * 90 : (1 - dragProgress) * 90}deg)`
              : dragDirection === 'left' 
                ? 'translate3d(100%, 0, 0) rotateY(-90deg)'
                : 'translate3d(-100%, 0, 0) rotateY(90deg)',
            opacity: dragProgress > 0 ? 0.3 + dragProgress * 0.7 : 0.3,
          }}
        >
          {renderStoryContent(nextUser, 0, true)}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};
