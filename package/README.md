# React Instagram Stories

A high-performance, Instagram-style Stories component for React with Tailwind CSS support.

## Features

- ✅ High-performance with virtualized avatar list
- ✅ Tap left/right to navigate stories
- ✅ Swipe left/right to switch users
- ✅ Swipe down to close
- ✅ Long-press or hover to pause
- ✅ Keyboard navigation (←/→/Space/Esc)
- ✅ Image, Video, Text, and Custom Components support
- ✅ Auto-advance with progress bars
- ✅ Mobile-friendly & accessible
- ✅ Shareable story URLs
- ✅ Tailwind CSS customizable

## Installation

```bash
npm install react-instagram-stories
```

## Usage

```tsx
import { Stories } from 'react-instagram-stories';
// Import default styles (optional - you can use your own CSS)
import 'react-instagram-stories/dist/styles.css';

const users = [
  {
    id: 'user1',
    username: 'john_doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    stories: [
      {
        id: 'story1',
        type: 'image',
        src: 'https://example.com/image.jpg',
        duration: 5000,
      },
    ],
  },
];

function App() {
  return (
    <Stories
      users={users}
      className="custom-stories-class"
      avatarListClassName="bg-gray-100 p-4"
      storyViewerClassName="rounded-lg"
    />
  );
}
```

## Usage Modes

### Standalone Mode (No Router Required)

Works out of the box without any router setup:

```tsx
import { Stories } from 'react-instagram-stories';

function App() {
  return <Stories users={users} />;
}
```

**Features available:**
- ✅ Avatar list with click to open stories
- ✅ Story viewer with navigation
- ✅ All gestures and keyboard controls
- ❌ Shareable URLs (stories can't be linked directly)

### Router Mode (With URL Sharing)

For shareable story URLs, wrap your app with `BrowserRouter` and add routes:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Stories } from 'react-instagram-stories';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your other routes */}
        <Route path="/" element={<HomePage />} />

        {/* Stories routes - enables shareable URLs */}
        <Route path="/stories" element={<Stories users={users} />} />
        <Route path="/stories/story/:storyId" element={<Stories users={users} />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Features available:**
- ✅ All standalone features
- ✅ Shareable story URLs (e.g., `/stories/story/story-123`)
- ✅ Direct linking to specific stories
- ✅ Browser back/forward navigation

**Note:** The component automatically detects if `react-router-dom` is available and adjusts its behavior accordingly.

## Props

### Stories

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `users` | `User[]` | - | Array of users with their stories |
| `className` | `string` | - | Tailwind CSS classes for the root container |
| `avatarListClassName` | `string` | - | Tailwind CSS classes for the avatar list |
| `storyViewerClassName` | `string` | - | Tailwind CSS classes for the story viewer |

### User

```tsx
interface User {
  id: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  hasUnreadStories?: boolean;
}
```

### StoryItem

```tsx
type StoryItem =
  | ImageStoryItem
  | VideoStoryItem
  | TextStoryItem
  | ComponentStoryItem
  | PDPStoryItem;

interface BaseStoryItem {
  id: string;
  type: StoryItemType;
  duration?: number;
  metadata?: StoryItemMetadata;
  alt?: string;
  caption?: string;
}

interface ImageStoryItem extends BaseStoryItem {
  type: 'image';
  src: string;
}

interface VideoStoryItem extends BaseStoryItem {
  type: 'video';
  src: string;
}

interface TextStoryItem extends BaseStoryItem {
  type: 'text';
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

interface ComponentStoryItem extends BaseStoryItem {
  type: 'component';
  component: ComponentType<StoryItemControls>;
}

interface PDPStoryItem extends BaseStoryItem {
  type: 'pdp';
  vehicleId: number;
  vehicleData: VehicleData;
}
```

## Customization with Tailwind CSS

You can customize the appearance by passing Tailwind CSS classes via props:

```tsx
<Stories
  users={users}
  className="w-full max-w-4xl mx-auto"
  avatarListClassName="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg"
  storyViewerClassName="border-4 border-white shadow-2xl"
/>
```

For more advanced customization, you can override the default CSS classes or create your own styles.

## Dependencies

### Required
- `react: ^18.0.0`
- `react-dom: ^18.0.0`

### Optional (for URL sharing)
- `react-router-dom: ^7.10.1` (optional - enables shareable story URLs)

## License

MIT