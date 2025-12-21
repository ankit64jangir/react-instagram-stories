import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { User } from '../types';
import { Avatar } from './Avatar';

interface AvatarListProps {
  users: User[];
  onAvatarClick: (userIndex: number) => void;
  className?: string;
}

const AVATAR_WIDTH = 90; // Approximate width including margin
const OVERSCAN_COUNT = 3; // Render extra items outside viewport

export const AvatarList = memo<AvatarListProps>(({ users, onAvatarClick, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update scroll position
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  }, []);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Calculate visible range
  const { startIndex, endIndex } = React.useMemo(() => {
    const start = Math.floor(scrollLeft / AVATAR_WIDTH);
    const visibleCount = Math.ceil(containerWidth / AVATAR_WIDTH);
    
    return {
      startIndex: Math.max(0, start - OVERSCAN_COUNT),
      endIndex: Math.min(users.length, start + visibleCount + OVERSCAN_COUNT),
    };
  }, [scrollLeft, containerWidth, users.length]);

  // Calculate total width
  const totalWidth = users.length * AVATAR_WIDTH;

  // Virtual items to render
  const virtualItems = users.slice(startIndex, endIndex).map((user, idx) => ({
    user,
    index: startIndex + idx,
  }));

  return (
    <div
      ref={containerRef}
      className={`story-avatar-list ${className || ''}`}
      onScroll={handleScroll}
      role="list"
      aria-label="Stories"
    >
      <div
        className="story-avatar-list-inner"
        style={{
          width: `${totalWidth}px`,
          position: 'relative',
        }}
      >
        {virtualItems.map(({ user, index }) => (
          <div
            key={user.id}
            className="story-avatar-item"
            style={{
              position: 'absolute',
              left: `${index * AVATAR_WIDTH}px`,
              width: `${AVATAR_WIDTH}px`,
            }}
            role="listitem"
          >
            <Avatar
              avatarUrl={user.avatarUrl}
              username={user.username}
              hasUnreadStories={user.hasUnreadStories}
              onClick={() => onAvatarClick(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

AvatarList.displayName = 'AvatarList';
