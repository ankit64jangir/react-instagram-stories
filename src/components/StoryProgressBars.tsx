import { memo } from "react";
import { StoryProgressBarsClassNames } from "../types";
import { cn } from "../utils/storyHelpers";
import { ProgressBar } from "./ProgressBar";

interface StoryProgressBarsProps {
  total: number;
  currentIndex: number;
  progress: number;
  classNames?: StoryProgressBarsClassNames;
}

export const StoryProgressBars = memo<StoryProgressBarsProps>(
  ({ total, currentIndex, progress, classNames }) => {
    return (
      <div className={cn("story-progress-bars-container", classNames?.root)}>
        {Array.from({ length: total }).map((_, index) => (
          <ProgressBar
            key={index}
            progress={
              index < currentIndex ? 1 : index === currentIndex ? progress : 0
            }
            isActive={index === currentIndex}
            classNames={classNames?.bar}
          />
        ))}
      </div>
    );
  }
);

StoryProgressBars.displayName = "StoryProgressBars";
