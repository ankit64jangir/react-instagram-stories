import { memo } from "react";

interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive: boolean;
  className?: string;
}

export const ProgressBar = memo<ProgressBarProps>(({ progress, isActive, className }) => {
  const progressPercent = Math.round(progress * 100);

  return (
    <div
      className={`story-progress-bar ${className || ''}`}
      role="progressbar"
      aria-valuenow={isActive ? progressPercent : progress === 1 ? 100 : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Story progress: ${progressPercent}%`}
    >
      <div
        className="story-progress-bar-fill"
        style={{
          transform: `scaleX(${isActive ? progress : progress === 1 ? 1 : 0})`,
        }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";
