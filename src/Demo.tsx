import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Stories } from './components';
import { demoUsers, generateDemoUsers } from './utils/demoData';
import './styles.css';

export const Demo: React.FC = () => {
  const [userCount, setUserCount] = useState<'small' | 'large'>('small');
  const users = userCount === 'small' ? demoUsers : generateDemoUsers(200);

  return (
    <Routes>
      <Route path="/" element={
        <div className="demo-container">
          <header className="demo-header">
            <h1>Instagram Stories Clone</h1>
            <p>High-performance React Stories implementation</p>

            <div className="demo-controls">
              <button
                className={`demo-btn ${userCount === 'small' ? 'active' : ''}`}
                onClick={() => setUserCount('small')}
              >
                Small Dataset (5 users)
              </button>
              <button
                className={`demo-btn ${userCount === 'large' ? 'active' : ''}`}
                onClick={() => setUserCount('large')}
              >
                Large Dataset (200 users)
              </button>
            </div>

            <div className="demo-features">
              <h3>Features:</h3>
              <ul>
                <li>✅ Tap left/right to navigate stories</li>
                <li>✅ Swipe left/right to switch users</li>
                <li>✅ Swipe down to close</li>
                <li>✅ Long-press or hover to pause</li>
                <li>✅ Keyboard navigation (←/→/Space/Esc)</li>
                <li>✅ Image, Video, Text, and Custom Components</li>
                <li>✅ Auto-advance with progress bars</li>
                <li>✅ Virtualized avatar list</li>
                <li>✅ Smart preloading</li>
                <li>✅ Mobile-friendly & accessible</li>
                <li>✅ Shareable story URLs</li>
              </ul>
            </div>
          </header>

          <main className="demo-main">
            <Stories users={users} />
          </main>

          <footer className="demo-footer">
            <p>
              Built with React, TypeScript, and performance optimizations.
              <br />
              Supports 200+ users with 1000+ stories smoothly.
            </p>
          </footer>
        </div>
      } />
      <Route path="/story/:storyId" element={
        <div className="demo-container">
          <main className="demo-main">
            <Stories users={users} />
          </main>
        </div>
      } />
    </Routes>
  );
};
