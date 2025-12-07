import { User, StoryItemControls } from "../types";
import React from "react";

// Sample interactive poll component for demonstration
export const PollComponent: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
}) => {
  const [selected, setSelected] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Pause story when component mounts (interactive)
    pause();

    return () => {
      resume();
    };
  }, [pause, resume]);

  const handleVote = (option: number) => {
    setSelected(option);
    setTimeout(() => {
      resume();
      next();
    }, 1500);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "30px", fontSize: "24px" }}>
        What's your favorite feature?
      </h2>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        {[
          "Swipe Gestures",
          "Auto-advance",
          "Custom Components",
          "Video Support",
        ].map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleVote(idx)}
            style={{
              width: "100%",
              padding: "15px",
              margin: "10px 0",
              border: "2px solid white",
              borderRadius: "25px",
              background: selected === idx ? "white" : "rgba(255,255,255,0.2)",
              color: selected === idx ? "#667eea" : "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {selected !== null && (
        <p style={{ color: "white", marginTop: "20px" }}>Thanks for voting!</p>
      )}
    </div>
  );
};

// Generate demo data with 200+ users for performance testing
export const generateDemoUsers = (count: number = 50): User[] => {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const hasUnread = Math.random() > 0.3;
    const storyCount = Math.floor(Math.random() * 8) + 1;

    users.push({
      id: `user-${i}`,
      username: `user${i}`,
      avatarUrl: `https://i.pravatar.cc/150?img=${i % 70}`,
      hasUnreadStories: hasUnread,
      stories: Array.from({ length: storyCount }, (_, storyIdx) => {
        const type = ["image", "video", "text", "component"][
          Math.floor(Math.random() * 100) % 4
        ];

        if (type === "image") {
          return {
            id: `story-${i}-${storyIdx}`,
            type: "image" as const,
            src: `https://picsum.photos/1080/1920?random=${i * 100 + storyIdx}`,
            duration: 5000,
            alt: `Story from user${i}`,
          };
        }

        if (type === "video") {
          return {
            id: `story-${i}-${storyIdx}`,
            type: "video" as const,
            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 10000,
          };
        }

        if (type === "text") {
          const backgrounds = [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA07A",
            "#98D8C8",
          ];
          return {
            id: `story-${i}-${storyIdx}`,
            type: "text" as const,
            text: `This is a text story from user${i}!\n\nSwipe to see more →`,
            backgroundColor: backgrounds[i % backgrounds.length],
            textColor: "#FFFFFF",
            duration: 5000,
          };
        }

        // component type
        return {
          id: `story-${i}-${storyIdx}`,
          type: "component" as const,
          component: PollComponent,
          duration: 10000,
        };
      }),
    });
  }

  return users;
};

// Smaller dataset for quick testing
export const demoUsers: User[] = [
  {
    id: "user-1",
    username: "travel_enthusiast",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    hasUnreadStories: true,
    stories: [
      {
        id: "story-1-1",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=1",
        duration: 5000,
        alt: "Beautiful landscape",
      },
      {
        id: "story-1-2",
        type: "text",
        text: "Just arrived in Bali! 🌴\n\nThe views are amazing!",
        backgroundColor: "#FF6B6B",
        textColor: "#FFFFFF",
        duration: 4000,
      },
      {
        id: "story-1-3",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=2",
        duration: 5000,
        alt: "Beach sunset",
      },
    ],
  },
  {
    id: "user-2",
    username: "food_lover",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    hasUnreadStories: true,
    stories: [
      {
        id: "story-2-1",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=3",
        duration: 5000,
        alt: "Delicious meal",
      },
      {
        id: "story-2-2",
        type: "component",
        component: PollComponent,
        duration: 15000,
      },
      {
        id: "story-2-3",
        type: "text",
        text: "Thanks for voting! 🙏\n\nMore food content coming soon!",
        backgroundColor: "#4ECDC4",
        textColor: "#FFFFFF",
        duration: 4000,
      },
    ],
  },
  {
    id: "user-3",
    username: "fitness_pro",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    hasUnreadStories: false,
    stories: [
      {
        id: "story-3-1",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=4",
        duration: 5000,
        alt: "Workout session",
      },
      {
        id: "story-3-2",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=5",
        duration: 5000,
        alt: "Gym equipment",
      },
    ],
  },
  {
    id: "user-4",
    username: "nature_photographer",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    hasUnreadStories: true,
    stories: [
      {
        id: "story-4-1",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=6",
        duration: 6000,
        alt: "Mountain vista",
      },
      {
        id: "story-4-2",
        type: "text",
        text: "Early morning hike ⛰️\n\nThe sunrise was worth it!",
        backgroundColor: "#45B7D1",
        textColor: "#FFFFFF",
        duration: 4000,
      },
      {
        id: "story-4-3",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=7",
        duration: 5000,
        alt: "Forest path",
      },
    ],
  },
  {
    id: "user-5",
    username: "tech_geek",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    hasUnreadStories: true,
    stories: [
      {
        id: "story-5-1",
        type: "text",
        text: "Just built an Instagram Stories clone! 🚀\n\nCheck out the features →",
        backgroundColor: "#9B59B6",
        textColor: "#FFFFFF",
        duration: 5000,
      },
      {
        id: "story-5-2",
        type: "image",
        src: "https://picsum.photos/1080/1920?random=8",
        duration: 5000,
        alt: "Coding setup",
      },
    ],
  },
];
