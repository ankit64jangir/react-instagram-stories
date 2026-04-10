import { memo } from "react";
import { ProgressBarClassNames } from "../types";
import { cn } from "../utils/storyHelpers";

interface ProgressBarProps {
  progress: number; // 0 to 1
  isActive: boolean;
  classNames?: ProgressBarClassNames;
}

export const ProgressBar = memo<ProgressBarProps>(({ progress, isActive, classNames }) => {
  const progressPercent = Math.round(progress * 100);

  return (
    <div
      className={cn("story-progress-bar", classNames?.root)}
      role="progressbar"
      aria-valuenow={isActive ? progressPercent : progress === 1 ? 100 : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Story progress: ${progressPercent}%`}
    >
      <div
        className={cn("story-progress-bar-fill", classNames?.fill)}
        style={{
          transform: `scaleX(${isActive ? progress : progress === 1 ? 1 : 0})`,
        }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";
