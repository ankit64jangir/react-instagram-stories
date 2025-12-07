# Instagram Stories for React

A fully-featured, high-performance Instagram-style Stories component for React with all the bells and whistles.

## Features

### Core Features
- ✅ **Multiple Story Types**: Image, Video, Text, and Custom React Components
- ✅ **Gesture Support**: Tap, swipe, long-press interactions
- ✅ **Auto-advance**: Automatic progression with smooth progress bars
- ✅ **Keyboard Navigation**: Arrow keys, Space, Escape
- ✅ **Mobile-First**: Touch-optimized with swipe gestures
- ✅ **Accessibility**: ARIA labels, focus trapping, keyboard support

### Performance
- ✅ **Virtualized Avatar List**: Handles 200+ users smoothly
- ✅ **Smart Preloading**: Only preloads adjacent stories
- ✅ **DOM-Efficient**: Only renders current + prev + next story items
- ✅ **GPU-Accelerated**: Uses `translate3d` for smooth animations
- ✅ **Memory Management**: Minimal concurrent preloads
- ✅ **RequestAnimationFrame**: Smooth 60fps timer

### User Experience
- ✅ **Pause on Hover**: Desktop hover support
- ✅ **Long-press Pause**: Mobile long-press support
- ✅ **Tab Visibility**: Pauses when tab is inactive
- ✅ **Progress Sync**: Video progress synced with timer
- ✅ **Error Handling**: Gracefully skips failed items
- ✅ **Scroll Restoration**: Returns to original position on close

### Interactions
- **Tap Left**: Previous story
- **Tap Right**: Next story
- **Swipe Left**: Next user's stories
- **Swipe Right**: Previous user's stories
- **Swipe Down**: Close viewer
- **Long Press**: Pause/Resume
- **Hover**: Pause (desktop)
- **Arrow Keys**: Navigate stories
- **Space**: Pause/Resume
- **Escape**: Close viewer

## Installation

```bash
npm install
```

## Usage

### Basic Example

```tsx
import React from 'react';
import { Stories } from './components';
import { User } from './types';
import './styles.css';

const users: User[] = [
  {
    id: 'user-1',
    username: 'john_doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    hasUnreadStories: true,
    stories: [
      {
        id: 'story-1',
        type: 'image',
        src: 'https://example.com/image.jpg',
        duration: 5000,
        alt: 'Beautiful sunset',
      },
      {
        id: 'story-2',
        type: 'text',
        text: 'Hello World!',
        backgroundColor: '#FF6B6B',
        textColor: '#FFFFFF',
        duration: 4000,
      },
    ],
  },
];

function App() {
  return <Stories users={users} />;
}

export default App;
```

### Custom Component Stories

```tsx
import React from 'react';
import { StoryItemControls } from './types';

const PollComponent: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
  setDuration,
}) => {
  React.useEffect(() => {
    // Pause story for interaction
    pause();
    
    return () => resume();
  }, [pause, resume]);

  const handleVote = (option: number) => {
    // Process vote...
    
    // Move to next story
    setTimeout(() => {
      resume();
      next();
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>What's your favorite feature?</h2>
      <button onClick={() => handleVote(0)}>Swipe Gestures</button>
      <button onClick={() => handleVote(1)}>Auto-advance</button>
    </div>
  );
};

const users: User[] = [
  {
    id: 'user-1',
    username: 'john_doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    hasUnreadStories: true,
    stories: [
      {
        id: 'story-1',
        type: 'component',
        component: PollComponent,
        duration: 15000,
      },
    ],
  },
];
```

### Video Stories

```tsx
const users: User[] = [
  {
    id: 'user-1',
    username: 'john_doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    hasUnreadStories: true,
    stories: [
      {
        id: 'story-1',
        type: 'video',
        src: 'https://example.com/video.mp4',
        // Duration auto-detected from video
        // Or specify custom duration:
        duration: 10000,
      },
    ],
  },
];
```

## API

### Types

#### `User`
```typescript
interface User {
  id: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  hasUnreadStories?: boolean;
}
```

#### `StoryItem`
```typescript
type StoryItem = 
  | ImageStoryItem 
  | VideoStoryItem 
  | TextStoryItem 
  | ComponentStoryItem;

interface ImageStoryItem {
  id: string;
  type: 'image';
  src: string;
  duration?: number; // default 5000ms
  alt?: string;
  caption?: string;
  metadata?: Record<string, any>;
}

interface VideoStoryItem {
  id: string;
  type: 'video';
  src: string;
  duration?: number; // auto-detected
  caption?: string;
  metadata?: Record<string, any>;
}

interface TextStoryItem {
  id: string;
  type: 'text';
  text: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number; // default 5000ms
  metadata?: Record<string, any>;
}

interface ComponentStoryItem {
  id: string;
  type: 'component';
  component: React.ComponentType<StoryItemControls>;
  duration?: number;
  metadata?: Record<string, any>;
}
```

#### `StoryItemControls`
Props passed to custom component stories:
```typescript
interface StoryItemControls {
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  setDuration: (ms: number) => void;
}
```

### Components

#### `<Stories />`
Main component that renders the avatar list and handles viewer state.

**Props:**
- `users: User[]` - Array of users with their stories

#### Utility Functions

```typescript
// Generate demo data for testing
import { generateDemoUsers } from './utils/demoData';

const users = generateDemoUsers(200); // 200 users
```

## Architecture

### Performance Optimizations

1. **Virtualized Scrolling**: Avatar list only renders visible items
2. **Lazy Loading**: Images loaded on-demand with `loading="lazy"`
3. **Smart Preloading**: Only preloads current + adjacent stories
4. **DOM Efficiency**: Only 3 story items in DOM (prev, current, next)
5. **GPU Acceleration**: CSS `translate3d` and `will-change`
6. **RequestAnimationFrame**: Smooth animations
7. **React.memo**: Prevents unnecessary re-renders
8. **Event Delegation**: Efficient event handling

### Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ iOS Safari
- ✅ Chrome Android

### Accessibility

- ARIA labels and roles
- Focus trap inside viewer
- Keyboard navigation
- Screen reader support
- Focus restoration on close
- Reduced motion support

## Development

### Run Demo
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

## File Structure

```
instagram-stories/
├── src/
│   ├── components/
│   │   ├── Avatar.tsx
│   │   ├── AvatarList.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StoryProgressBars.tsx
│   │   ├── StoryItem.tsx
│   │   ├── StoryViewer.tsx
│   │   ├── Stories.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   ├── useGestures.ts
│   │   ├── usePreloader.ts
│   │   ├── useKeyboard.ts
│   │   ├── useFocusTrap.ts
│   │   ├── usePageVisibility.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── demoData.ts
│   ├── Demo.tsx
│   ├── main.tsx
│   ├── index.tsx
│   └── styles.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Performance Metrics

- **Handles 200+ users**: Smooth scrolling with virtualization
- **1000+ stories**: Efficient memory management
- **60fps animations**: GPU-accelerated
- **< 100ms interaction**: Responsive gestures
- **Minimal bundle size**: No heavy dependencies

## Best Practices

1. **Optimize Images**: Use appropriately sized images (1080x1920 recommended)
2. **Video Compression**: Compress videos for faster loading
3. **Lazy Loading**: Avatars load lazily by default
4. **Custom Components**: Keep interactive components lightweight
5. **Duration**: Set appropriate durations (3-5s for images, auto for videos)

## Credits

Built with:
- React 18
- TypeScript
- Vite
- CSS3 Animations

## License

MIT
