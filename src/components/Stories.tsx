import React, { useState, useCallback, useRef } from 'react';
import { User } from '../types';
import { AvatarList } from './AvatarList';
import { StoryViewer } from './StoryViewer';

interface StoriesProps {
  users: User[];
}

export const Stories: React.FC<StoriesProps> = ({ users }) => {
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    userIndex: number;
  }>({
    isOpen: false,
    userIndex: 0,
  });

  const scrollPositionRef = useRef(0);

  const handleAvatarClick = useCallback((userIndex: number) => {
    // Save scroll position
    scrollPositionRef.current = window.scrollY;

    setViewerState({
      isOpen: true,
      userIndex,
    });
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerState({
      isOpen: false,
      userIndex: 0,
    });

    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  }, []);

  return (
    <>
      <AvatarList users={users} onAvatarClick={handleAvatarClick} />

      <StoryViewer
        users={users}
        initialUserIndex={viewerState.userIndex}
        isOpen={viewerState.isOpen}
        onClose={handleCloseViewer}
      />
    </>
  );
};
