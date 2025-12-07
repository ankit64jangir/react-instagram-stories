import { memo } from "react";
import { ProgressBar } from "./ProgressBar";

interface StoryProgressBarsProps {
  total: number;
  currentIndex: number;
  progress: number;
}

export const StoryProgressBars = memo<StoryProgressBarsProps>(
  ({ total, currentIndex, progress }) => {
    return (
      <div className="story-progress-bars-container">
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
