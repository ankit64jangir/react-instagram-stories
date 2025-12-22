import { memo, useEffect, useRef, useState, useCallback } from "react";
import { StoryItem as StoryItemType, StoryItemControls } from "../types";

interface StoryItemProps {
  item: StoryItemType;
  isActive: boolean;
  isPaused: boolean;
  onDurationDetected?: (duration: number) => void;
  onLoadError?: () => void;
  controls: StoryItemControls;
}

export const StoryItem = memo<StoryItemProps>(
  ({ item, isActive, isPaused, onDurationDetected, onLoadError, controls }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    // Detect video duration
    useEffect(() => {
      if (item.type !== "video" || !videoRef.current) return;

      const video = videoRef.current;

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
    }, [item.type, onDurationDetected]);

    // Sync video progress with timer for more accurate progress bar
    useEffect(() => {
      if (item.type !== "video" || !videoRef.current || !isActive) return;

      const video = videoRef.current;
      let rafId: number;

      const syncProgress = () => {
        if (video.duration && isFinite(video.duration)) {
          // This allows the progress bar to sync with video playhead
          // The timer in StoryViewer will handle the actual progress
        }
        rafId = requestAnimationFrame(syncProgress);
      };

      rafId = requestAnimationFrame(syncProgress);

      return () => {
        cancelAnimationFrame(rafId);
      };
    }, [item.type, isActive]);

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
        <div className="story-item story-item-error">
          <div className="story-item-error-message">Failed to load content</div>
        </div>
      );
    }

    switch (item.type) {
      case "image":
        return (
          <div className="story-item story-item-image">
            {isLoading && (
              <div className="story-item-loader">
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
          <div className="story-item story-item-video">
            {isLoading && (
              <div className="story-item-loader">
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
            className="story-item story-item-text"
            style={{
              backgroundColor: item.backgroundColor || "#000",
              color: item.textColor || "#fff",
            }}
          >
            <div className="story-item-text-content">{item.text}</div>
          </div>
        );

      case "custom_component":
        const Component = item.component;
        return (
          <div className="story-item story-item-component">
            <Component {...controls} />
          </div>
        );

      default:
        return null;
    }
  }
);

StoryItem.displayName = "StoryItem";
