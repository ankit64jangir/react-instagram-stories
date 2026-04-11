import { memo, useEffect, useRef, useState, useCallback } from "react";
import { StoryItem as StoryItemType, StoryItemControls, StoryItemClassNames } from "../types";
import { cn } from "../utils/storyHelpers";

interface StoryItemProps {
  item: StoryItemType;
  isActive: boolean;
  isPaused: boolean;
  onDurationDetected?: (duration: number) => void;
  onLoadError?: () => void;
  onBufferingChange?: (isBuffering: boolean) => void;
  controls: StoryItemControls;
  classNames?: StoryItemClassNames;
}

export const StoryItem = memo<StoryItemProps>(
  ({ item, isActive, isPaused, onDurationDetected, onLoadError, onBufferingChange, controls, classNames }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(() => item.type === 'image' || item.type === 'video');

    // Reset state when story changes — smart per-type to avoid flicker
    useEffect(() => {
      setHasError(false);

      if (item.type === 'image' && 'src' in item) {
        const img = new Image();
        img.src = item.src;
        setIsLoading(!(img.complete && img.naturalWidth > 0));
      } else if (item.type === 'video') {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }, [item.id, item.type]);

    // Handle video playback
    useEffect(() => {
      if (item.type !== "video" || !videoRef.current || !isActive) return;

      const video = videoRef.current;

      const playVideo = async () => {
        try {
          if (isPaused) {
            video.pause();
          } else {
            await video.play();
          }
        } catch (error) {
          console.warn("Video play failed:", error);
        }
      };

      playVideo();
    }, [item.type, isActive, isPaused]);

    // Reset video currentTime and detect duration when story item changes
    useEffect(() => {
      if (item.type !== "video" || !videoRef.current) return;

      const video = videoRef.current;

      // Reset playhead to start for the new video
      video.currentTime = 0;

      const handleLoadedMetadata = () => {
        if (video.duration && isFinite(video.duration)) {
          onDurationDetected?.(video.duration * 1000);
        }
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);

      // Check if metadata already loaded
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }

      // Check if can play
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
      };
    }, [item.id, item.type, onDurationDetected]);

    // Handle video buffering states
    useEffect(() => {
      if (item.type !== "video" || !videoRef.current || !isActive) return;

      const video = videoRef.current;

      const handleWaiting = () => {
        onBufferingChange?.(true);
      };

      const handlePlaying = () => {
        onBufferingChange?.(false);
      };

      const handleStalled = () => {
        onBufferingChange?.(true);
      };

      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("stalled", handleStalled);

      return () => {
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("stalled", handleStalled);
      };
    }, [item.type, isActive, onBufferingChange]);

    // Cleanup video on unmount or when story changes
    useEffect(() => {
      const video = videoRef.current;
      if (item.type !== "video" || !video) return;

      return () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }, [item.id, item.type]);

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoading(false);
      onLoadError?.();
    }, [onLoadError]);

    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    if (hasError) {
      return (
        <div className={cn("story-item story-item-error", classNames?.error)}>
          <div className="story-item-error-message">Failed to load content</div>
        </div>
      );
    }

    switch (item.type) {
      case "image":
        return (
          <div className={cn("story-item story-item-image", classNames?.root)}>
            {isLoading && (
              <div className={cn("story-item-loader", classNames?.loader)}>
                <div className="story-item-spinner"></div>
              </div>
            )}
            <img
              src={item.src}
              alt={item.alt || "Story image"}
              onError={handleError}
              onLoad={handleImageLoad}
              draggable={false}
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          </div>
        );

      case "video":
        return (
          <div className={cn("story-item story-item-video", classNames?.root)}>
            {isLoading && (
              <div className={cn("story-item-loader", classNames?.loader)}>
                <div className="story-item-spinner"></div>
              </div>
            )}
            <video
              ref={videoRef}
              src={item.src}
              muted
              playsInline
              loop={false}
              onError={handleError}
              preload="auto"
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          </div>
        );

      case "text":
        return (
          <div
            className={cn("story-item story-item-text", classNames?.root)}
            style={{
              backgroundColor: item.backgroundColor || "#000",
              color: item.textColor || "#fff",
            }}
          >
            <div className={cn("story-item-text-content", classNames?.textContent)}>{item.text}</div>
          </div>
        );

      case "custom_component":
        const Component = item.component;
        return (
          <div className={cn("story-item story-item-component", classNames?.root)}>
            <Component {...controls} />
          </div>
        );

      default:
        return null;
    }
  }
);

StoryItem.displayName = "StoryItem";
