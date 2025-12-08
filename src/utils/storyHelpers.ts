import { User } from '../types';

export interface StoryIndices {
  userIndex: number;
  storyIndex: number;
}

/**
 * Finds the user index and story index for a given story ID
 * @param users - Array of users
 * @param storyId - The story ID to find
 * @returns Object with userIndex and storyIndex, or null if not found
 */
export function findStoryIndices(users: User[], storyId: string): StoryIndices | null {
  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    const storyIndex = user.stories.findIndex(story => story.id === storyId);
    if (storyIndex !== -1) {
      return { userIndex, storyIndex };
    }
  }
  return null;
}

/**
 * Gets the story ID for given user and story indices
 * @param users - Array of users
 * @param userIndex - Index of the user
 * @param storyIndex - Index of the story
 * @returns The story ID, or null if indices are invalid
 */
export function getStoryId(users: User[], userIndex: number, storyIndex: number): string | null {
  const user = users[userIndex];
  if (!user) return null;
  const story = user.stories[storyIndex];
  return story ? story.id : null;
}