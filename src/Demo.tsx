import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Stories } from './components';
import { demoUsers, generateDemoUsers } from './utils/demoData';
import { Home } from './pages/Home';

const DemoPageHeader: React.FC<{
  userCount: 'small' | 'large';
  setUserCount: (count: 'small' | 'large') => void;
}> = ({ userCount, setUserCount }) => {
  const navigate = useNavigate();

  const features = [
    { text: 'Tap left/right to navigate stories' },
    { text: 'Swipe left/right to switch users' },
    { text: 'Swipe down to close' },
    { text: 'Long-press or hover to pause' },
    { text: 'Keyboard navigation (←/→/Space/Esc)' },
    { text: 'Image, Video, Text, and Custom Components' },
  ];

  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-6">
          {/* Title with Gradient */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              Instagram Stories Demo
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Click on any avatar below to view their stories
          </p>

          {/* Dataset Toggle Buttons */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setUserCount('small')}
                className={`rounded-full px-4 py-2 text-xs md:text-sm transition-all duration-300 font-semibold ${
                  userCount === 'small'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Small Dataset (5 users)
              </button>
              <button
                onClick={() => setUserCount('large')}
                className={`rounded-full px-4 py-2 text-xs md:text-sm transition-all duration-300 font-semibold ${
                  userCount === 'large'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Large Dataset (200 users)
              </button>
            </div>
          </div>

          {/* Features - Compact */}
          <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-5 max-w-3xl mx-auto">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Demo: React.FC = () => {
  const [userCount, setUserCount] = useState<'small' | 'large'>('small');
  const users = userCount === 'small' ? demoUsers : generateDemoUsers(200);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/demo"
        element={
          <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, rgb(250, 245, 255), rgb(252, 231, 243), rgb(239, 246, 255))' }}>
            <DemoPageHeader userCount={userCount} setUserCount={setUserCount} />

            {/* Stories Container with white background for proper avatar display */}
            <div className="bg-white py-4 border-t border-b border-gray-200">
              <div className="px-4">
                <Stories users={users} closeNavigateTo="/demo" />
              </div>
            </div>

            <footer className="py-6 bg-white/60 backdrop-blur-md">
              <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                <p>
                  Built with React, TypeScript, and performance optimizations
                  <br />
                  <span className="text-xs">
                    Supports 200+ users with 1000+ stories smoothly
                  </span>
                </p>
              </div>
            </footer>
          </div>
        }
      />
      <Route
        path="/story/:storyId"
        element={
          <Stories users={users} closeNavigateTo="/demo" />
        }
      />
    </Routes>
  );
};
