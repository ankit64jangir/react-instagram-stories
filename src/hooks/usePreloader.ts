import { useEffect, useRef, useCallback } from 'react';
import { StoryItem } from '../types';

interface PreloadCache {
  [key: string]: boolean;
}

export const usePreloader = () => {
  const cacheRef = useRef<PreloadCache>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cacheRef.current[src]) {
        resolve();
        return;
      }

      if (loadingRef.current.has(src)) {
        // Already loading, wait for it
        const checkInterval = setInterval(() => {
          if (cacheRef.current[src] || !loadingRef.current.has(src)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      loadingRef.current.add(src);

      const img = new Image();
      img.onload = () => {
        cacheRef.current[src] = true;
        loadingRef.current.delete(src);
        resolve();
      };
      img.onerror = () => {
        loadingRef.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, []);

  const preloadVideo = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (cacheRef.current[src]) {
        resolve();
        return;
      }

      if (loadingRef.current.has(src)) {
        const checkInterval = setInterval(() => {
          if (cacheRef.current[src] || !loadingRef.current.has(src)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      loadingRef.current.add(src);

      const video = document.createElement('video');
      video.preload = 'auto';
      
      const handleCanPlay = () => {
        cacheRef.current[src] = true;
        loadingRef.current.delete(src);
        cleanup();
        resolve();
      };

      const handleError = () => {
        loadingRef.current.delete(src);
        cleanup();
        reject(new Error(`Failed to load video: ${src}`));
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.src = '';
      };

      video.addEventListener('canplaythrough', handleCanPlay);
      video.addEventListener('error', handleError);
      video.src = src;
      video.load();
    });
  }, []);

  const preloadStoryItem = useCallback(async (item: StoryItem): Promise<void> => {
    try {
      if (item.type === 'image' && 'src' in item) {
        await preloadImage(item.src);
      } else if (item.type === 'video' && 'src' in item) {
        await preloadVideo(item.src);
      }
      // Text and component types don't need preloading
    } catch (error) {
      console.warn('Failed to preload story item:', error);
    }
  }, [preloadImage, preloadVideo]);

  const preloadMultiple = useCallback(async (items: StoryItem[]): Promise<void> => {
    // Preload in parallel but limit concurrent loads
    const CONCURRENT_LIMIT = 3;
    const chunks: StoryItem[][] = [];
    
    for (let i = 0; i < items.length; i += CONCURRENT_LIMIT) {
      chunks.push(items.slice(i, i + CONCURRENT_LIMIT));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(chunk.map(preloadStoryItem));
    }
  }, [preloadStoryItem]);

  const isPreloaded = useCallback((src: string): boolean => {
    return cacheRef.current[src] || false;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    loadingRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    preloadImage,
    preloadVideo,
    preloadStoryItem,
    preloadMultiple,
    isPreloaded,
    clearCache,
  };
};
