import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, User, Bot, Fuel } from 'lucide-react';

// Animated Counter for savings
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const duration = 1500;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutQuad = progress * (2 - progress);
            setDisplayValue(easeOutQuad * value);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [value]);

    return (
        <span className="font-mono">
            {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
        </span>
    );
};

// Bar Chart Component
const BarChart = ({ groups, colors }) => {
    const max = Math.max(...groups.flatMap(g => g.values));

    return (
        <div className="flex flex-col gap-6">
            {groups.map((group, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                        <span>{group.label}</span>
                        <span className="font-mono">{group.values[0].toFixed(2)} vs {group.values[1].toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                        {group.values.map((val, j) => (
                            <div key={j} className="h-4 bg-surface-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${colors[j]}`}
                                    style={{ width: `${(val / max) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex justify-between mt-2 text-[10px] text-white/40 border-t border-white/5 pt-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors[0].split(' ')[0]}`} /> Standard x402
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors[1].split(' ')[0]}`} /> FlowPay
                </div>
            </div>
        </div>
    );
};

// N+1 Visualizer
const NPlusOneVisualizer = () => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setActive(prev => !prev), 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 rounded-2xl glass-darker border border-white/10 overflow-hidden relative min-h-[300px]">
            <div className="absolute top-4 right-4 text-[10px] text-white/40 uppercase tracking-widest">Live Comparison</div>

            <div className="grid grid-cols-2 gap-8 h-full">
                {/* x402 Classic */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="text-xs font-bold text-white/60 uppercase">Traditional N+1</div>
                    <div className="relative w-full flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-surface-600 flex items-center justify-center">
                            <User className="w-6 h-6 text-white/80" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute h-0.5 bg-error-500/50 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
                                    style={{
                                        width: '60px',
                                        left: '50%',
                                        transform: `rotate(${i * 72}deg) translateX(30px)`,
                                        transformOrigin: 'left center'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-8 h-8 rounded-lg bg-surface-700/50 flex items-center justify-center text-xs animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}>
                                TX
                            </div>
                        ))}
                    </div>
                    <div className="text-[10px] text-error-400 font-mono">5 Requests = 5 Transactions</div>
                </div>

                {/* FlowPay */}
                <div className="flex flex-col items-center justify-center space-y-6 border-l border-white/5 pl-8">
                    <div className="text-xs font-bold text-flowpay-400 uppercase">FlowPay Solution</div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-flowpay-500 flex items-center justify-center shadow-glow">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -inset-4 rounded-2xl border border-flowpay-500/30 animate-pulse-glow" />
                    </div>
                    <div className="w-full h-8 bg-surface-700 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-stream-flow opacity-20" />
                        <div className="text-[10px] font-mono text-flowpay-300 z-10">MNEE STREAM ACTIVE</div>
                    </div>
                    <div className="flex gap-1 justify-center">
                        <div className="w-8 h-8 rounded-lg bg-success-500/50 flex items-center justify-center text-xs font-bold">1</div>
                        <div className="text-xs text-white/40 flex items-center italic">∞ requests</div>
                    </div>
                    <div className="text-[10px] text-success-400 font-mono">5 Requests = 0 Transactions</div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-center">
                <div className="text-sm text-white/80">
                    Reduced signature overhead by <span className="text-success-400 font-bold">98%</span>
                </div>
            </div>
        </div>
    );
};

// Main Component
export function EfficiencyMetrics({ metrics }) {
    const [timeframe, setTimeframe] = useState('7d');

    // Example dummy data for charts
    const performanceData = useMemo(() => ({
        throughput: [12, 15, 18, 14, 22, 28, 25],
        latency: [150, 142, 138, 145, 128, 122, 118],
        successRate: 99.98
    }), []);

    const gasComparison = {
        labels: ['Cost per 1k Requests (USD)'],
        groups: [
            { label: 'Gas Consumption', values: [14.50, 0.25] }
        ]
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Efficiency & Performance
                </h2>
                <div className="flex gap-2">
                    {['24h', '7d', '30d'].map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded-lg text-xs transition-all ${timeframe === tf ? 'bg-flowpay-500 text-white' : 'glass text-white/60 hover:text-white'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* N+1 Solution Showcase */}
                <div className="space-y-4">
                    <NPlusOneVisualizer />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="card-glass p-4 text-center">
                            <div className="text-2xl font-bold text-success-400">
                                <AnimatedCounter value={45892} />
                            </div>
                            <div className="text-[10px] text-white/50 uppercase">Transactions Saved</div>
                        </div>
                        <div className="card-glass p-4 text-center">
                            <div className="text-2xl font-bold text-flowpay-400">
                                <AnimatedCounter value={9234.50} prefix="$" decimals={2} />
                            </div>
                            <div className="text-[10px] text-white/50 uppercase">Gas Fees Saved</div>
                        </div>
                    </div>
                </div>

                {/* Performance & Performance Charts */}
                <div className="space-y-6">
                    <div className="card-glass p-6">
                        <h3 className="text-sm font-semibold text-white/80 mb-6 flex items-center gap-2">
                            <Fuel className="w-4 h-4" /> Gas Cost Comparison
                        </h3>
                        <BarChart
                            groups={gasComparison.groups}
                            colors={['bg-error-500 shadow-glow-error', 'bg-success-500 shadow-glow-success']}
                        />
                        <p className="mt-4 text-[10px] text-white/40 italic">
                            Estimated based on Ethereum Sepolia current gas prices and x402 contract overhead.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="card-glass p-5">
                            <div className="text-xs text-white/50 mb-1">Success Rate</div>
                            <div className="flex items-end gap-2">
                                <div className="text-xl font-bold text-success-400">{performanceData.successRate}%</div>
                                <div className="text-[10px] text-success-400 mb-1">+0.02%</div>
                            </div>
                            <div className="mt-4 h-1 w-full bg-surface-700 rounded-full overflow-hidden">
                                <div className="h-full bg-success-500" style={{ width: '99%' }} />
                            </div>
                        </div>

                        <div className="card-glass p-5">
                            <div className="text-xs text-white/50 mb-1">Avg Latency</div>
                            <div className="flex items-end gap-2">
                                <div className="text-xl font-bold text-white">118ms</div>
                                <div className="text-[10px] text-success-400 mb-1">-15%</div>
                            </div>
                            <div className="mt-4 flex gap-1 items-end h-8">
                                {performanceData.latency.map((val, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-flowpay-400/30 rounded-t"
                                        style={{ height: `${(val / 150) * 100}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card-glass p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-white/80">Request Throughput</h3>
                            <div className="text-[10px] text-white/40 font-mono">req/sec</div>
                        </div>
                        <div className="relative h-24 w-full flex items-end gap-2 px-1">
                            {performanceData.throughput.map((val, i) => (
                                <div key={i} className="flex-1 relative group">
                                    <div
                                        className="w-full bg-gradient-to-t from-flowpay-600 to-accent-500 rounded-t-lg transition-all duration-500 group-hover:opacity-100 opacity-70"
                                        style={{ height: `${(val / 30) * 100}%` }}
                                    />
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {val}
                                    </div>
                                </div>
                            ))}
                            {/* Label lines */}
                            <div className="absolute inset-0 border-b border-white/10 pointer-events-none" />
                            <div className="absolute bottom-1/2 left-0 right-0 border-b border-white/5 border-dashed pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
