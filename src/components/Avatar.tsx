import { memo, useState } from 'react';
import { AvatarClassNames } from '../types';
import { cn } from '../utils/storyHelpers';

interface AvatarProps {
  avatarUrl: string;
  username: string;
  hasUnreadStories?: boolean;
  onClick: () => void;
  classNames?: AvatarClassNames;
}

export const Avatar = memo<AvatarProps>(
  ({ avatarUrl, username, hasUnreadStories = false, onClick, classNames }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <button
        className={cn(
          'story-avatar',
          hasUnreadStories ? 'story-avatar-unread' : 'story-avatar-read',
          classNames?.root,
        )}
        onClick={onClick}
        aria-label={`View ${username}'s story`}
      >
        <div className={cn('story-avatar-ring', classNames?.ring)}>
          <div className={cn('story-avatar-image-wrapper', classNames?.imageWrapper)}>
            {!imageError ? (
              <img
                src={avatarUrl}
                alt={username}
                className={cn(
                  'story-avatar-image',
                  imageLoaded && 'story-avatar-image-loaded',
                  classNames?.image,
                )}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={cn('story-avatar-placeholder', classNames?.placeholder)}>
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <span className={cn('story-avatar-username', classNames?.username)}>{username}</span>
      </button>
    );
  }
);

Avatar.displayName = 'Avatar';
