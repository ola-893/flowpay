import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Coins } from 'lucide-react';

// Animated Counter for real-time balance
const AnimatedBalance = ({ value, decimals = 6 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const diff = value - prev;
        if (Math.abs(diff) < 0.000001) return value;
        return prev + diff * 0.1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [value]);

  return <span className="font-mono">{displayValue.toFixed(decimals)}</span>;
};

// SVG Progress Ring
const ProgressRing = ({ progress, size = 80, strokeWidth = 6, status = 'active' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colors = {
    active: { stroke: 'url(#activeGradient)', glow: 'rgba(59, 130, 246, 0.3)' },
    low: { stroke: 'url(#warningGradient)', glow: 'rgba(245, 158, 11, 0.3)' },
    expired: { stroke: '#6b7280', glow: 'none' },
  };

  const color = colors[status] || colors.active;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: color.glow !== 'none' ? `drop-shadow(0 0 6px ${color.glow})` : 'none'
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
        <span className="text-[10px] text-white/50">complete</span>
      </div>
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const badges = {
    active: { label: 'Active', Icon: CheckCircle, class: 'chip-success', animate: true },
    low: { label: 'Low Balance', Icon: AlertTriangle, class: 'chip-warning', animate: false },
    expired: { label: 'Completed', Icon: CheckCircle, class: 'chip', animate: false },
    cancelled: { label: 'Cancelled', Icon: XCircle, class: 'chip-error', animate: false },
  };

  const badge = badges[status] || badges.active;
  const IconComponent = badge.Icon;

  return (
    <span className={`${badge.class} flex items-center gap-1`}>
      <IconComponent className={`w-3 h-3 ${badge.animate ? 'animate-pulse' : ''}`} />
      {badge.label}
    </span>
  );
};

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, variant = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass rounded-2xl p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/70">{message}</p>
        <div className="mt-6 flex gap-3">
          <button className="btn-outline flex-1" onClick={onCancel}>Cancel</button>
          <button
            className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StreamCard({ stream, variant, formatEth, onWithdraw, onCancel }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [liveClaimable, setLiveClaimable] = useState(0);

  const nowSec = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, Math.min(nowSec, stream.stopTime) - stream.startTime);
  const duration = Math.max(1, stream.stopTime - stream.startTime);
  const progressPct = Math.min(100, (elapsed / duration) * 100);

  // Determine status
  const getStatus = () => {
    if (!stream.isActive) return progressPct >= 100 ? 'expired' : 'cancelled';
    const remainingPct = 100 - progressPct;
    if (remainingPct < 10) return 'low';
    return 'active';
  };

  const status = getStatus();

  // Real-time claimable balance simulation
  useEffect(() => {
    if (status !== 'active') return;

    const flowRate = parseFloat(formatEth(stream.flowRate)) || 0;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const streamed = Math.min(now - stream.startTime, duration) * flowRate;
      setLiveClaimable(streamed);
    }, 100);

    return () => clearInterval(interval);
  }, [stream, status, formatEth, duration]);

  const handleAction = (action) => {
    setShowConfirm(action);
  };

  const confirmAction = () => {
    if (showConfirm === 'withdraw') onWithdraw?.(stream.id);
    if (showConfirm === 'cancel') onCancel?.(stream.id);
    setShowConfirm(null);
  };

  return (
    <>
      <div className={`
        card-glass relative overflow-hidden p-5 transition-all duration-300
        ${isExpanded ? 'ring-1 ring-flowpay-500/30' : ''}
        ${status === 'active' ? 'hover-lift' : 'opacity-80'}
      `}>
        {/* Background glow */}
        {status === 'active' && (
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-flowpay-500/10 blur-2xl" />
        )}

        {/* Main Content */}
        <div className="relative flex items-start gap-4">
          {/* Progress Ring */}
          <ProgressRing progress={progressPct} status={status} />

          {/* Stream Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-white/60">#{stream.id}</span>
              <StatusBadge status={status} />
            </div>

            <div className="text-sm text-white/60 truncate">
              {variant === 'incoming' ? (
                <span>From: <span className="font-mono text-white/80">{stream.sender?.slice(0, 8)}...{stream.sender?.slice(-6)}</span></span>
              ) : (
                <span>To: <span className="font-mono text-white/80">{stream.recipient?.slice(0, 8)}...{stream.recipient?.slice(-6)}</span></span>
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{formatEth(stream.totalAmount)}</span>
              <span className="text-sm text-white/50">MNEE</span>
            </div>

            <div className="text-xs font-mono text-white/50">
              Rate: {formatEth(stream.flowRate)} MNEE/sec
            </div>
          </div>

          {/* Claimable Balance (for incoming) */}
          {variant === 'incoming' && status === 'active' && (
            <div className="text-right">
              <div className="text-xs text-white/50">Claimable</div>
              <div className="text-lg font-bold text-success-400">
                <AnimatedBalance value={liveClaimable} />
              </div>
              <div className="text-xs text-white/50">MNEE</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            className="text-sm text-white/50 hover:text-white flex items-center gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▲ Less' : '▼ More'}
          </button>

          <div className="flex gap-2">
            {variant === 'incoming' && status === 'active' && (
              <button
                className="btn-success text-sm px-3 py-1.5 flex items-center gap-1"
                onClick={() => handleAction('withdraw')}
              >
                <Coins className="w-4 h-4" /> Withdraw
              </button>
            )}
            {status === 'active' && (
              <button
                className="btn-danger text-sm px-3 py-1.5"
                onClick={() => handleAction('cancel')}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-slide-down">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/50">Start Time</div>
                <div className="font-mono text-white/80">
                  {new Date(stream.startTime * 1000).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-white/50">End Time</div>
                <div className="font-mono text-white/80">
                  {new Date(stream.stopTime * 1000).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-white/50">Elapsed</div>
                <div className="font-mono text-white/80">
                  {Math.floor(elapsed / 3600)}h {Math.floor((elapsed % 3600) / 60)}m
                </div>
              </div>
              <div>
                <div className="text-white/50">Remaining</div>
                <div className="font-mono text-white/80">
                  {Math.floor((duration - elapsed) / 3600)}h {Math.floor(((duration - elapsed) % 3600) / 60)}m
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm !== null}
        title={showConfirm === 'withdraw' ? 'Confirm Withdrawal' : 'Cancel Stream'}
        message={
          showConfirm === 'withdraw'
            ? `Withdraw all claimable funds from Stream #${stream.id}?`
            : `This will permanently cancel Stream #${stream.id}. Remaining funds will be returned.`
        }
        onConfirm={confirmAction}
        onCancel={() => setShowConfirm(null)}
        variant={showConfirm === 'cancel' ? 'danger' : 'primary'}
      />
    </>
  );
}
