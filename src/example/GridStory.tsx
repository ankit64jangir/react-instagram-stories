import React from 'react';
import { StoryItemControls } from '../types';

export const GridStory: React.FC<StoryItemControls> = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA'
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      padding: '20px',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: colors[i],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            borderRadius: '10px',
            aspectRatio: '1',
            minHeight: '80px'
          }}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};