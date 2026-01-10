import React, { useState, useMemo } from 'react';

// Agent Avatar Component
const AgentAvatar = ({ agentId, status }) => {
    const statusColors = {
        active: 'bg-success-500',
        paused: 'bg-warning-500',
        error: 'bg-error-500',
    };

    const initial = agentId?.charAt(0)?.toUpperCase() || 'A';

    return (
        <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flowpay-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                {initial}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${statusColors[status]} border-2 border-surface-800 ${status === 'active' ? 'animate-pulse' : ''}`} />
        </div>
    );
};

// Quick Stat Card
const StatCard = ({ icon, label, value, trend, color = 'flowpay' }) => {
    const colorClasses = {
        flowpay: 'text-flowpay-400',
        accent: 'text-accent-400',
        success: 'text-success-400',
        warning: 'text-warning-400',
    };

    return (
        <div className="p-4 rounded-xl glass hover-lift">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{icon}</span>
                {trend && (
                    <span className={`text-xs ${trend > 0 ? 'text-success-400' : 'text-error-400'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
            <div className="text-xs text-white/50">{label}</div>
        </div>
    );
};

// Budget Gauge Component
const BudgetGauge = ({ spent, limit, label }) => {
    const percentage = Math.min((spent / limit) * 100, 100);
    const isWarning = percentage > 75;
    const isCritical = percentage > 90;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-white/60">{label}</span>
                <span className={`font-mono ${isCritical ? 'text-error-400' : isWarning ? 'text-warning-400' : 'text-white'}`}>
                    {spent.toFixed(2)} / {limit} MNEE
                </span>
            </div>
            <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-error-gradient' : isWarning ? 'bg-warning-gradient' : 'bg-flowpay-gradient'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs text-white/40 text-right">{percentage.toFixed(1)}% used</div>
        </div>
    );
};

// API Key Display
const ApiKeyDisplay = ({ apiKey, onRegenerate }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm text-white/60">API Key</label>
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-700 border border-white/10 font-mono text-sm">
                    <span className="text-white/80 truncate">
                        {isVisible ? apiKey : '••••••••••••••••••••••••••••••••'}
                    </span>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-white/40 hover:text-white"
                    >
                        {isVisible ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                <button
                    onClick={handleCopy}
                    className={`btn-outline px-3 ${copied ? 'text-success-400 border-success-400' : ''}`}
                >
                    {copied ? '✓' : '📋'}
                </button>
                <button
                    onClick={onRegenerate}
                    className="btn-outline px-3"
                    title="Regenerate Key"
                >
                    🔄
                </button>
            </div>
        </div>
    );
};

// Spending Limits Config
const SpendingLimitsConfig = ({ limits, onChange }) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {['daily', 'weekly', 'monthly'].map(period => (
                <div key={period} className="space-y-1">
                    <label className="text-xs text-white/60 capitalize">{period} Limit</label>
                    <input
                        type="number"
                        value={limits[period] || ''}
                        onChange={(e) => onChange({ ...limits, [period]: e.target.value })}
                        className="input-default py-2 text-sm"
                        placeholder="0"
                    />
                </div>
            ))}
        </div>
    );
};

// Alert Threshold Settings
const AlertThresholds = ({ thresholds, onChange }) => {
    return (
        <div className="space-y-3">
            <div className="text-sm text-white/60">Alert Thresholds</div>
            <div className="flex gap-4">
                {[50, 75, 90].map(pct => (
                    <label key={pct} className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={thresholds.includes(pct)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    onChange([...thresholds, pct].sort((a, b) => a - b));
                                } else {
                                    onChange(thresholds.filter(t => t !== pct));
                                }
                            }}
                            className="rounded border-white/20 bg-white/5 text-flowpay-500 focus:ring-flowpay-500/50"
                        />
                        <span className="text-white/70">{pct}%</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

// Recent Alerts Panel
const RecentAlerts = ({ alerts }) => {
    if (!alerts?.length) {
        return (
            <div className="text-center py-6 text-white/40 text-sm">
                ✅ No recent alerts
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-40 overflow-auto">
            {alerts.map((alert, i) => (
                <div key={i} className={`
          p-3 rounded-lg text-sm flex items-start gap-2
          ${alert.type === 'error' ? 'bg-error-500/10 border border-error-500/20' :
                        alert.type === 'warning' ? 'bg-warning-500/10 border border-warning-500/20' :
                            'bg-white/5 border border-white/10'}
        `}>
                    <span>{alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <div>
                        <div className="text-white/80">{alert.message}</div>
                        <div className="text-xs text-white/40 mt-1">{alert.time}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Emergency Stop Modal
const EmergencyModal = ({ isOpen, onConfirm, onCancel, action }) => {
    const [checklist, setChecklist] = useState({});

    const safetyItems = action === 'resume' ? [
        'I have reviewed the recent alerts',
        'Spending limits are configured correctly',
        'System health checks have passed',
    ] : [];

    const allChecked = safetyItems.every(item => checklist[item]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md glass rounded-2xl p-6 animate-scale-in">
                <h3 className={`text-xl font-bold ${action === 'stop' ? 'text-error-400' : 'text-success-400'}`}>
                    {action === 'stop' ? '🚨 Emergency Stop' : '▶️ Resume System'}
                </h3>

                <p className="mt-3 text-sm text-white/70">
                    {action === 'stop'
                        ? 'This will immediately halt all agent operations. Active streams will continue but no new payments will be initiated.'
                        : 'Before resuming, please confirm the following safety checks:'}
                </p>

                {action === 'resume' && (
                    <div className="mt-4 space-y-2">
                        {safetyItems.map(item => (
                            <label key={item} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                <input
                                    type="checkbox"
                                    checked={checklist[item] || false}
                                    onChange={(e) => setChecklist({ ...checklist, [item]: e.target.checked })}
                                    className="rounded border-white/20 bg-white/5 text-success-500 focus:ring-success-500/50"
                                />
                                <span className="text-sm text-white/80">{item}</span>
                            </label>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button className="btn-outline flex-1" onClick={onCancel}>Cancel</button>
                    <button
                        className={`flex-1 ${action === 'stop' ? 'btn-danger' : 'btn-success'}`}
                        onClick={onConfirm}
                        disabled={action === 'resume' && !allChecked}
                    >
                        {action === 'stop' ? 'STOP NOW' : 'Resume'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// System Health Indicator
const SystemHealth = ({ status }) => {
    const checks = [
        { name: 'SDK Connection', status: 'ok' },
        { name: 'Wallet Balance', status: 'ok' },
        { name: 'Contract Access', status: 'ok' },
        { name: 'Network Status', status: status === 'error' ? 'error' : 'ok' },
    ];

    const overallStatus = checks.every(c => c.status === 'ok') ? 'healthy' : 'degraded';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">System Health</span>
                <span className={`chip-${overallStatus === 'healthy' ? 'success' : 'warning'}`}>
                    {overallStatus === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {checks.map(check => (
                    <div key={check.name} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${check.status === 'ok' ? 'bg-success-500' : 'bg-error-500'}`} />
                        <span className="text-white/60">{check.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function AgentConsole({ config, setConfig, isPaused, setIsPaused, sdk }) {
    const [agentIdInput, setAgentIdInput] = useState(config.agentId || "Dashboard-Agent");
    const [limits, setLimits] = useState({ daily: '100', weekly: '500', monthly: '2000' });
    const [thresholds, setThresholds] = useState([75, 90]);
    const [showModal, setShowModal] = useState(null);
    const [apiKey] = useState('fp_sk_' + Math.random().toString(36).substr(2, 32));

    // Mock spending data
    const spending = useMemo(() => ({
        daily: 45.32,
        weekly: 234.56,
        monthly: 892.10,
        requests: 1247,
        streams: 23,
    }), []);

    const alerts = [
        { type: 'warning', message: '75% of daily limit reached', time: '2 mins ago' },
        { type: 'info', message: 'Stream #42 completed successfully', time: '15 mins ago' },
    ];

    const status = isPaused ? 'paused' : 'active';

    const handleSave = () => {
        setConfig({
            ...config,
            agentId: agentIdInput,
            spendingLimits: limits,
        });
    };

    const handleEmergencyAction = (action) => {
        setShowModal(action);
    };

    const confirmAction = () => {
        if (showModal === 'stop') {
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
        setShowModal(null);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="card-glass p-6">
                    <div className="flex items-start gap-4">
                        <AgentAvatar agentId={agentIdInput} status={status} />

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={agentIdInput}
                                    onChange={(e) => setAgentIdInput(e.target.value)}
                                    className="bg-transparent text-xl font-bold text-white border-none focus:outline-none focus:ring-0 p-0"
                                    placeholder="Agent Name"
                                />
                                <span className={`chip-${status === 'active' ? 'success' : 'warning'}`}>
                                    {status === 'active' ? '● Active' : '⏸ Paused'}
                                </span>
                            </div>
                            <div className="text-sm text-white/50 mt-1">SDK Version 1.0.0 • FlowPay Agent</div>
                        </div>

                        <button onClick={handleSave} className="btn-outline">
                            💾 Save
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        <StatCard icon="💰" label="Daily Spend" value={`$${spending.daily}`} trend={-12} color="flowpay" />
                        <StatCard icon="💸" label="Active Streams" value={spending.streams} trend={8} color="accent" />
                        <StatCard icon="📨" label="Total Requests" value={spending.requests.toLocaleString()} color="success" />
                        <StatCard icon="⚡" label="Avg Response" value="142ms" color="warning" />
                    </div>

                    {/* API Key */}
                    <div className="mt-6">
                        <ApiKeyDisplay apiKey={apiKey} onRegenerate={() => { }} />
                    </div>
                </div>

                {/* Spending Limits Section */}
                <div className="card-glass p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        📊 Spending Limits
                    </h3>

                    {/* Budget Gauges */}
                    <div className="space-y-4">
                        <BudgetGauge spent={spending.daily} limit={parseFloat(limits.daily) || 100} label="Daily Budget" />
                        <BudgetGauge spent={spending.weekly} limit={parseFloat(limits.weekly) || 500} label="Weekly Budget" />
                        <BudgetGauge spent={spending.monthly} limit={parseFloat(limits.monthly) || 2000} label="Monthly Budget" />
                    </div>

                    {/* Limit Configuration */}
                    <SpendingLimitsConfig limits={limits} onChange={setLimits} />

                    {/* Alert Thresholds */}
                    <AlertThresholds thresholds={thresholds} onChange={setThresholds} />
                </div>

                {/* Emergency Controls Section */}
                <div className={`card-glass p-6 ${isPaused ? 'border-warning-500/50' : ''}`}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        🛡️ System Controls
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Health & Alerts */}
                        <div className="space-y-4">
                            <SystemHealth status={status} />
                            <div>
                                <div className="text-sm text-white/60 mb-2">Recent Alerts</div>
                                <RecentAlerts alerts={alerts} />
                            </div>
                        </div>

                        {/* Right: Emergency Button */}
                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-800/50">
                            {isPaused ? (
                                <>
                                    <div className="text-warning-400 text-lg font-bold mb-4 animate-pulse">
                                        ⏸ SYSTEM PAUSED
                                    </div>
                                    <button
                                        onClick={() => handleEmergencyAction('resume')}
                                        className="btn-success text-lg px-8 py-4 shadow-glow-success"
                                    >
                                        ▶️ RESUME SYSTEM
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-success-400 text-lg font-bold mb-4">
                                        ✓ System Active
                                    </div>
                                    <button
                                        onClick={() => handleEmergencyAction('stop')}
                                        className="btn-danger text-lg px-8 py-4 shadow-glow-error animate-pulse"
                                    >
                                        🚨 EMERGENCY STOP
                                    </button>
                                </>
                            )}
                            <div className="text-xs text-white/40 mt-4 text-center">
                                {isPaused
                                    ? 'Complete safety checklist to resume'
                                    : 'Immediately halts all agent operations'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Modal */}
            <EmergencyModal
                isOpen={showModal !== null}
                action={showModal}
                onConfirm={confirmAction}
                onCancel={() => setShowModal(null)}
            />
        </>
    );
}
