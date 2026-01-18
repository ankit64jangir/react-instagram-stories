import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { AvatarList } from './AvatarList';
import { StoryViewer } from './StoryViewer';
import { findStoryIndices } from '../utils/storyHelpers';

interface StoriesProps {
  users: User[];
  closeNavigateTo?: string;
}

export const Stories: React.FC<StoriesProps> = ({ users, closeNavigateTo = '/' }) => {
  const { storyId } = useParams<{ storyId?: string }>();
  const navigate = useNavigate();

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    userIndex: number;
    storyIndex: number;
  }>({
    isOpen: false,
    userIndex: 0,
    storyIndex: 0,
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
          storyIndex: indices.storyIndex,
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
      storyIndex: 0,
    });

    // Update URL with first story ID of the user
    const user = users[userIndex];
    if (user && user.stories.length > 0) {
      const firstStoryId = user.stories[0].id;
      navigate(`/story/${firstStoryId}`, { replace: true });
    }
  }, [users, navigate]);

  const handleCloseViewer = useCallback(() => {
    setViewerState({
      isOpen: false,
      userIndex: 0,
      storyIndex: 0,
    });

    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });

    // Clear URL
    navigate(closeNavigateTo, { replace: true });
  }, [navigate, closeNavigateTo]);

  const handleStoryChange = useCallback((userIndex: number, storyIndex: number) => {
    const user = users[userIndex];
    if (user && user.stories[storyIndex]) {
      const storyId = user.stories[storyIndex].id;
      navigate(`/story/${storyId}`, { replace: true });
    }
  }, [users, navigate]);

  return (
    <>
      <AvatarList users={users} onAvatarClick={handleAvatarClick} />

      <StoryViewer
        users={users}
        initialUserIndex={viewerState.userIndex}
        initialStoryIndex={viewerState.storyIndex}
        isOpen={viewerState.isOpen}
        onClose={handleCloseViewer}
        onStoryChange={handleStoryChange}
      />
    </>
  );
};
