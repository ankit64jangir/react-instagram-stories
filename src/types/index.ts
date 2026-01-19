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

export interface StoriesData {
  users: User[];
}

export interface ViewerState {
  isOpen: boolean;
  currentUserIndex: number;
  currentStoryIndex: number;
}

export interface GestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}
