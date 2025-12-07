import { memo } from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive: boolean;
}

export const ProgressBar = memo<ProgressBarProps>(({ progress, isActive }) => {
  return (
    <div className="story-progress-bar">
      <div
        className="story-progress-bar-fill"
        style={{
          transform: `scaleX(${isActive ? progress : progress === 1 ? 1 : 0})`,
        }}
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';
