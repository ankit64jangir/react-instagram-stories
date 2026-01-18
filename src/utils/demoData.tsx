import { User, StoryItemControls } from "../types";
import React from "react";

// ============================================
// CUSTOM STORY COMPONENTS
// ============================================

// Interactive Poll Component
export const PollComponent: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
}) => {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [votes, setVotes] = React.useState([42, 28, 18, 12]);

  React.useEffect(() => {
    pause();
    return () => resume();
  }, [pause, resume]);

  const handleVote = (option: number) => {
    setSelected(option);
    const newVotes = [...votes];
    newVotes[option] += 1;
    setVotes(newVotes);
    setTimeout(() => {
      resume();
      next();
    }, 2000);
  };

  const total = votes.reduce((a, b) => a + b, 0);
  const options = ["React", "Vue", "Angular", "Svelte"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        width: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>
        Poll
      </h2>
      <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "30px", fontSize: "18px" }}>
        What's your favorite framework?
      </p>

      <div style={{ width: "100%" }}>
        {options.map((option, idx) => {
          const percentage = Math.round((votes[idx] / total) * 100);
          const isSelected = selected === idx;

          return (
            <button
              key={idx}
              onClick={() => selected === null && handleVote(idx)}
              disabled={selected !== null}
              style={{
                width: "100%",
                padding: "16px 20px",
                margin: "8px 0",
                border: "none",
                borderRadius: "12px",
                background: selected !== null
                  ? `linear-gradient(90deg, rgba(255,255,255,0.4) ${percentage}%, rgba(255,255,255,0.15) ${percentage}%)`
                  : "rgba(255,255,255,0.2)",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: selected === null ? "pointer" : "default",
                transition: "all 0.3s ease",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {isSelected && "✓ "}
                {option}
              </span>
              {selected !== null && <span>{percentage}%</span>}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "20px", fontSize: "14px" }}>
          {total} votes • Thanks for voting!
        </p>
      )}
    </div>
  );
};

// Quiz Component
export const QuizComponent: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
}) => {
  const [answered, setAnswered] = React.useState(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const correctAnswer = 2;

  React.useEffect(() => {
    pause();
    return () => resume();
  }, [pause, resume]);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setAnswered(true);
    setTimeout(() => {
      resume();
      next();
    }, 2500);
  };

  const options = ["Mars", "Venus", "Jupiter", "Saturn"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        width: "100%",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      }}
    >
      <div style={{
        fontSize: "48px",
        marginBottom: "20px",
        animation: "bounce 1s infinite"
      }}>
        🪐
      </div>
      <h2 style={{ color: "white", marginBottom: "10px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
        Quiz Time!
      </h2>
      <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "30px", fontSize: "18px", textAlign: "center" }}>
        Which is the largest planet in our solar system?
      </p>

      <div style={{ width: "100%" }}>
        {options.map((option, idx) => {
          const isCorrect = idx === correctAnswer;
          const isSelected = selected === idx;

          let bgColor = "rgba(255,255,255,0.2)";
          if (answered) {
            if (isCorrect) bgColor = "rgba(34, 197, 94, 0.6)";
            else if (isSelected) bgColor = "rgba(239, 68, 68, 0.6)";
          }

          return (
            <button
              key={idx}
              onClick={() => !answered && handleAnswer(idx)}
              disabled={answered}
              style={{
                width: "100%",
                padding: "16px 20px",
                margin: "8px 0",
                border: "none",
                borderRadius: "12px",
                background: bgColor,
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: answered ? "default" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{option}</span>
              {answered && isCorrect && <span>✓</span>}
              {answered && isSelected && !isCorrect && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <p style={{
          color: "white",
          marginTop: "20px",
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          {selected === correctAnswer ? "🎉 Correct!" : "❌ Wrong! Jupiter is the largest."}
        </p>
      )}
    </div>
  );
};

// Countdown/Announcement Component
export const CountdownComponent: React.FC<StoryItemControls> = () => {
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

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "15px 20px",
          minWidth: "70px",
        }}
      >
        <div style={{ fontSize: "32px", fontWeight: "bold", color: "white" }}>
          {String(value).padStart(2, "0")}
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "8px", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        width: "100%",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "15px" }}>🚀</div>
      <h2 style={{ color: "white", marginBottom: "8px", fontSize: "24px", fontWeight: "bold" }}>
        Product Launch
      </h2>
      <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "30px", fontSize: "14px" }}>
        Something amazing is coming...
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
        <TimeBox value={timeLeft.days} label="Days" />
        <TimeBox value={timeLeft.hours} label="Hours" />
        <TimeBox value={timeLeft.minutes} label="Mins" />
        <TimeBox value={timeLeft.seconds} label="Secs" />
      </div>

      <button
        style={{
          padding: "14px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: "30px",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Notify Me
      </button>
    </div>
  );
};

// Product Showcase Component
export const ProductShowcaseComponent: React.FC<StoryItemControls> = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Product Image */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
          alt="Product"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
        />
      </div>

      {/* Product Info */}
      <div
        style={{
          padding: "30px",
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ background: "#ef4444", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
            NEW
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>Limited Edition</span>
        </div>
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          Premium Watch Collection
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "15px" }}>
          Elegant design meets modern technology
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "white", fontSize: "28px", fontWeight: "bold" }}>$299</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "18px", textDecoration: "line-through" }}>$399</span>
        </div>
        <button
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "16px",
            background: "white",
            border: "none",
            borderRadius: "12px",
            color: "#1a1a2e",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Shop Now →
        </button>
      </div>
    </div>
  );
};

// Slider/Rating Component
export const SliderComponent: React.FC<StoryItemControls> = ({
  pause,
  resume,
  next,
}) => {
  const [value, setValue] = React.useState(5);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    pause();
    return () => resume();
  }, [pause, resume]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      resume();
      next();
    }, 1500);
  };

  const emojis = ["😢", "😕", "😐", "🙂", "😊", "😃", "😄", "😁", "🤩", "🥳"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        width: "100%",
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      }}
    >
      <div style={{ fontSize: "80px", marginBottom: "20px", transition: "all 0.3s" }}>
        {emojis[value - 1]}
      </div>

      <h2 style={{ color: "white", marginBottom: "10px", fontSize: "24px", fontWeight: "bold" }}>
        Rate Your Experience
      </h2>
      <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "30px", fontSize: "16px" }}>
        How was your visit today?
      </p>

      {!submitted ? (
        <>
          <div style={{ width: "100%", marginBottom: "20px" }}>
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                appearance: "none",
                background: "rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.7)", fontSize: "12px", marginTop: "8px" }}>
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            style={{
              padding: "14px 50px",
              background: "white",
              border: "none",
              borderRadius: "30px",
              color: "#11998e",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Submit ({value}/10)
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎉</div>
          <p style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
            Thanks for your feedback!
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// DEMO DATA
// ============================================

// Sample working video URLs
const sampleVideos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

// Sample working image URLs from Unsplash
const sampleImages = [
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080&h=1920&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&h=1920&fit=crop",
];

// Avatar URLs
const avatarImages = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
];

// Main demo users with diverse story types
export const demoUsers: User[] = [
  {
    id: "user-travel",
    username: "Travel",
    avatarUrl: avatarImages[0],
    hasUnreadStories: true,
    stories: [
      {
        id: "travel-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Beautiful mountain landscape",
      },
      {
        id: "travel-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Scenic ocean view",
      },
      {
        id: "travel-3",
        type: "text",
        text: "Adventure awaits! 🌍\n\nSwipe to explore more destinations →",
        backgroundColor: "#FF6B6B",
        textColor: "#FFFFFF",
        duration: 4000,
      },
      {
        id: "travel-4",
        type: "video",
        src: sampleVideos[0],
        duration: 15000,
      },
    ],
  },
  {
    id: "user-polls",
    username: "Interactive",
    avatarUrl: avatarImages[1],
    hasUnreadStories: true,
    stories: [
      {
        id: "poll-intro",
        type: "text",
        text: "Let's have some fun! 🎮\n\nInteractive stories ahead →",
        backgroundColor: "#667eea",
        textColor: "#FFFFFF",
        duration: 3000,
      },
      {
        id: "poll-1",
        type: "custom_component",
        component: PollComponent,
        duration: 30000,
      },
      {
        id: "quiz-1",
        type: "custom_component",
        component: QuizComponent,
        duration: 30000,
      },
      {
        id: "slider-1",
        type: "custom_component",
        component: SliderComponent,
        duration: 30000,
      },
    ],
  },
  {
    id: "user-product",
    username: "Shop",
    avatarUrl: avatarImages[2],
    hasUnreadStories: true,
    stories: [
      {
        id: "product-1",
        type: "custom_component",
        component: ProductShowcaseComponent,
        duration: 8000,
      },
      {
        id: "product-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Product showcase",
      },
      {
        id: "product-3",
        type: "text",
        text: "Limited Time Offer! 🔥\n\n50% OFF\n\nUse code: STORY50",
        backgroundColor: "#000000",
        textColor: "#FFFFFF",
        duration: 5000,
      },
    ],
  },
  {
    id: "user-launch",
    username: "Events",
    avatarUrl: avatarImages[3],
    hasUnreadStories: true,
    stories: [
      {
        id: "launch-1",
        type: "custom_component",
        component: CountdownComponent,
        duration: 10000,
      },
      {
        id: "launch-2",
        type: "text",
        text: "Mark your calendars! 📅\n\nBig announcement coming soon...",
        backgroundColor: "#302b63",
        textColor: "#FFFFFF",
        duration: 4000,
      },
      {
        id: "launch-3",
        type: "image",
        src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Event teaser",
      },
    ],
  },
  {
    id: "user-video",
    username: "Videos",
    avatarUrl: avatarImages[4],
    hasUnreadStories: true,
    stories: [
      {
        id: "video-1",
        type: "video",
        src: sampleVideos[1],
        duration: 15000,
      },
      {
        id: "video-2",
        type: "video",
        src: sampleVideos[2],
        duration: 15000,
      },
      {
        id: "video-3",
        type: "text",
        text: "More videos coming soon! 🎬\n\nStay tuned →",
        backgroundColor: "#4ECDC4",
        textColor: "#FFFFFF",
        duration: 3000,
      },
    ],
  },
  {
    id: "user-lifestyle",
    username: "Lifestyle",
    avatarUrl: avatarImages[5],
    hasUnreadStories: false,
    stories: [
      {
        id: "lifestyle-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Nature scene",
      },
      {
        id: "lifestyle-2",
        type: "image",
        src: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1080&h=1920&fit=crop",
        duration: 5000,
        alt: "Peaceful landscape",
      },
      {
        id: "lifestyle-3",
        type: "text",
        text: "Find your peace 🧘\n\nNature heals everything",
        backgroundColor: "#45B7D1",
        textColor: "#FFFFFF",
        duration: 4000,
      },
    ],
  },
];

// Generate demo users for performance testing
export const generateDemoUsers = (count: number = 50): User[] => {
  const users: User[] = [...demoUsers];

  for (let i = demoUsers.length; i < count; i++) {
    const hasUnread = Math.random() > 0.3;
    const storyCount = Math.floor(Math.random() * 5) + 2;

    users.push({
      id: `user-${i}`,
      username: `User ${i}`,
      avatarUrl: `https://i.pravatar.cc/150?img=${i % 70}`,
      hasUnreadStories: hasUnread,
      stories: Array.from({ length: storyCount }, (_, storyIdx) => {
        const typeRandom = Math.random();

        // 50% images, 20% videos, 20% text, 10% custom
        if (typeRandom < 0.5) {
          return {
            id: `story-${i}-${storyIdx}`,
            type: "image" as const,
            src: sampleImages[Math.floor(Math.random() * sampleImages.length)],
            duration: 5000,
            alt: `Story from User ${i}`,
          };
        }

        if (typeRandom < 0.7) {
          return {
            id: `story-${i}-${storyIdx}`,
            type: "video" as const,
            src: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
            duration: 15000,
          };
        }

        if (typeRandom < 0.9) {
          const backgrounds = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#667eea", "#764ba2"];
          return {
            id: `story-${i}-${storyIdx}`,
            type: "text" as const,
            text: `Hello from User ${i}! 👋\n\nThis is story ${storyIdx + 1}`,
            backgroundColor: backgrounds[Math.floor(Math.random() * backgrounds.length)],
            textColor: "#FFFFFF",
            duration: 4000,
          };
        }

        // Custom component
        const components = [PollComponent, QuizComponent, SliderComponent];
        return {
          id: `story-${i}-${storyIdx}`,
          type: "custom_component" as const,
          component: components[Math.floor(Math.random() * components.length)],
          duration: 30000,
        };
      }),
    });
  }

  return users;
};
