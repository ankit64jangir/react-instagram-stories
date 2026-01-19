import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Hand, Keyboard, Zap, Image, Smartphone, Eye, BarChart, Layers, Code, Users, Clock, Globe } from 'lucide-react';

// Shader Background Component
function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const vertexShaderSource = `#version 300 es
      precision highp float;
      in vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      uniform float u_time;
      uniform vec2 u_resolution;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 st = (uv - 0.5) * 2.0;
        st.x *= u_resolution.x / u_resolution.y;

        float time = u_time * 0.3;

        // Create flowing gradient effect
        float wave1 = sin(st.x * 3.0 + time) * 0.5 + 0.5;
        float wave2 = sin(st.y * 2.0 - time * 0.8) * 0.5 + 0.5;
        float wave3 = sin((st.x + st.y) * 2.5 + time * 1.2) * 0.5 + 0.5;

        // Instagram-inspired gradient colors
        vec3 color1 = vec3(0.8, 0.2, 0.9); // Purple
        vec3 color2 = vec3(0.9, 0.3, 0.5); // Pink
        vec3 color3 = vec3(1.0, 0.6, 0.2); // Orange
        vec3 color4 = vec3(0.2, 0.1, 0.3); // Dark purple

        vec3 finalColor = mix(color4, color1, wave1);
        finalColor = mix(finalColor, color2, wave2 * 0.7);
        finalColor = mix(finalColor, color3, wave3 * 0.5);

        // Add some noise for texture
        float n = noise(st * 10.0 + time) * 0.05;
        finalColor += n;

        // Vignette effect
        float vignette = 1.0 - length(uv - 0.5) * 0.8;
        finalColor *= vignette;

        fragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let startTime = Date.now();
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#1a0a2e' }}
    />
  );
}

// Hero Section
function HeroSection() {
  const navigate = useNavigate();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.15,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#1a0a2e]">
      <ShaderBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a0a2e]/80 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 md:mb-12"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
            <span className="text-sm text-white/80 tracking-wide font-medium">
              High-Performance React Component
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tight leading-none">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300">
                Instagram Stories
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 mt-2">
                Component Library
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-lg sm:text-xl md:text-2xl text-white/60 mb-10 md:mb-12 leading-relaxed font-light max-w-2xl mx-auto px-4">
              Build beautiful, performant Instagram-style stories with our React
              component. Smooth animations, touch gestures, and fully
              customizable.
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row flex-wrap gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              View Demo
            </button>

            <button
              onClick={() =>
                window.open(
                  'https://github.com/ankit64jangir/react-instagram-stories',
                  '_blank'
                )
              }
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>React 18+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Zero Dependencies</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e] via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// Features Grid Section
function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<'svg'> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length?: number): number[][] {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7,
    Math.floor(Math.random() * 6) + 1,
  ]);
}

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
};

function FeatureCard({
  feature,
  className,
}: {
  feature: FeatureType;
  className?: string;
}) {
  const p = genRandomPattern();

  return (
    <div className={`relative overflow-hidden p-6 bg-white ${className}`}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 to-slate-900/1 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="fill-slate-900/5 stroke-slate-900/25 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>
      <feature.icon
        className="text-slate-900/75 w-6 h-6"
        strokeWidth={1}
        aria-hidden
      />
      <h3 className="mt-10 text-sm md:text-base font-medium">{feature.title}</h3>
      <p className="text-slate-600 relative z-20 mt-2 text-xs font-light">
        {feature.description}
      </p>
    </div>
  );
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features: FeatureType[] = [
  {
    title: 'Touch Gestures',
    icon: Hand,
    description:
      'Tap left/right to navigate, swipe to switch users, long-press to pause',
  },
  {
    title: 'Keyboard Support',
    icon: Keyboard,
    description:
      'Full keyboard navigation with arrow keys, space, and escape',
  },
  {
    title: 'High Performance',
    icon: Zap,
    description:
      'Virtualized list, smart preloading, and optimized animations',
  },
  {
    title: 'Media Support',
    icon: Image,
    description: 'Images, videos, text, and custom React components',
  },
  {
    title: 'Mobile Friendly',
    icon: Smartphone,
    description: 'Responsive design optimized for all screen sizes',
  },
  {
    title: 'Accessible',
    icon: Eye,
    description:
      'ARIA labels, keyboard support, and screen reader friendly',
  },
];

function FeaturesSection() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1a0a2e] to-slate-50 py-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-white md:text-4xl lg:text-5xl xl:font-extrabold">
            Built for Modern Experiences
          </h2>
          <p className="text-white/60 mt-4 text-sm tracking-wide md:text-base">
            Everything you need for a fast, accessible, and delightful user
            experience.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

const performanceFeatures: FeatureType[] = [
  {
    title: 'Virtualized Rendering',
    icon: BarChart,
    description: 'Only renders visible stories, supporting 1000+ users smoothly',
  },
  {
    title: 'Smart Preloading',
    icon: Layers,
    description: 'Automatically preloads next stories for seamless transitions',
  },
  {
    title: 'Optimized Animations',
    icon: Clock,
    description: '60fps smooth animations using hardware acceleration',
  },
  {
    title: 'Zero Dependencies',
    icon: Code,
    description: 'Lightweight bundle with no external runtime dependencies',
  },
];

function PerformanceSection() {
  return (
    <section className="bg-slate-50 py-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 md:text-4xl lg:text-5xl xl:font-extrabold">
            Performance Optimized
          </h2>
          <p className="text-slate-600 mt-4 text-sm tracking-wide md:text-base">
            Built from the ground up for speed and efficiency. Handle thousands of
            stories without breaking a sweat.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-4"
        >
          {performanceFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} className="bg-slate-50" />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

const contentTypes: FeatureType[] = [
  {
    title: 'Images',
    icon: Image,
    description: 'Support for any image format with automatic aspect ratio handling',
  },
  {
    title: 'Videos',
    icon: Globe,
    description: 'Auto-playing videos with audio support and buffering detection',
  },
  {
    title: 'Text',
    icon: Code,
    description: 'Beautiful text overlays with customizable colors and backgrounds',
  },
  {
    title: 'Custom Components',
    icon: Layers,
    description: 'Embed any React component for polls, quizzes, products, and more',
  },
];

function ContentTypesSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-purple-50 py-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 md:text-4xl lg:text-5xl xl:font-extrabold">
            Rich Content Types
          </h2>
          <p className="text-slate-600 mt-4 text-sm tracking-wide md:text-base">
            Support for any content type you can imagine. From simple images to
            interactive experiences.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-4"
        >
          {contentTypes.map((feature, i) => (
            <FeatureCard key={i} feature={feature} className="bg-white" />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

const customComponentFeatures: FeatureType[] = [
  {
    title: 'Full Control',
    icon: Code,
    description: 'Pass custom components with full access to pause, resume, and navigation controls',
  },
  {
    title: 'Interactive Polls',
    icon: Users,
    description: 'Create engaging polls that collect user responses in real-time',
  },
  {
    title: 'Product Showcases',
    icon: Globe,
    description: 'Display products with buy buttons and detailed information cards',
  },
  {
    title: 'Dynamic Content',
    icon: BarChart,
    description: 'Render any React component - quizzes, countdowns, forms, and more',
  },
];

function CustomComponentsSection() {
  return (
    <section className="bg-gradient-to-b from-purple-50 to-pink-50 py-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 md:text-4xl lg:text-5xl xl:font-extrabold">
            Custom Components
          </h2>
          <p className="text-slate-600 mt-4 text-sm tracking-wide md:text-base">
            Extend the story experience with custom React components. Build polls,
            quizzes, product showcases, and more.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-4"
        >
          {customComponentFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} className="bg-white" />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

const accessibilityFeatures: FeatureType[] = [
  {
    title: 'Keyboard Navigation',
    icon: Keyboard,
    description: 'Complete keyboard support with arrow keys, space, and escape',
  },
  {
    title: 'Screen Reader Ready',
    icon: Eye,
    description: 'ARIA labels and semantic HTML for accessibility tools',
  },
  {
    title: 'Reduced Motion',
    icon: Clock,
    description: 'Respects user preferences for reduced motion animations',
  },
  {
    title: 'Focus Management',
    icon: Users,
    description: 'Proper focus handling for keyboard and screen reader users',
  },
];

function AccessibilitySection() {
  return (
    <section className="bg-gradient-to-b from-pink-50 to-orange-50 py-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 md:text-4xl lg:text-5xl xl:font-extrabold">
            Accessible by Default
          </h2>
          <p className="text-slate-600 mt-4 text-sm tracking-wide md:text-base">
            Built with accessibility in mind. Everyone can enjoy your stories,
            regardless of how they interact.
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-4"
        >
          {accessibilityFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} className="bg-white" />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Experience the demo and see how easy it is to integrate
            </p>
            <button
              onClick={() => navigate('/demo')}
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Launch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 bg-white">
      <div className="container mx-auto px-4 text-center text-slate-600">
        <p>
          Built with React, TypeScript, and Tailwind CSS
          <br />
          High-performance Instagram-style Stories component
        </p>
      </div>
    </footer>
  );
}

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PerformanceSection />
      <ContentTypesSection />
      <CustomComponentsSection />
      <AccessibilitySection />
      <CTASection />
      <Footer />
    </div>
  );
};
