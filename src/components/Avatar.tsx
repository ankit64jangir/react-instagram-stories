import { memo, useState } from 'react';

interface AvatarProps {
  avatarUrl: string;
  username: string;
  hasUnreadStories?: boolean;
  onClick: () => void;
}

export const Avatar = memo<AvatarProps>(
  ({ avatarUrl, username, hasUnreadStories = false, onClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <button
        className={`story-avatar ${hasUnreadStories ? 'story-avatar-unread' : 'story-avatar-read'}`}
        onClick={onClick}
        aria-label={`View ${username}'s story`}
      >
        <div className="story-avatar-ring">
          <div className="story-avatar-image-wrapper">
            {!imageError ? (
              <img
                src={avatarUrl}
                alt={username}
                className={`story-avatar-image ${imageLoaded ? 'story-avatar-image-loaded' : ''}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="story-avatar-placeholder">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <span className="story-avatar-username">{username}</span>
      </button>
    );
  }
);

Avatar.displayName = 'Avatar';
