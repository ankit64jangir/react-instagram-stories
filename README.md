# React Instagram Stories

A high-performance, fully customizable Instagram-style Stories component for React with TypeScript support. Build engaging story experiences with images, videos, text, and custom components.

[![NPM Version](https://img.shields.io/npm/v/react-instagram-stories.svg)](https://www.npmjs.com/package/react-instagram-stories)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎬 **Multiple Content Types**: Images, videos (with audio), text, and fully custom components
- 🎨 **Fully Customizable**: Style every aspect of the stories
- ⚡ **High Performance**: Optimized rendering with intelligent preloading
- 📱 **Touch & Gestures**: Tap, swipe, and hold interactions
- ⌨️ **Keyboard Navigation**: Full keyboard support for accessibility
- 🎯 **TypeScript**: Complete type definitions included
- ♿ **Accessible**: ARIA labels and keyboard navigation
- 📦 **Lightweight**: Only **74.8 KB** with zero runtime dependencies
- 🔄 **Auto Progress**: Smart progress bar that pauses during video buffering
- 🎭 **Smooth Transitions**: Beautiful animations between stories and users
- 🔌 **React Router Integration**: Built-in URL-based navigation support

## 📦 Installation

```bash
npm install react-instagram-stories react-router-dom
# or
yarn add react-instagram-stories react-router-dom
# or
pnpm add react-instagram-stories react-router-dom
```

**Note**: `react-router-dom` is required for URL-based story navigation.

## 🚀 Quick Start

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Stories, demoUsers } from 'react-instagram-stories';
import 'react-instagram-stories/styles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Stories users={demoUsers} />} />
        <Route path="/story/:storyId" element={<Stories users={demoUsers} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 📖 API Reference

### `<Stories />` Component

The main component for displaying stories with avatar list and viewer.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `users` | `User[]` | **required** | Array of user objects with their stories |
| `closeNavigateTo` | `string` | `'/'` | Navigation path when stories viewer is closed |

### Story Types

The component supports **4 core story types**:

#### 1. Image Story

```tsx
{
  id: 'unique-id',
  type: 'image',
  src: 'https://example.com/image.jpg',
  alt: 'Description', // Optional
  duration: 5000, // Optional, default: 5000ms
}
```

#### 2. Video Story

```tsx
{
  id: 'unique-id',
  type: 'video',
  src: 'https://example.com/video.mp4',
  duration: 10000, // Optional, auto-detected from video
}
```

**Features:**
- ✅ Audio enabled by default
- ✅ Progress bar pauses during buffering
- ✅ Auto-detects video duration

#### 3. Text Story

```tsx
{
  id: 'unique-id',
  type: 'text',
  text: 'Hello World!',
  backgroundColor: '#FF6B6B', // Optional, default: '#000'
  textColor: '#FFFFFF', // Optional, default: '#fff'
  duration: 5000,
}
```

#### 4. Custom Component Story

The most powerful feature - add ANY custom React component as a story!

```tsx
const MyCustomStory: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
  prev,
  setDuration
}) => {
  return (
    <div style={{ height: '100%', background: '#667eea', padding: '20px' }}>
      <h1>Custom Content</h1>
      <button onClick={next}>Next Story</button>
    </div>
  );
};

// In your stories array:
{
  id: 'unique-id',
  type: 'custom_component',
  component: MyCustomStory,
  duration: 5000,
}
```

**Control Methods Available:**
- `pause()` - Pause the story timer
- `resume()` - Resume the story timer
- `next()` - Go to next story
- `prev()` - Go to previous story
- `setDuration(ms: number)` - Update story duration dynamically

## 💡 Custom Component Examples

Build interactive experiences! Here are examples included in `demoUsers`:

### 📊 Poll Component

```tsx
const PollComponent: React.FC<StoryItemControls> = ({ pause, resume, next }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [votes, setVotes] = React.useState([42, 28, 18, 12]);
  const options = ['React', 'Vue', 'Angular', 'Svelte'];

  React.useEffect(() => {
    pause(); // Pause timer during interaction
    return () => resume();
  }, [pause, resume]);

  const handleVote = (index: number) => {
    setSelected(index);
    const newVotes = [...votes];
    newVotes[index] += 1;
    setVotes(newVotes);

    setTimeout(() => {
      resume();
      next();
    }, 2000);
  };

  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>
        What's your favorite framework?
      </h2>
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleVote(index)}
          disabled={selected !== null}
          style={{
            margin: '8px 0',
            padding: '15px',
            background: selected === index ? '#4CAF50' : 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: selected !== null ? 'default' : 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{option}</span>
            {selected !== null && (
              <span>{((votes[index] / total) * 100).toFixed(0)}%</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// Use it in your stories:
{
  id: 'poll-1',
  type: 'custom_component',
  component: PollComponent,
  duration: 15000, // Extended duration for interaction
}
```

### 🧠 Quiz Component

```tsx
const QuizComponent: React.FC<StoryItemControls> = ({ pause, resume, next }) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const correctAnswer = 2; // Jupiter
  const options = ['Mars', 'Saturn', 'Jupiter', 'Neptune'];

  React.useEffect(() => {
    pause();
    return () => resume();
  }, [pause, resume]);

  const handleAnswer = (index: number) => {
    setSelected(index);
    setTimeout(() => {
      resume();
      next();
    }, 2500);
  };

  return (
    <div style={{ /* styles */ }}>
      <h2>Which planet is the largest in our solar system?</h2>
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswer(index)}
          disabled={selected !== null}
          style={{
            background: selected === index
              ? (index === correctAnswer ? '#4CAF50' : '#f44336')
              : 'rgba(255,255,255,0.2)'
          }}
        >
          {option}
          {selected !== null && index === correctAnswer && ' ✓'}
        </button>
      ))}
      {selected !== null && (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
          {selected === correctAnswer ? '🎉 Correct!' : '❌ Wrong! Jupiter is the largest.'}
        </p>
      )}
    </div>
  );
};
```

### ⏱️ Countdown Component

```tsx
const CountdownComponent: React.FC<StoryItemControls> = () => {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
      <h2 style={{ color: 'white', fontSize: '24px' }}>Product Launch</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
        Something amazing is coming...
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '15px 20px',
              minWidth: '70px'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
                {String(value).padStart(2, '0')}
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '8px' }}>
              {key.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 🎚️ Slider Component

```tsx
const SliderComponent: React.FC<StoryItemControls> = ({ pause, resume }) => {
  const [value, setValue] = React.useState(50);

  React.useEffect(() => {
    pause();
    return () => resume();
  }, [pause, resume]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '40px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔥</div>
      <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}>
        How excited are you?
      </h2>

      <div style={{ fontSize: '64px', margin: '30px 0' }}>{value}</div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: '80%',
          height: '8px',
          borderRadius: '4px',
          appearance: 'none',
          background: 'rgba(255,255,255,0.3)',
          outline: 'none'
        }}
      />
    </div>
  );
};
```

**💡 Tip**: All these examples are included in `demoUsers`! Import and use them to see how they work.

## 🎨 Styling

Import the default styles:

```tsx
import 'react-instagram-stories/styles.css';
```

Override with custom CSS:

```css
/* Override story viewer background */
.story-viewer {
  background: rgba(0, 0, 0, 0.95);
}

/* Customize progress bars */
.story-progress-bar {
  background: rgba(255, 255, 255, 0.3);
}

.story-progress-bar-fill {
  background: linear-gradient(to right, #ff6b6b, #ee5a6f);
}

/* Style avatars */
.avatar-list {
  padding: 20px;
  gap: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
}
```

## 💡 Advanced Usage

### Using Demo Data

```tsx
import { Stories, demoUsers } from 'react-instagram-stories';
import 'react-instagram-stories/styles.css';

function App() {
  return <Stories users={demoUsers} />;
}
```

The `demoUsers` includes examples of all story types including interactive polls, quizzes, countdowns, and sliders!

### Generate Demo Users

```tsx
import { generateDemoUsers } from 'react-instagram-stories';

const users = generateDemoUsers(10); // 10 users with random stories
```

### Create Custom Stories

```tsx
import type { User } from 'react-instagram-stories';

const myUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.jpg',
    hasUnreadStories: true, // Shows ring around avatar
    stories: [
      {
        id: 'story-1',
        type: 'image',
        src: 'https://example.com/photo.jpg',
        alt: 'Beach sunset',
        duration: 5000,
      },
      {
        id: 'story-2',
        type: 'video',
        src: 'https://example.com/video.mp4',
        // duration auto-detected
      },
      {
        id: 'story-3',
        type: 'text',
        text: 'Hello from my story!',
        backgroundColor: '#FF6B6B',
        textColor: '#FFFFFF',
        duration: 5000,
      },
      {
        id: 'story-4',
        type: 'custom_component',
        component: MyPollComponent,
        duration: 10000,
      },
    ],
  },
];
```

### Without React Router

If you don't need URL navigation, use components directly:

```tsx
import { useState } from 'react';
import { AvatarList, StoryViewer } from 'react-instagram-stories';

function App() {
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    userIndex: 0,
  });

  return (
    <>
      <AvatarList
        users={myUsers}
        onAvatarClick={(index) => setViewerState({ isOpen: true, userIndex: index })}
      />
      <StoryViewer
        users={myUsers}
        initialUserIndex={viewerState.userIndex}
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, userIndex: 0 })}
      />
    </>
  );
}
```

## ⌨️ Keyboard Controls

- `←` `→` - Navigate stories
- `Space` - Pause/Resume
- `Esc` - Close viewer

## 🖱️ Mouse & Touch

- **Tap Left/Right** - Navigate stories
- **Swipe Left/Right** - Change users
- **Swipe Down** - Close
- **Hold/Hover** - Pause

## 🎯 TypeScript Types

```tsx
import type {
  User,
  StoryItem,
  StoryItemType,
  StoryItemControls,
  ImageStoryItem,
  VideoStoryItem,
  TextStoryItem,
  CustomComponentStoryItem
} from 'react-instagram-stories';

// Core Types
type StoryItemType = 'image' | 'video' | 'text' | 'custom_component';

interface StoryItemControls {
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  setDuration: (ms: number) => void;
}

interface User {
  id: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  hasUnreadStories?: boolean;
}
```

## 📦 Package Exports

```tsx
// Main component
export { Stories } from 'react-instagram-stories';

// Types
export type {
  User,
  StoryItem,
  StoryItemControls,
  StoryItemType,
  ImageStoryItem,
  VideoStoryItem,
  TextStoryItem,
  CustomComponentStoryItem
} from 'react-instagram-stories';

// Utilities
export { generateDemoUsers, demoUsers } from 'react-instagram-stories';

// Styles
import 'react-instagram-stories/styles.css';
```

## 🚀 Performance

- **Bundle Size**: 74.8 KB (20 KB gzipped)
- **Zero Runtime Dependencies**
- **Smart Preloading**: Preloads adjacent stories
- **Optimized Rendering**: Uses React.memo
- **Video Buffering Detection**: Pauses progress during buffering

## 📊 Package Info

- **ESM**: 28.77 KB
- **CJS**: 30.44 KB
- **Gzipped**: ~20 KB
- **Dependencies**: 0 (React is peer dep)

## 🛠️ Tech Stack

- React 18+
- TypeScript
- React Router DOM (peer dependency)
- tsup (bundler)

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

## 📄 License

MIT © [Ankit Jangir](https://github.com/ankit64jangir)

## 📞 Support

- 🐛 [Issues](https://github.com/ankit64jangir/react-instagram-stories/issues)
- 💬 [Discussions](https://github.com/ankit64jangir/react-instagram-stories/discussions)
- ⭐ [Star](https://github.com/ankit64jangir/react-instagram-stories)

---

Made with ❤️ by Ankit Jangir
