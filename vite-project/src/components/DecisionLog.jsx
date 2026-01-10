import React, { useState, useMemo } from 'react';

// Decision Timeline Entry
const TimelineEntry = ({ log, isLast, onExpand, isExpanded }) => {
    const isStream = log.mode === 'stream';
    const time = new Date(log.timestamp);

    return (
        <div className="relative pl-8 pb-6 animate-fade-in">
            {/* Timeline connector */}
            {!isLast && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
            )}

            {/* Timeline dot */}
            <div className={`
        absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center
        ${isStream ? 'bg-flowpay-500/20 border-2 border-flowpay-500' : 'bg-success-500/20 border-2 border-success-500'}
        ${log.isNew ? 'animate-pulse' : ''}
      `}>
                <span className="text-xs">{isStream ? '🌊' : '⚡'}</span>
            </div>

            {/* Content Card */}
            <div
                className={`
          p-4 rounded-xl cursor-pointer transition-all duration-300
          ${isStream ? 'glass-primary border-flowpay-500/20' : 'glass border-success-500/20'}
          ${isExpanded ? 'ring-1 ring-white/20' : 'hover:bg-white/5'}
        `}
                onClick={onExpand}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold text-sm uppercase tracking-wide ${isStream ? 'text-flowpay-400' : 'text-success-400'}`}>
                        {isStream ? '🌊 Streaming Mode' : '⚡ Direct Payment'}
                    </span>
                    <span className="text-xs text-white/40">{time.toLocaleTimeString()}</span>
                </div>

                {/* AI Reasoning */}
                <div className="text-sm text-white/80 leading-relaxed">
                    "{log.reasoning}"
                </div>

                {/* Meta Info */}
                <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                        <span>📨</span> {log.volume} requests
                    </span>
                    {log.confidence && (
                        <span className="flex items-center gap-1">
                            <span>🎯</span> {Math.round(log.confidence * 100)}% confidence
                        </span>
                    )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-slide-down space-y-3">
                        {/* Cost Comparison */}
                        <div className="text-sm">
                            <div className="text-white/60 mb-2">Cost Comparison</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`p-3 rounded-lg ${isStream ? 'bg-flowpay-500/10' : 'bg-white/5'}`}>
                                    <div className="text-xs text-white/50">Streaming Cost</div>
                                    <div className={`font-mono font-bold ${isStream ? 'text-flowpay-300' : 'text-white/70'}`}>
                                        ${log.streamCost?.toFixed(4) || '0.0012'}
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${!isStream ? 'bg-success-500/10' : 'bg-white/5'}`}>
                                    <div className="text-xs text-white/50">Direct Cost</div>
                                    <div className={`font-mono font-bold ${!isStream ? 'text-success-300' : 'text-white/70'}`}>
                                        ${log.directCost?.toFixed(4) || '0.0089'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Savings */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-success-500/10">
                            <span className="text-success-400">💰</span>
                            <span className="text-sm text-success-300">
                                Saved ${log.savings?.toFixed(4) || '0.0077'} with {isStream ? 'streaming' : 'direct'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Pie Chart (SVG)
const PieChart = ({ streamCount, directCount }) => {
    const total = streamCount + directCount;
    const streamPct = total > 0 ? (streamCount / total) * 100 : 50;
    const directPct = 100 - streamPct;

    // Calculate SVG arc
    const streamAngle = (streamPct / 100) * 360;
    const largeArc = streamAngle > 180 ? 1 : 0;
    const radians = (streamAngle - 90) * (Math.PI / 180);
    const x = 50 + 40 * Math.cos(radians);
    const y = 50 + 40 * Math.sin(radians);

    return (
        <div className="flex items-center gap-4">
            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" />
                {streamPct > 0 && streamPct < 100 && (
                    <path
                        d={`M 50 10 A 40 40 0 ${largeArc} 1 ${x} ${y}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                    />
                )}
                {streamPct >= 100 && (
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" />
                )}
            </svg>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-flowpay-500" />
                    <span className="text-sm text-white/70">Streaming ({streamPct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                    <span className="text-sm text-white/70">Direct ({directPct.toFixed(0)}%)</span>
                </div>
            </div>
        </div>
    );
};

// Date Range Filter
const DateRangeFilter = ({ value, onChange }) => {
    const options = [
        { label: 'Last Hour', value: 'hour' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'All Time', value: 'all' },
    ];

    return (
        <div className="flex gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${value === opt.value
                            ? 'bg-flowpay-500/20 text-flowpay-300 border border-flowpay-500/30'
                            : 'text-white/50 hover:bg-white/5'}
          `}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

// Analytics Summary Card
const AnalyticsSummary = ({ logs }) => {
    const stats = useMemo(() => {
        const streamLogs = logs.filter(l => l.mode === 'stream');
        const directLogs = logs.filter(l => l.mode === 'direct');
        const totalSavings = logs.reduce((sum, l) => sum + (l.savings || 0.0077), 0);
        const avgConfidence = logs.reduce((sum, l) => sum + (l.confidence || 0.85), 0) / (logs.length || 1);

        return {
            streamCount: streamLogs.length,
            directCount: directLogs.length,
            totalSavings,
            avgConfidence,
        };
    }, [logs]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl glass text-center">
                <div className="text-2xl font-bold text-flowpay-400">{stats.streamCount}</div>
                <div className="text-xs text-white/50">Streaming Decisions</div>
            </div>
            <div className="p-4 rounded-xl glass text-center">
                <div className="text-2xl font-bold text-success-400">{stats.directCount}</div>
                <div className="text-xs text-white/50">Direct Decisions</div>
            </div>
            <div className="p-4 rounded-xl glass text-center">
                <div className="text-2xl font-bold text-warning-400">${stats.totalSavings.toFixed(4)}</div>
                <div className="text-xs text-white/50">Total Savings</div>
            </div>
            <div className="p-4 rounded-xl glass text-center">
                <div className="text-2xl font-bold text-accent-400">{Math.round(stats.avgConfidence * 100)}%</div>
                <div className="text-xs text-white/50">Avg Confidence</div>
            </div>
        </div>
    );
};

// Confidence Indicator
const ConfidenceBar = ({ value }) => {
    const pct = Math.round(value * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-success-500' : pct > 50 ? 'bg-warning-500' : 'bg-error-500'
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-mono text-white/60">{pct}%</span>
        </div>
    );
};

export function DecisionLog({ logs }) {
    const [expandedId, setExpandedId] = useState(null);
    const [dateRange, setDateRange] = useState('all');
    const [showAnalytics, setShowAnalytics] = useState(true);

    // Filter logs by date range
    const filteredLogs = useMemo(() => {
        if (dateRange === 'all') return logs;

        const now = Date.now();
        const ranges = {
            hour: 60 * 60 * 1000,
            today: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
        };

        return logs.filter(l => now - l.timestamp < (ranges[dateRange] || Infinity));
    }, [logs, dateRange]);

    // Stats for pie chart
    const streamCount = filteredLogs.filter(l => l.mode === 'stream').length;
    const directCount = filteredLogs.filter(l => l.mode === 'direct').length;

    if (!logs || logs.length === 0) {
        return (
            <div className="card-glass p-6 h-full">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    🤖 AI Decision Log
                </h2>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-5xl mb-4 animate-float">🧠</div>
                    <div className="text-white/50">No decisions recorded yet</div>
                    <div className="text-xs text-white/30 mt-1">AI decisions will appear here</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-glass p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    🤖 AI Decision Log
                    <span className="chip-primary">{filteredLogs.length}</span>
                </h2>
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="btn-ghost text-sm"
                >
                    {showAnalytics ? '📊 Hide Stats' : '📊 Show Stats'}
                </button>
            </div>

            {/* Analytics Section */}
            {showAnalytics && (
                <div className="mb-6 animate-fade-in">
                    <AnalyticsSummary logs={filteredLogs} />

                    <div className="flex items-center justify-between p-4 rounded-xl glass">
                        <PieChart streamCount={streamCount} directCount={directCount} />
                        <div className="text-right">
                            <div className="text-sm text-white/60 mb-1">AI Confidence</div>
                            <div className="w-32">
                                <ConfidenceBar value={0.87} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Filter */}
            <div className="mb-4">
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filteredLogs.slice().reverse().map((log, i, arr) => (
                    <TimelineEntry
                        key={log.timestamp}
                        log={log}
                        isLast={i === arr.length - 1}
                        isExpanded={expandedId === log.timestamp}
                        onExpand={() => setExpandedId(expandedId === log.timestamp ? null : log.timestamp)}
                    />
                ))}
            </div>
        </div>
    );
}
