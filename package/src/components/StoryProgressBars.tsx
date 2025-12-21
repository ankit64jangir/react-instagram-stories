import { memo } from "react";
import { ProgressBar } from "./ProgressBar";

interface StoryProgressBarsProps {
  total: number;
  currentIndex: number;
  progress: number;
  className?: string;
}

export const StoryProgressBars = memo<StoryProgressBarsProps>(
  ({ total, currentIndex, progress, className }) => {
  return (
    <div className={`story-progress-bars-container ${className || ''}`}>
        {Array.from({ length: total }).map((_, index) => (
          <ProgressBar
            key={index}
            progress={
              index < currentIndex ? 1 : index === currentIndex ? progress : 0
            }
            isActive={index === currentIndex}
          />
        ))}
      </div>
    );
  }
);

StoryProgressBars.displayName = "StoryProgressBars";
