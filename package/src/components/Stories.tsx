import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '../types';
import { AvatarList } from './AvatarList';
import { StoryViewer } from './StoryViewer';
import { findStoryIndices } from '../utils/storyHelpers';
import { useRouterSafe } from '../hooks/useRouterSafe';

interface StoriesProps {
  users: User[];
  className?: string;
  avatarListClassName?: string;
  storyViewerClassName?: string;
}

export const Stories: React.FC<StoriesProps> = ({
  users,
  className,
  avatarListClassName,
  storyViewerClassName
}) => {
  const { isRouterAvailable, navigate, params } = useRouterSafe();
  const storyId = params.storyId;

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    userIndex: number;
  }>({
    isOpen: false,
    userIndex: 0,
  });

  const scrollPositionRef = useRef(0);

  // Handle initial story from URL
  useEffect(() => {
    if (storyId) {
      const indices = findStoryIndices(users, storyId);
      if (indices) {
        setViewerState({
          isOpen: true,
          userIndex: indices.userIndex,
        });
      }
    }
  }, [storyId, users]);

  const handleAvatarClick = useCallback((userIndex: number) => {
    // Save scroll position
    scrollPositionRef.current = window.scrollY;

    setViewerState({
      isOpen: true,
      userIndex,
    });

    // Update URL with first story ID of the user (only if router is available)
    if (isRouterAvailable) {
      const user = users[userIndex];
      if (user && user.stories.length > 0) {
        const firstStoryId = user.stories[0].id;
        navigate(`/story/${firstStoryId}`, { replace: true });
      }
    }
  }, [users, navigate, isRouterAvailable]);

  const handleCloseViewer = useCallback(() => {
    setViewerState({
      isOpen: false,
      userIndex: 0,
    });

    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });

    // Clear URL (only if router is available)
    if (isRouterAvailable) {
      navigate('/', { replace: true });
    }
  }, [navigate, isRouterAvailable]);

  const handleStoryChange = useCallback((userIndex: number, storyIndex: number) => {
    // Update URL (only if router is available)
    if (isRouterAvailable) {
      const user = users[userIndex];
      if (user && user.stories[storyIndex]) {
        const storyId = user.stories[storyIndex].id;
        navigate(`/story/${storyId}`, { replace: true });
      }
    }
  }, [users, navigate, isRouterAvailable]);

  return (
    <div className={className}>
      <AvatarList
        users={users}
        onAvatarClick={handleAvatarClick}
        className={avatarListClassName}
      />

      <StoryViewer
        users={users}
        initialUserIndex={viewerState.userIndex}
        isOpen={viewerState.isOpen}
        onClose={handleCloseViewer}
        onStoryChange={handleStoryChange}
        className={storyViewerClassName}
      />
    </div>
  );
};
