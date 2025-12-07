import { memo } from "react";

interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive: boolean;
}

export const ProgressBar = memo<ProgressBarProps>(({ progress, isActive }) => {
  const progressPercent = Math.round(progress * 100);

  return (
    <div
      className="story-progress-bar"
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
