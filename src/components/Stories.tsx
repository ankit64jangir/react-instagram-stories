import React, { useCallback } from 'react';
import { User, StoriesClassNames } from '../types';
import { AvatarList } from './AvatarList';
import { StoryViewer } from './StoryViewer';
import { navigateWithParams } from '../hooks/useQueryParams';

interface StoriesProps {
  users: User[];
  classNames?: StoriesClassNames;
}

/**
 * Combined Stories component with AvatarList and StoryViewer.
 * Uses URL query params for navigation: ?user={userId}&story={storyId}
 */
export const Stories: React.FC<StoriesProps> = ({ users, classNames }) => {
  const handleAvatarClick = useCallback((userIndex: number) => {
    // Navigate using user ID and story ID
    const user = users[userIndex];
    if (user && user.stories.length > 0) {
      navigateWithParams({ user: user.id, story: user.stories[0].id });
    }
  }, [users]);

  return (
    <>
      <AvatarList users={users} onAvatarClick={handleAvatarClick} classNames={classNames?.avatarList} />
      <StoryViewer users={users} classNames={classNames?.storyViewer} />
    </>
  );
};
