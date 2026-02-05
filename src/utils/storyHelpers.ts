import { User } from '../types';

/**
 * Resolves a user value (index or ID) to an index
 * @param users - Array of users
 * @param value - Either a numeric index or user ID string
 * @returns The user index, or -1 if not found
 */
export function resolveUserIndex(users: User[], value: string): number {
  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 0 && num < users.length) {
    return num;
  }
  // Try to find by user ID
  return users.findIndex(u => u.id === value);
}

/**
 * Resolves a story value (index or ID) to an index
 * @param user - The user object
 * @param value - Either a numeric index or story ID string
 * @returns The story index, or -1 if not found
 */
export function resolveStoryIndex(user: User, value: string): number {
  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 0 && num < user.stories.length) {
    return num;
  }
  // Try to find by story ID
  return user.stories.findIndex(s => s.id === value);
}