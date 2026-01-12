import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Bot, Zap, BookOpen } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };
    countRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(countRef.current);
  }, [end, duration]);

  return <span className="font-mono">{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Typewriter Effect Component
const Typewriter = ({ text, speed = 50, delay = 500 }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          // Blink cursor then hide
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse text-flowpay-400">|</span>}
    </span>
  );
};

// Floating Metric Card
const FloatingCard = ({ icon: Icon, label, value, delay = 0, color = 'flowpay' }) => {
  const colors = {
    flowpay: 'from-flowpay-500/20 to-flowpay-600/10 border-flowpay-500/30',
    accent: 'from-accent-500/20 to-accent-600/10 border-accent-500/30',
    success: 'from-success-500/20 to-success-600/10 border-success-500/30',
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border backdrop-blur-sm
        bg-gradient-to-br ${colors[color]}
        animate-float hover-lift
        transform transition-all duration-500
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-white/80" />
        <div>
          <div className="text-lg font-bold text-white">{value}</div>
          <div className="text-xs text-white/60">{label}</div>
        </div>
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

// Particle Effect Background
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-flowpay-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-flowpay-400/10 rounded-full blur-2xl animate-float" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-flowpay-400/50 rounded-full animate-float"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + i * 0.5}s`
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Flow lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0,50 Q250,100 500,50 T1000,50"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="2"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

// Statistics Banner
const StatisticsBanner = ({ stats }) => {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-xl glass hover-glow">
        <div className="text-2xl md:text-3xl font-bold text-gradient-primary">
          <AnimatedCounter end={stats.totalStreams} duration={2500} />
        </div>
        <div className="text-xs text-white/60 mt-1">Total Streams</div>
      </div>

      <div className="text-center p-4 rounded-xl glass hover-glow">
        <div className="text-2xl md:text-3xl font-bold text-gradient-accent">
          <AnimatedCounter end={stats.totalMNEE} duration={2500} prefix="$" suffix="K" />
        </div>
        <div className="text-xs text-white/60 mt-1">MNEE Streamed</div>
      </div>

      <div className="text-center p-4 rounded-xl glass hover-glow">
        <div className="text-2xl md:text-3xl font-bold text-success-400">
          <AnimatedCounter end={stats.activeAgents} duration={2000} />
        </div>
        <div className="text-xs text-white/60 mt-1">Active Agents</div>
      </div>

      <div className="text-center p-4 rounded-xl glass hover-glow">
        <div className="text-2xl md:text-3xl font-bold text-warning-400">
          <AnimatedCounter end={stats.txnsSaved} duration={3000} suffix="+" />
        </div>
        <div className="text-xs text-white/60 mt-1">Txns Saved</div>
      </div>
    </div>
  );
};

export default function Hero({ networkName = 'Ethereum Sepolia', stats }) {
  // Default mock stats if not provided
  const defaultStats = {
    totalStreams: 1247,
    totalMNEE: 89,
    activeAgents: 156,
    txnsSaved: 45892
  };

  const displayStats = stats || defaultStats;

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
      {/* Background Effects */}
      <ParticleBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-800/50 backdrop-blur-xl p-8 md:p-12 lg:p-16">
          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-primary px-4 py-2 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-flowpay-300 font-medium">x402 Protocol</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60">Live on {networkName}</span>
          </div>

          {/* Main Heading with Typewriter */}
          <div className="max-w-4xl">
            <h1 className="text-display text-4xl md:text-5xl lg:text-6xl">
              <span className="text-gradient-primary">
                <Typewriter text="The Streaming Extension" speed={40} />
              </span>
              <br />
              <span className="text-white">for x402</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/70 leading-relaxed">
              AI agents pay for services with continuous MNEE streams.
              <span className="text-flowpay-400 font-semibold"> One signature, unlimited requests.</span>
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="chip-success">✓ Solving the N+1 Problem</span>
              <span className="chip-primary">2 Txns Only</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              to="/docs"
              className="btn-outline text-lg px-8 py-4 hover-scale inline-flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Read Docs
            </Link>
            <a 
              href="https://github.com/ola-893/flowpay" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-ghost text-lg px-6 py-4"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </span>
            </a>
          </div>

          {/* Floating Metric Cards - Desktop */}
          <div className="hidden lg:flex absolute top-12 right-12 flex-col gap-4">
            <FloatingCard
              icon={ArrowRightLeft}
              label="Streams/sec"
              value="2.4k"
              delay={0}
              color="flowpay"
            />
            <FloatingCard
              icon={Bot}
              label="AI Agents"
              value="156"
              delay={200}
              color="accent"
            />
            <FloatingCard
              icon={Zap}
              label="Gas Saved"
              value="95%"
              delay={400}
              color="success"
            />
          </div>
        </div>

        {/* Statistics Banner */}
        <StatisticsBanner stats={displayStats} />
      </div>
    </section>
  );
}
