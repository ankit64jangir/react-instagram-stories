import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { User, StoryItem as StoryItemType, StoryItemControls } from "../types";
import { useTimer } from "../hooks/useTimer";
import { useKeyboard } from "../hooks/useKeyboard";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { usePreloader } from "../hooks/usePreloader";
import { useQueryParams } from "../hooks/useQueryParams";
import { resolveUserIndex, resolveStoryIndex } from "../utils/storyHelpers";
import { StoryProgressBars } from "./StoryProgressBars";
import { StoryItem } from "./StoryItem";

interface StoryViewerProps {
  users: User[];
  /** Required in controlled mode, ignored in query param mode */
  initialUserIndex?: number;
  initialStoryIndex?: number;
  /** When provided, component is in "controlled mode". When omitted, uses URL query params */
  isOpen?: boolean;
  /** Required in controlled mode, ignored in query param mode */
  onClose?: () => void;
  onStoryChange?: (userIndex: number, storyIndex: number) => void;
}

const DEFAULT_DURATION = 5000;

export const StoryViewer: React.FC<StoryViewerProps> = React.memo(
  ({ users, initialUserIndex, initialStoryIndex, isOpen: isOpenProp, onClose: onCloseProp, onStoryChange }) => {
    // Query param mode detection - if isOpen is not provided, use URL query params
    const isQueryParamMode = isOpenProp === undefined;

    // Native query params hook (no react-router-dom needed)
    const [searchParams, setSearchParams] = useQueryParams();

    // Parse query params: ?user={index|id}&story={index|id}
    // Read directly from window.location.search to ensure we get the params on initial load
    const queryIndices = useMemo(() => {
      if (!isQueryParamMode || users.length === 0) return null;

      // Use window.location.search directly to avoid timing issues with state
      const currentParams = new URLSearchParams(window.location.search);
      const userParam = currentParams.get('user');
      const storyParam = currentParams.get('story');

      if (!userParam) return null;

      const userIndex = resolveUserIndex(users, userParam);
      if (userIndex === -1) return null;

      const user = users[userIndex];
      const storyIndex = storyParam ? resolveStoryIndex(user, storyParam) : 0;

      return {
        userIndex,
        storyIndex: storyIndex === -1 ? 0 : storyIndex,
      };
    }, [isQueryParamMode, searchParams, users]);

    // Debug logging for query param mode
    useEffect(() => {
      if (isQueryParamMode && searchParams.get('user') && users.length > 0 && !queryIndices && process.env.NODE_ENV === 'development') {
        console.warn(
          `[react-instagram-stories] User not found: "${searchParams.get('user')}"\n` +
          `Available user IDs: ${users.map(u => u.id).join(', ')}`
        );
      }
    }, [isQueryParamMode, searchParams, users, queryIndices]);

    // Determine actual values based on mode
    const effectiveInitialUserIndex = isQueryParamMode ? (queryIndices?.userIndex ?? 0) : (initialUserIndex ?? 0);
    const effectiveInitialStoryIndex = isQueryParamMode ? (queryIndices?.storyIndex ?? 0) : (initialStoryIndex ?? 0);
    const isOpen = isQueryParamMode ? (queryIndices !== null) : (isOpenProp ?? false);

    // Close handler - clears query params in query param mode
    const onClose = useCallback(() => {
      if (isQueryParamMode) {
        setSearchParams({}, { replace: true });
      } else if (onCloseProp) {
        onCloseProp();
      }
    }, [isQueryParamMode, setSearchParams, onCloseProp]);

    // State
    const [currentUserIndex, setCurrentUserIndex] = useState(effectiveInitialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(effectiveInitialStoryIndex);
    const [isPaused, setIsPaused] = useState(false);

    // Update indices when initial props change
    useEffect(() => {
      setCurrentUserIndex(effectiveInitialUserIndex);
    }, [effectiveInitialUserIndex]);

    useEffect(() => {
      setCurrentStoryIndex(effectiveInitialStoryIndex);
    }, [effectiveInitialStoryIndex]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<
      "left" | "right" | null
    >(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);
    const currentDurationRef = useRef(DEFAULT_DURATION);
    const hasStartedLoadingRef = useRef(false);
    const isInitialMountRef = useRef(true);

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

    // Pause/Resume
    const handlePause = useCallback(() => setIsPaused(true), []);
    const handleResume = useCallback(() => setIsPaused(false), []);

    // Placeholder for handleNext - will be defined after timer
    const handleNextRef = useRef<() => void>();

    const timer = useTimer({
      duration: currentDurationRef.current || DEFAULT_DURATION,
      onComplete: () => handleNextRef.current?.(),
      autoStart: false,
    });

    // Handle video buffering
    const handleBufferingChange = useCallback((buffering: boolean) => {
      if (buffering) {
        timer.pause();
      } else if (!isPaused) {
        // Only resume if not manually paused
        timer.resume();
      }
    }, [timer, isPaused]);

    // Update timer duration when story changes
    useEffect(() => {
      const duration = currentStory?.duration || DEFAULT_DURATION;
      timer.setDuration(duration);
    }, [timer, currentStory?.duration]);

    // Navigation functions
    const handleNext = useCallback(() => {
      if (!currentUser) return;

      if (currentStoryIndex < totalStories - 1) {
        const nextIndex = currentStoryIndex + 1;
        const nextStory = currentUser.stories[nextIndex];
        const duration = nextStory?.duration || DEFAULT_DURATION;

        setCurrentStoryIndex(nextIndex);
        timer.setDuration(duration);
        timer.reset();
      } else if (currentUserIndex < users.length - 1) {
        // Show loading for next user
        setIsUserLoading(true);
        setTimeout(() => {
          // Transition to next user with slide animation
          setIsTransitioning(true);
          setTransitionDirection("left");
          setTimeout(() => {
            const nextUserIndex = currentUserIndex + 1;
            const nextUser = users[nextUserIndex];
            const firstStory = nextUser.stories[0];
            const duration = firstStory?.duration || DEFAULT_DURATION;

            setCurrentUserIndex(nextUserIndex);
            setCurrentStoryIndex(0);
            setIsTransitioning(false);
            setTransitionDirection(null);
            setIsUserLoading(false); // Hide loading after indices are updated

            timer.setDuration(duration);
            timer.reset();
          }, 150); // Match CSS transition duration
        }, 1000); // Simulate 1s loading for user data
      } else {
        onClose();
      }
    }, [
      currentUser,
      currentStoryIndex,
      totalStories,
      currentUserIndex,
      users,
      timer,
      onClose,
    ]);

    const handlePrevious = useCallback(() => {
      if (!currentUser) return;

      if (currentStoryIndex > 0) {
        const prevIndex = currentStoryIndex - 1;
        const prevStory = currentUser.stories[prevIndex];
        const duration = prevStory?.duration || DEFAULT_DURATION;

        setCurrentStoryIndex(prevIndex);
        timer.setDuration(duration);
        timer.reset();
      } else if (currentUserIndex > 0) {
        // Show loading for previous user
        setIsUserLoading(true);
        setTimeout(() => {
          // Transition to previous user with slide animation
          setIsTransitioning(true);
          setTransitionDirection("right");
          setTimeout(() => {
            const prevUserIndex = currentUserIndex - 1;
            const prevUser = users[prevUserIndex];
            const lastStoryIndex = prevUser.stories.length - 1;
            const lastStory = prevUser.stories[lastStoryIndex];
            const duration = lastStory?.duration || DEFAULT_DURATION;

            setCurrentUserIndex(prevUserIndex);
            setCurrentStoryIndex(lastStoryIndex);
            setIsTransitioning(false);
            setTransitionDirection(null);
            setIsUserLoading(false); // Hide loading after indices are updated

            timer.setDuration(duration);
            timer.reset();
          }, 150); // Match CSS transition duration
        }, 1000); // Simulate 1s loading for user data
      }
    }, [currentUser, currentStoryIndex, currentUserIndex, users, timer]);

    const handleClose = useCallback(() => {
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
      onClose();
    }, [onClose]);

    // Update the ref when handleNext changes
    useEffect(() => {
      handleNextRef.current = handleNext;
    }, [handleNext]);

    // Story controls for custom components
    const storyControls: StoryItemControls = useMemo(
      () => ({
        pause: handlePause,
        resume: handleResume,
        next: handleNext,
        prev: handlePrevious,
        setDuration: (ms: number) => timer.setDuration(ms),
      }),
      [handlePause, handleResume, handleNext, handlePrevious, timer]
    );

    // Handle taps for story navigation
    const handleTap = useCallback(
      (event: React.MouseEvent) => {
        // Don't handle taps on interactive elements
        const target = event.target as HTMLElement;
        if (
          target.closest(".story-viewer-close") ||
          target.closest("button") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("textarea")
        ) {
          return;
        }

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const isLeftSide = relativeX < rect.width / 2;

        if (isLeftSide) {
          handlePrevious();
        } else {
          handleNext();
        }
      },
      [handlePrevious, handleNext]
    );

    // Touch/mouse gesture handling
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const isDraggingRef = useRef(false);

    const handlePointerDown = useCallback(
      (event: React.PointerEvent) => {
        isDraggingRef.current = false;
        touchStartRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        handlePause();
      },
      [handlePause]
    );

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
      if (!touchStartRef.current) return;

      const deltaX = event.clientX - touchStartRef.current.x;
      const deltaY = event.clientY - touchStartRef.current.y;

      // Check if this is a drag (moved more than 10px)
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isDraggingRef.current = true;
      }
    }, []);

    // Keyboard support
    useKeyboard({
      onLeft: handlePrevious,
      onRight: handleNext,
      onSpace: () => (isPaused ? handleResume() : handlePause()),
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
      const preloadPromises = itemsToPreload
        .slice(0, 3)
        .map((item) => preloadStoryItem(item).catch(() => { }));

      Promise.all(preloadPromises);
    }, [
      isOpen,
      currentUser,
      currentUserIndex,
      currentStoryIndex,
      totalStories,
      users,
      preloadStoryItem,
    ]);

    // Handle initial loading when opening story viewer
    useEffect(() => {
      if (isOpen && !hasStartedLoadingRef.current) {
        hasStartedLoadingRef.current = true;
        setIsLoading(true);
        // Preload current story
        if (currentStory) {
          preloadStoryItem(currentStory);
        }
        // Simulate API call to fetch user stories
        setTimeout(() => {
          setIsLoading(false);
          scrollPositionRef.current = window.scrollY;
          document.body.style.overflow = "hidden";
          // Start timer when opening story viewer
          timer.resume();
        }, 1500); // Simulate 1.5s loading time
      } else if (!isOpen) {
        hasStartedLoadingRef.current = false;
        isInitialMountRef.current = true; // Reset for next open
        document.body.style.overflow = "";
        setIsLoading(false);
        setIsUserLoading(false);
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen, timer]);

    // Notify parent of story changes and update URL in query param mode
    useEffect(() => {
      if (isOpen) {
        // Skip URL update on initial mount to prevent overwriting URL params
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
          // Still notify parent callback on initial mount
          if (onStoryChange) {
            onStoryChange(currentUserIndex, currentStoryIndex);
          }
          return;
        }

        // Update URL query params (only after initial mount) - always use IDs
        if (isQueryParamMode && currentUser && currentStory) {
          const currentUserParam = searchParams.get('user');
          const currentStoryParam = searchParams.get('story');
          const newUserParam = currentUser.id;
          const newStoryParam = currentStory.id;

          if (currentUserParam !== newUserParam || currentStoryParam !== newStoryParam) {
            setSearchParams({ user: newUserParam, story: newStoryParam }, { replace: true });
          }
        }
        // Notify parent callback
        if (onStoryChange) {
          onStoryChange(currentUserIndex, currentStoryIndex);
        }
      }
    }, [currentUserIndex, currentStoryIndex, onStoryChange, isOpen, isQueryParamMode, searchParams, setSearchParams]);

    // Handle load errors
    const handleLoadError = useCallback(() => {
      console.warn("Story item failed to load, skipping...");
      setTimeout(handleNext, 500);
    }, [handleNext]);

    // Early return
    if (!isOpen) {
      return null;
    }

    if (!currentUser || !currentStory) {
      return null;
    }

    const content = (
      <div
        ref={containerRef}
        className="story-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`Stories by ${currentUser?.username || "user"}`}
        aria-describedby="story-viewer-description"
      >
        <div className="story-viewer-overlay" onClick={handleClose} />

        {/* Hidden description for screen readers */}
        <div id="story-viewer-description" className="sr-only">
          Instagram-style stories viewer. Tap left side to go to previous story,
          right side to go to next story. Swipe left or right to navigate
          between users. Press Escape to close.
        </div>

        {/* Live region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Viewing story {currentStoryIndex + 1} of {totalStories} by{" "}
          {currentUser?.username}
        </div>

        <div
          ref={focusTrapRef}
          className={`story-viewer-content ${isTransitioning
            ? `story-viewer-transitioning story-viewer-transition-${transitionDirection}`
            : ""
            }`}
          onClick={handleTap}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
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
              <span className="story-viewer-username">
                {currentUser.username}
              </span>
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
            {isLoading || isUserLoading ? (
              <div className="story-item-loader">
                <div className="story-item-spinner" />
              </div>
            ) : (
              <StoryItem
                item={currentStory}
                isActive={true}
                isPaused={isPaused || isDraggingRef.current}
                onDurationDetected={(duration) => timer.setDuration(duration)}
                onLoadError={handleLoadError}
                onBufferingChange={handleBufferingChange}
                controls={storyControls}
              />
            )}
          </div>

          <div className="story-viewer-nav-hints">
            <div className="story-viewer-nav-hint story-viewer-nav-hint-left" />
            <div className="story-viewer-nav-hint story-viewer-nav-hint-right" />
          </div>
        </div>
      </div>
    );

    return createPortal(content, document.body);
  }
);
