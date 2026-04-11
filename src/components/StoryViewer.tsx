import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { User, StoryItem as StoryItemType, StoryItemControls, StoryViewerClassNames } from "../types";
import { useTimer } from "../hooks/useTimer";
import { useKeyboard } from "../hooks/useKeyboard";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { usePreloader } from "../hooks/usePreloader";
import { useQueryParams } from "../hooks/useQueryParams";
import { resolveUserIndex, resolveStoryIndex, cn } from "../utils/storyHelpers";
import { StoryProgressBars } from "./StoryProgressBars";
import { StoryItem } from "./StoryItem";

interface StoryViewerProps {
  users: User[];
  initialUserIndex?: number;
  initialStoryIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onStoryChange?: (userIndex: number, storyIndex: number) => void;
  classNames?: StoryViewerClassNames;
}

const DEFAULT_DURATION = 5000;
const CUBE_SNAP_MS = 350;
const DRAG_THRESHOLD_PX = 12;
const SNAP_THRESHOLD = 0.3; // 30% of face width

// ── Cube state ──
// Stores the user indices for the three cube faces.
interface CubeState {
  leftUserIndex: number;  // previous (or same at edge)
  rightUserIndex: number; // next (or same at edge)
}

interface DragInfo {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  pointerId: number;
  target: EventTarget | null; // original pointerDown target (for tap detection)
}

// ── Cube geometry helpers ──
// Faces: left = rotateY(-90°), front = rotateY(0°), right = rotateY(90°).
// Wrapper default = rotateY(0°) → front face visible.
// percentage > 0 (drag right) → rotateY(+90°) → left/prev face visible.
// percentage < 0 (drag left)  → rotateY(-90°) → right/next face visible.
function cubeTransform(depth: number, percentage: number): string {
  return `translateZ(${-depth}px) rotateY(${percentage * 90}deg)`;
}

export const StoryViewer: React.FC<StoryViewerProps> = React.memo(
  ({ users, initialUserIndex, initialStoryIndex, isOpen: isOpenProp, onClose: onCloseProp, onStoryChange, classNames }) => {
    // ── Query param mode ──
    const isQueryParamMode = isOpenProp === undefined;
    const [searchParams, setSearchParams] = useQueryParams();

    const queryIndices = useMemo(() => {
      if (!isQueryParamMode || users.length === 0) return null;
      const currentParams = new URLSearchParams(window.location.search);
      const userParam = currentParams.get('user');
      const storyParam = currentParams.get('story');
      if (!userParam) return null;
      const userIndex = resolveUserIndex(users, userParam);
      if (userIndex === -1) return null;
      const user = users[userIndex];
      const storyIndex = storyParam ? resolveStoryIndex(user, storyParam) : 0;
      return { userIndex, storyIndex: storyIndex === -1 ? 0 : storyIndex };
    }, [isQueryParamMode, searchParams, users]);

    useEffect(() => {
      if (isQueryParamMode && searchParams.get('user') && users.length > 0 && !queryIndices && process.env.NODE_ENV === 'development') {
        console.warn(
          `[react-instagram-stories] User not found: "${searchParams.get('user')}"\n` +
          `Available user IDs: ${users.map(u => u.id).join(', ')}`
        );
      }
    }, [isQueryParamMode, searchParams, users, queryIndices]);

    const effectiveInitialUserIndex = isQueryParamMode ? (queryIndices?.userIndex ?? 0) : (initialUserIndex ?? 0);
    const effectiveInitialStoryIndex = isQueryParamMode ? (queryIndices?.storyIndex ?? 0) : (initialStoryIndex ?? 0);
    const isOpen = isQueryParamMode ? (queryIndices !== null) : (isOpenProp ?? false);

    const onClose = useCallback(() => {
      if (isQueryParamMode) {
        setSearchParams({}, { replace: true });
      } else if (onCloseProp) {
        onCloseProp();
      }
    }, [isQueryParamMode, setSearchParams, onCloseProp]);

    // ── Core state ──
    const [currentUserIndex, setCurrentUserIndex] = useState(effectiveInitialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(effectiveInitialStoryIndex);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => { setCurrentUserIndex(effectiveInitialUserIndex); }, [effectiveInitialUserIndex]);
    useEffect(() => { setCurrentStoryIndex(effectiveInitialStoryIndex); }, [effectiveInitialStoryIndex]);

    const [cubeState, setCubeState] = useState<CubeState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);

    // ── Refs ──
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);
    const currentDurationRef = useRef(DEFAULT_DURATION);
    const hasStartedLoadingRef = useRef(false);
    const isInitialMountRef = useRef(true);

    // Cube refs (imperative for 60 fps drag)
    const cubeWrapperRef = useRef<HTMLDivElement>(null);
    const cubeDragRef = useRef<DragInfo | null>(null);
    const faceWidthRef = useRef(0);
    const isSnappingRef = useRef(false);

    // Track last viewed story index per user (for resuming on back-navigation)
    const lastViewedStoryRef = useRef<Map<number, number>>(new Map());

    // Current data
    const currentUser = users[currentUserIndex];
    const currentStory = currentUser?.stories[currentStoryIndex];
    const totalStories = currentUser?.stories.length || 0;

    useEffect(() => { currentDurationRef.current = currentStory?.duration || DEFAULT_DURATION; }, [currentStory?.duration]);

    // Track last viewed story per user (so we can resume on back-navigation)
    useEffect(() => {
      lastViewedStoryRef.current.set(currentUserIndex, currentStoryIndex);
    }, [currentUserIndex, currentStoryIndex]);

    // ── Hooks ──
    const focusTrapRef = useFocusTrap(isOpen);
    const isPageVisible = usePageVisibility();
    const { preloadStoryItem } = usePreloader();

    const handlePause = useCallback(() => setIsPaused(true), []);
    const handleResume = useCallback(() => setIsPaused(false), []);

    const handleNextRef = useRef<() => void>();

    const timer = useTimer({
      duration: currentDurationRef.current || DEFAULT_DURATION,
      onComplete: () => handleNextRef.current?.(),
      autoStart: false,
    });

    const handleBufferingChange = useCallback((buffering: boolean) => {
      if (buffering) { timer.pause(); }
      else if (!isPaused) { timer.resume(); }
    }, [timer, isPaused]);

    useEffect(() => { timer.setDuration(currentStory?.duration || DEFAULT_DURATION); }, [timer, currentStory?.duration]);

    // ── Cube helpers ──

    /** Build CubeState from current indices */
    const buildCubeState = useCallback((): CubeState => ({
      leftUserIndex: Math.max(0, currentUserIndex - 1),
      rightUserIndex: Math.min(users.length - 1, currentUserIndex + 1),
    }), [currentUserIndex, users.length]);

    /** Finalize cube: update indices, teardown.
     *  CRITICAL: clear imperative styles BEFORE setting state, otherwise the
     *  stale wrapper.style.transform (e.g. rotateY(-90deg)) persists for one
     *  frame after React removes the inline cube styles, causing a visible spin. */
    const finalizeCube = useCallback((targetUserIndex: number, targetStoryIndex: number) => {
      const targetUser = users[targetUserIndex];
      const targetStory = targetUser.stories[targetStoryIndex];
      const duration = targetStory?.duration || DEFAULT_DURATION;

      // Wipe every imperative style we touched during drag / snap
      const wrapper = cubeWrapperRef.current;
      if (wrapper) {
        wrapper.style.transition = '';
        wrapper.style.transform = '';
        wrapper.style.transformStyle = '';
      }
      const viewport = wrapper?.parentElement;
      if (viewport) {
        viewport.style.perspective = '';
      }

      setCurrentUserIndex(targetUserIndex);
      setCurrentStoryIndex(targetStoryIndex);
      setCubeState(null);
      isSnappingRef.current = false;
      faceWidthRef.current = 0;

      timer.setDuration(duration);
      timer.reset();
    }, [users, timer]);

    /** Programmatic cube animation (auto-advance on timer complete) */
    const animateCubeTo = useCallback((direction: 'next' | 'prev') => {
      const cube = buildCubeState();
      setCubeState(cube);
      isSnappingRef.current = true;

      // Two rAFs: first to render DOM, second to apply transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const wrapper = cubeWrapperRef.current;
          if (!wrapper) {
            const idx = direction === 'next' ? cube.rightUserIndex : cube.leftUserIndex;
            const storyIdx = direction === 'next' ? 0 : (lastViewedStoryRef.current.get(idx) ?? 0);
            finalizeCube(idx, storyIdx);
            return;
          }

          const width = wrapper.offsetWidth;
          const depth = width / 2;
          faceWidthRef.current = width;
          wrapper.style.setProperty('--face-depth', `${depth}px`);
          const viewport = wrapper.parentElement;
          if (viewport) viewport.style.perspective = `${depth * 16}px`;

          // Start at front face
          wrapper.style.transition = 'none';
          wrapper.style.transform = cubeTransform(depth, 0);

          // Next frame: animate to target
          requestAnimationFrame(() => {
            wrapper.style.transition = `transform ${CUBE_SNAP_MS}ms cubic-bezier(0.32, 0.72, 0.37, 0.98)`;
            const targetPct = direction === 'next' ? -1 : 1;
            wrapper.style.transform = cubeTransform(depth, targetPct);

            const idx = direction === 'next' ? cube.rightUserIndex : cube.leftUserIndex;
            const storyIdx = direction === 'next'
              ? 0
              : (lastViewedStoryRef.current.get(idx) ?? 0);
            setTimeout(() => finalizeCube(idx, storyIdx), CUBE_SNAP_MS);
          });
        });
      });
    }, [buildCubeState, finalizeCube, users]);

    // ── Navigation ──

    const handleNext = useCallback(() => {
      if (!currentUser || cubeState || isSnappingRef.current) return;

      if (currentStoryIndex < totalStories - 1) {
        // Next story within same user
        const nextIndex = currentStoryIndex + 1;
        const nextStory = currentUser.stories[nextIndex];
        setCurrentStoryIndex(nextIndex);
        timer.setDuration(nextStory?.duration || DEFAULT_DURATION);
        timer.reset();
      } else if (currentUserIndex < users.length - 1) {
        // Last story → auto-advance to next user via cube transition
        animateCubeTo('next');
      } else {
        onClose();
      }
    }, [currentUser, cubeState, currentStoryIndex, totalStories, currentUserIndex, users, timer, onClose, animateCubeTo]);

    const handlePrevious = useCallback(() => {
      if (!currentUser || cubeState || isSnappingRef.current) return;

      if (currentStoryIndex > 0) {
        const prevIndex = currentStoryIndex - 1;
        const prevStory = currentUser.stories[prevIndex];
        setCurrentStoryIndex(prevIndex);
        timer.setDuration(prevStory?.duration || DEFAULT_DURATION);
        timer.reset();
      } else if (currentUserIndex > 0) {
        animateCubeTo('prev');
      }
    }, [currentUser, cubeState, currentStoryIndex, currentUserIndex, users, timer, animateCubeTo]);

    const handleClose = useCallback(() => {
      window.scrollTo(0, scrollPositionRef.current);
      onClose();
    }, [onClose]);

    useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

    const storyControls: StoryItemControls = useMemo(() => ({
      pause: handlePause,
      resume: handleResume,
      next: handleNext,
      prev: handlePrevious,
      setDuration: (ms: number) => timer.setDuration(ms),
    }), [handlePause, handleResume, handleNext, handlePrevious, timer]);

    // ── Pointer / drag events ──
    // Placed on the story-viewer container so they survive DOM swaps.

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
      if ((event.target as HTMLElement).closest('.story-viewer-overlay')) return;
      if (isSnappingRef.current) return;

      cubeDragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        isDragging: false,
        pointerId: event.pointerId,
        target: event.target,
      };

      containerRef.current?.setPointerCapture(event.pointerId);
      handlePause();
    }, [handlePause]);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
      const drag = cubeDragRef.current;
      if (!drag || isSnappingRef.current) return;

      drag.currentX = event.clientX;
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      // ── Detect drag start ──
      if (!drag.isDragging) {
        if (Math.abs(deltaX) > DRAG_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          drag.isDragging = true;
          setCubeState(buildCubeState());
        }
        return;
      }

      // ── Real-time cube rotation (imperative for 60 fps) ──
      const wrapper = cubeWrapperRef.current;
      if (!wrapper) return;

      if (!faceWidthRef.current) {
        faceWidthRef.current = wrapper.offsetWidth;
        wrapper.style.setProperty('--face-depth', `${faceWidthRef.current / 2}px`);
      }

      const fw = faceWidthRef.current;
      let pct = deltaX / fw;
      pct = Math.max(-0.95, Math.min(0.95, pct));

      // Prevent dragging past first / last user
      if (currentUserIndex === 0 && pct > 0) pct = 0;
      if (currentUserIndex === users.length - 1 && pct < 0) pct = 0;

      wrapper.style.transition = 'none';
      wrapper.style.transform = cubeTransform(fw / 2, pct);
    }, [currentUserIndex, users.length, buildCubeState]);

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
      const drag = cubeDragRef.current;
      cubeDragRef.current = null;
      if (!drag) return;

      try { containerRef.current?.releasePointerCapture(drag.pointerId); } catch { /* ok */ }

      if (drag.isDragging && cubeState) {
        const fw = faceWidthRef.current || 400;
        const depth = fw / 2;
        let pct = (event.clientX - drag.startX) / fw;
        pct = Math.max(-1, Math.min(1, pct));

        // Edge clamping
        if (currentUserIndex === 0 && pct > 0) pct = 0;
        if (currentUserIndex === users.length - 1 && pct < 0) pct = 0;

        // Determine snap target
        let targetPct: number;
        if (Math.abs(pct) > SNAP_THRESHOLD) {
          targetPct = pct > 0 ? 1 : -1;
        } else {
          targetPct = 0;
        }

        const wrapper = cubeWrapperRef.current;
        if (!wrapper) { setCubeState(null); handleResume(); return; }

        isSnappingRef.current = true;
        wrapper.style.transition = `transform ${CUBE_SNAP_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        wrapper.style.transform = cubeTransform(depth, targetPct);

        setTimeout(() => {
          if (targetPct === -1) {
            // Snapped to next user (right face)
            finalizeCube(cubeState.rightUserIndex, 0);
          } else if (targetPct === 1) {
            // Snapped to prev user — resume where they left off
            const resumeIdx = lastViewedStoryRef.current.get(cubeState.leftUserIndex) ?? 0;
            finalizeCube(cubeState.leftUserIndex, resumeIdx);
          } else {
            // Snapped back to current — clear imperative styles
            const w = cubeWrapperRef.current;
            if (w) { w.style.transition = ''; w.style.transform = ''; w.style.transformStyle = ''; }
            const vp = w?.parentElement;
            if (vp) { vp.style.perspective = ''; }
            setCubeState(null);
            isSnappingRef.current = false;
            faceWidthRef.current = 0;
            handleResume();
          }
        }, CUBE_SNAP_MS);
      } else {
        // ── Tap — navigate stories ──
        handleResume();

        // Use the ORIGINAL pointerDown target, not event.target
        // (pointer capture retargets pointerUp to the capturing element)
        const target = (drag.target as HTMLElement) || (event.target as HTMLElement);
        if (
          target.closest(".story-viewer-close") ||
          target.closest("button") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("textarea")
        ) return;

        const contentEl =
          containerRef.current?.querySelector('.story-viewer-content') ||
          containerRef.current?.querySelector('.story-viewer-cube-viewport');
        if (!contentEl) return;

        const rect = contentEl.getBoundingClientRect();
        if (
          event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom
        ) return;

        const relativeX = event.clientX - rect.left;
        if (relativeX < rect.width / 2) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    }, [cubeState, currentUserIndex, users, finalizeCube, handleResume, handlePrevious, handleNext]);

    // ── Sync cube rotation when cube first mounts from drag ──
    useLayoutEffect(() => {
      const wrapper = cubeWrapperRef.current;
      if (!cubeState || !wrapper) return;

      const width = wrapper.offsetWidth;
      faceWidthRef.current = width;
      const depth = width / 2;
      wrapper.style.setProperty('--face-depth', `${depth}px`);

      // Also set perspective on the viewport element explicitly
      const viewport = wrapper.parentElement;
      if (viewport) viewport.style.perspective = `${depth * 16}px`;

      // If mounting from a drag, sync rotation to current finger position
      const drag = cubeDragRef.current;
      if (drag?.isDragging) {
        let pct = (drag.currentX - drag.startX) / width;
        pct = Math.max(-0.95, Math.min(0.95, pct));
        if (currentUserIndex === 0 && pct > 0) pct = 0;
        if (currentUserIndex === users.length - 1 && pct < 0) pct = 0;

        wrapper.style.transition = 'none';
        wrapper.style.transform = cubeTransform(depth, pct);
      }
    }, [cubeState, currentUserIndex, users.length]);

    // ── Keyboard ──
    useKeyboard({
      onLeft: handlePrevious,
      onRight: handleNext,
      onSpace: () => (isPaused ? handleResume() : handlePause()),
      onEscape: handleClose,
      enabled: isOpen,
    });

    // ── Page visibility ──
    useEffect(() => {
      if (!isPageVisible) handlePause();
      else if (isPageVisible && !isPaused) handleResume();
    }, [isPageVisible, handlePause, handleResume, isPaused]);

    // ── Preload adjacent stories ──
    useEffect(() => {
      if (!isOpen || !currentUser) return;
      const itemsToPreload: StoryItemType[] = [];
      if (currentStoryIndex < totalStories - 1) itemsToPreload.push(currentUser.stories[currentStoryIndex + 1]);
      if (currentStoryIndex > 0) itemsToPreload.push(currentUser.stories[currentStoryIndex - 1]);
      if (currentUserIndex < users.length - 1) itemsToPreload.push(users[currentUserIndex + 1].stories[0]);
      if (currentUserIndex > 0) itemsToPreload.push(users[currentUserIndex - 1].stories[0]);
      itemsToPreload.slice(0, 3).forEach((item) => preloadStoryItem(item).catch(() => {}));
    }, [isOpen, currentUser, currentUserIndex, currentStoryIndex, totalStories, users, preloadStoryItem]);

    // ── Initial loading ──
    useEffect(() => {
      if (isOpen && !hasStartedLoadingRef.current) {
        hasStartedLoadingRef.current = true;
        setIsLoading(true);
        if (currentStory) preloadStoryItem(currentStory);
        setTimeout(() => {
          setIsLoading(false);
          scrollPositionRef.current = window.scrollY;
          document.body.style.overflow = "hidden";
          timer.resume();
        }, 1500);
      } else if (!isOpen) {
        hasStartedLoadingRef.current = false;
        isInitialMountRef.current = true;
        document.body.style.overflow = "";
        setIsLoading(false);
        setIsUserLoading(false);
        setCubeState(null);
        isSnappingRef.current = false;
        faceWidthRef.current = 0;
      }
      return () => { document.body.style.overflow = ""; };
    }, [isOpen, timer]);

    // ── Notify parent / update URL ──
    useEffect(() => {
      if (!isOpen) return;
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        onStoryChange?.(currentUserIndex, currentStoryIndex);
        return;
      }
      if (isQueryParamMode && currentUser && currentStory) {
        const curU = searchParams.get('user');
        const curS = searchParams.get('story');
        if (curU !== currentUser.id || curS !== currentStory.id) {
          setSearchParams({ user: currentUser.id, story: currentStory.id }, { replace: true });
        }
      }
      onStoryChange?.(currentUserIndex, currentStoryIndex);
    }, [currentUserIndex, currentStoryIndex, onStoryChange, isOpen, isQueryParamMode, searchParams, setSearchParams]);

    const handleLoadError = useCallback(() => {
      console.warn("Story item failed to load, skipping...");
      setTimeout(handleNext, 500);
    }, [handleNext]);

    // ── Render ──

    if (!isOpen) return null;
    if (!currentUser || !currentStory) return null;

    // Resolve the three cube faces
    const leftUser = cubeState ? users[cubeState.leftUserIndex] : null;
    const rightUser = cubeState ? users[cubeState.rightUserIndex] : null;
    // Left face: resume where the user left off (or story 0 if never viewed)
    const leftStoryIdx = cubeState && cubeState.leftUserIndex < currentUserIndex
      ? (lastViewedStoryRef.current.get(cubeState.leftUserIndex) ?? 0)
      : currentStoryIndex;
    // Right face: always show first story for next user
    const rightStoryIdx = cubeState && cubeState.rightUserIndex > currentUserIndex
      ? 0 : currentStoryIndex;

    const renderFaceContent = (
      faceUser: User,
      faceStory: StoryItemType,
      faceStoryIndex: number,
      faceProgress: number,
      isLive: boolean,
    ) => (
      <>
        {/* key={faceUser.id} forces remount on user switch → no CSS transition on progress bars */}
        <div key={faceUser.id} className={cn("story-viewer-header", classNames?.header)}>
          <StoryProgressBars
            total={faceUser.stories.length}
            currentIndex={faceStoryIndex}
            progress={faceProgress}
            classNames={classNames?.progressBars}
          />
          <div className={cn("story-viewer-user-info", classNames?.userInfo)}>
            <img
              src={faceUser.avatarUrl}
              alt={`${faceUser.username} avatar`}
              className={cn("story-viewer-avatar", classNames?.avatar)}
            />
            <span className={cn("story-viewer-username", classNames?.username)}>
              {faceUser.username}
            </span>
          </div>
          <button
            className={cn("story-viewer-close", classNames?.closeButton)}
            onClick={handleClose}
            aria-label="Close story viewer"
            type="button"
          >
            ×
          </button>
        </div>
        <div className={cn("story-viewer-items", classNames?.items)}>
          {(isLoading || isUserLoading) && isLive ? (
            <div className="story-item-loader">
              <div className="story-item-spinner" />
            </div>
          ) : (
            <StoryItem
              item={faceStory}
              isActive={isLive}
              isPaused={isLive ? (isPaused || !!cubeDragRef.current?.isDragging) : true}
              onDurationDetected={isLive ? (d) => timer.setDuration(d) : undefined}
              onLoadError={isLive ? handleLoadError : undefined}
              onBufferingChange={isLive ? handleBufferingChange : undefined}
              controls={storyControls}
              classNames={classNames?.storyItem}
            />
          )}
        </div>
        {isLive && (
          <div className="story-viewer-nav-hints">
            <div className="story-viewer-nav-hint story-viewer-nav-hint-left" />
            <div className="story-viewer-nav-hint story-viewer-nav-hint-right" />
          </div>
        )}
      </>
    );

    const content = (
      <div
        ref={containerRef}
        className={cn("story-viewer", classNames?.root)}
        role="dialog"
        aria-modal="true"
        aria-label={`Stories by ${currentUser?.username || "user"}`}
        aria-describedby="story-viewer-description"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={cn("story-viewer-overlay", classNames?.overlay)} onClick={handleClose} />

        <div id="story-viewer-description" className="sr-only">
          Instagram-style stories viewer. Tap left side to go to previous story,
          right side to go to next story. Swipe left or right to navigate
          between users. Press Escape to close.
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Viewing story {currentStoryIndex + 1} of {totalStories} by{" "}
          {currentUser?.username}
        </div>

        {/* Always-mounted structure — no DOM swap on drag, eliminating layout shift.
            Normal mode: viewport/wrapper are transparent passthroughs.
            Cube mode:  viewport gains perspective, wrapper gains 3D, adjacent faces appear. */}
        {(() => {
          const isCube = !!(cubeState && leftUser && rightUser);
          const d = isCube
            ? (faceWidthRef.current ? faceWidthRef.current / 2 : Math.min(typeof window !== 'undefined' ? window.innerWidth : 500, 500) / 2)
            : 0;

          const adjacentFaceStyle = (rotateY: string): React.CSSProperties => ({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            transform: `rotateY(${rotateY}) translateZ(${d}px)`,
          });

          return (
            <div
              className="story-viewer-cube-viewport"
              style={isCube ? { perspective: `${d * 16}px` } : undefined}
            >
              <div
                ref={cubeWrapperRef}
                className="story-viewer-cube-wrapper"
                style={isCube ? { transformStyle: 'preserve-3d' as const, transform: cubeTransform(d, 0) } : undefined}
              >
                {/* Main content — ALWAYS mounted, never unmounted.
                    Only transform/backfaceVisibility are added for cube — NO position/size
                    changes, so there is zero layout shift. */}
                <div
                  ref={focusTrapRef}
                  className={cn("story-viewer-content", classNames?.content)}
                  style={isCube ? {
                    willChange: 'auto' as const,
                    backfaceVisibility: 'hidden' as const,
                    transform: `translateZ(${d}px)`,
                  } : undefined}
                  onMouseEnter={handlePause}
                  onMouseLeave={handleResume}
                >
                  {renderFaceContent(currentUser, currentStory, currentStoryIndex, timer.progress, !isCube)}
                </div>

                {/* Adjacent faces — only during cube */}
                {isCube && leftUser && (
                  <div style={adjacentFaceStyle('-90deg')}>
                    {renderFaceContent(leftUser, leftUser.stories[leftStoryIdx], leftStoryIdx, 0, false)}
                  </div>
                )}
                {isCube && rightUser && (
                  <div style={adjacentFaceStyle('90deg')}>
                    {renderFaceContent(rightUser, rightUser.stories[rightStoryIdx], rightStoryIdx, 0, false)}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );

    return createPortal(content, document.body);
  }
);
