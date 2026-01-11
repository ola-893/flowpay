import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ethers } from 'ethers';
import { CheckCircle, AlertTriangle, AlertOctagon, Square, Waves } from 'lucide-react';

// Animated Particle Flow
const ParticleFlow = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-flowpay-400/60 rounded-full"
                    style={{
                        left: `${10 + i * 20}%`,
                        animation: `stream-flow ${1.5 + i * 0.2}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Smooth Counter Animation
const AnimatedCounter = ({ value, decimals = 6 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const prevValue = useRef(value);

    useEffect(() => {
        const animate = () => {
            setDisplayValue(prev => {
                const diff = value - prev;
                if (Math.abs(diff) < 0.000001) return value;
                return prev + diff * 0.15;
            });
        };
        const interval = setInterval(animate, 50);
        prevValue.current = value;
        return () => clearInterval(interval);
    }, [value]);

    return (
        <span className="font-mono tabular-nums">
            {displayValue.toFixed(decimals)}
        </span>
    );
};

// Sparkline Mini-Chart
const Sparkline = ({ data, color = '#3b82f6', height = 30 }) => {
    const points = useMemo(() => {
        if (!data?.length) return '';
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');
    }, [data, height]);

    if (!data?.length) return null;

    return (
        <svg width="100%" height={height} className="overflow-visible">
            <defs>
                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Fill area */}
            <polyline
                points={`0,${height} ${points} 100,${height}`}
                fill="url(#sparkGradient)"
            />
        </svg>
    );
};

// Countdown Timer
const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const update = () => {
            const remaining = Math.max(0, endTime * 1000 - Date.now());
            setTimeLeft(remaining);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    if (timeLeft <= 0) {
        return <span className="text-white/50">Completed</span>;
    }

    return (
        <span className="font-mono">
            {hours.toString().padStart(2, '0')}:
            {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
        </span>
    );
};

// Health Status Badge
const HealthBadge = ({ status }) => {
    const configs = {
        healthy: { label: 'Healthy', Icon: CheckCircle, class: 'chip-success', animate: true },
        low: { label: 'Low Balance', Icon: AlertTriangle, class: 'chip-warning', animate: false },
        critical: { label: 'Critical', Icon: AlertOctagon, class: 'chip-error', animate: true },
        offline: { label: 'Offline', Icon: Square, class: 'chip', animate: false },
    };

    const config = configs[status] || configs.healthy;
    const IconComponent = config.Icon;

    return (
        <span className={`${config.class} flex items-center gap-1`}>
            <IconComponent className={`w-3 h-3 ${config.animate ? 'animate-pulse' : ''}`} />
            {config.label}
        </span>
    );
};

// Auto-Renewal Status
const AutoRenewalStatus = ({ enabled, nextRenewal }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-success-500' : 'bg-white/30'}`} />
        <span className="text-white/60">Auto-renew:</span>
        <span className={enabled ? 'text-success-400' : 'text-white/40'}>
            {enabled ? 'On' : 'Off'}
        </span>
    </div>
);

// Connection Status
const ConnectionStatus = ({ isConnected, onRetry }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500 animate-pulse' : 'bg-error-500'}`} />
        <span className="text-xs text-white/60">
            {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {!isConnected && (
            <button onClick={onRetry} className="text-xs text-flowpay-400 hover:text-flowpay-300">
                Retry
            </button>
        )}
    </div>
);

// Stream Card Component
const StreamCard = ({ stream, now }) => {
    const [rateHistory, setRateHistory] = useState([]);

    // Calculate claimable balance
    const claimable = useMemo(() => {
        const startTimeMs = Number(stream.startTime) * 1000;
        if (now <= startTimeMs) return 0;
        const elapsedSeconds = (now - startTimeMs) / 1000;
        try {
            const total = BigInt(stream.rate) * BigInt(Math.floor(elapsedSeconds));
            return parseFloat(ethers.formatEther(total));
        } catch {
            return 0;
        }
    }, [stream, now]);

    // Track rate history for sparkline
    useEffect(() => {
        setRateHistory(prev => {
            const newHistory = [...prev, claimable];
            return newHistory.slice(-20); // Keep last 20 data points
        });
    }, [claimable]);

    // Determine health status
    const healthStatus = useMemo(() => {
        const totalAmount = parseFloat(ethers.formatEther(stream.amount || 0));
        const usedPct = totalAmount > 0 ? (claimable / totalAmount) * 100 : 0;
        if (usedPct > 90) return 'critical';
        if (usedPct > 75) return 'low';
        return 'healthy';
    }, [claimable, stream.amount]);

    const rate = stream.rate ? parseFloat(ethers.formatEther(stream.rate)) : 0;
    const totalAmount = stream.amount ? parseFloat(ethers.formatEther(stream.amount)) : 0;
    const endTime = stream.startTime + (totalAmount / rate) || 0;

    return (
        <div className={`
      relative p-5 rounded-xl border transition-all duration-300
      ${healthStatus === 'critical' ? 'glass border-error-500/50 shadow-glow-error' :
                healthStatus === 'low' ? 'glass border-warning-500/30' :
                    'glass-primary border-flowpay-500/30'}
    `}>
            {/* Particle Flow Animation */}
            <ParticleFlow isActive={healthStatus !== 'critical'} />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-flowpay-400">#{stream.streamId}</span>
                        <HealthBadge status={healthStatus} />
                    </div>
                    <div className="text-lg font-bold text-white">{stream.agentId || 'Agent Stream'}</div>
                </div>
                <ConnectionStatus isConnected={true} onRetry={() => { }} />
            </div>

            {/* Main Balance Display */}
            <div className="mb-4">
                <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Claimable Balance</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gradient-primary">
                        <AnimatedCounter value={claimable} decimals={6} />
                    </span>
                    <span className="text-lg text-white/40">MNEE</span>
                </div>
            </div>

            {/* Rate with Sparkline */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="text-xs text-white/50 mb-1">Flow Rate</div>
                    <div className="font-mono text-lg text-white">
                        {rate.toFixed(8)}<span className="text-white/40">/sec</span>
                    </div>
                </div>
                <div>
                    <div className="text-xs text-white/50 mb-1">Rate Trend</div>
                    <Sparkline data={rateHistory} color="#3b82f6" height={24} />
                </div>
            </div>

            {/* Duration Countdown */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-700/50 mb-4">
                <div className="text-xs text-white/50">Time Remaining</div>
                <div className="text-lg font-bold text-white">
                    <CountdownTimer endTime={endTime} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <AutoRenewalStatus enabled={stream.autoRenew} />
                <div className="text-xs text-white/40">
                    Total: {totalAmount.toFixed(4)} MNEE
                </div>
            </div>
        </div>
    );
};

// Empty State
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <Waves className="w-16 h-16 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white/80">No Active Streams</h3>
        <p className="text-sm text-white/50 mt-1">Create a stream to start monitoring</p>
    </div>
);

export function StreamMonitor({ activeStreams }) {
    const [now, setNow] = useState(Date.now());
    const [isConnected, setIsConnected] = useState(true);

    // High-frequency update for smooth animations
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    // Connection simulation
    useEffect(() => {
        const checkConnection = () => {
            // Simulate connection check
            setIsConnected(Math.random() > 0.05);
        };
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!activeStreams || activeStreams.length === 0) {
        return (
            <div className="card-glass p-6 h-full">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Waves className="w-5 h-5" /> Stream Monitor
                </h2>
                <EmptyState />
            </div>
        );
    }

    return (
        <div className="card-glass p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Waves className="w-5 h-5" /> Stream Monitor
                    <span className="chip-primary">{activeStreams.length} active</span>
                </h2>
                <ConnectionStatus isConnected={isConnected} onRetry={() => setIsConnected(true)} />
            </div>

            {/* Stream Grid */}
            <div className="grid gap-4">
                {activeStreams.map((stream) => (
                    <StreamCard key={stream.streamId} stream={stream} now={now} />
                ))}
            </div>

            {/* Connection Error Banner */}
            {!isConnected && (
                <div className="mt-4 p-4 rounded-xl bg-error-500/10 border border-error-500/30 flex items-center gap-3 animate-fade-in">
                    <AlertTriangle className="w-6 h-6 text-warning-400" />
                    <div>
                        <div className="font-semibold text-error-400">Connection Lost</div>
                        <div className="text-sm text-white/60">Retrying connection automatically...</div>
                    </div>
                    <button
                        onClick={() => setIsConnected(true)}
                        className="ml-auto btn-outline text-sm"
                    >
                        Retry Now
                    </button>
                </div>
            )}
        </div>
    );
}
