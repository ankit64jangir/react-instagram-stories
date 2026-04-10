import { ComponentType } from 'react';

export type StoryItemType = 'image' | 'video' | 'text' | 'custom_component';

export interface StoryItemMetadata {
  [key: string]: any;
}

export interface StoryItemControls {
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  setDuration: (ms: number) => void;
}

export interface BaseStoryItem {
  id: string;
  type: StoryItemType;
  duration?: number; // milliseconds
  metadata?: StoryItemMetadata;
  alt?: string;
  caption?: string;
}

export interface ImageStoryItem extends BaseStoryItem {
  type: 'image';
  src: string;
  duration?: number; // default 5000ms
}

export interface VideoStoryItem extends BaseStoryItem {
  type: 'video';
  src: string;
  duration?: number; // auto-detected from video
}

export interface TextStoryItem extends BaseStoryItem {
  type: 'text';
  text: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number; // default 5000ms
}

export interface CustomComponentStoryItem extends BaseStoryItem {
  type: 'custom_component';
  component: ComponentType<StoryItemControls>;
  duration?: number;
}

export type StoryItem = ImageStoryItem | VideoStoryItem | TextStoryItem | CustomComponentStoryItem;

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  hasUnreadStories?: boolean;
}

// ── ClassNames types for Tailwind / custom CSS support ──

export interface AvatarClassNames {
  root?: string;
  ring?: string;
  imageWrapper?: string;
  image?: string;
  placeholder?: string;
  username?: string;
}

export interface AvatarListClassNames {
  root?: string;
  avatar?: AvatarClassNames;
}

export interface ProgressBarClassNames {
  root?: string;
  fill?: string;
}

export interface StoryProgressBarsClassNames {
  root?: string;
  bar?: ProgressBarClassNames;
}

export interface StoryItemClassNames {
  root?: string;
  loader?: string;
  error?: string;
  textContent?: string;
}

export interface StoryViewerClassNames {
  root?: string;
  overlay?: string;
  content?: string;
  header?: string;
  userInfo?: string;
  avatar?: string;
  username?: string;
  closeButton?: string;
  items?: string;
  storyItem?: StoryItemClassNames;
  progressBars?: StoryProgressBarsClassNames;
}

export interface StoriesClassNames {
  avatarList?: AvatarListClassNames;
  storyViewer?: StoryViewerClassNames;
}
