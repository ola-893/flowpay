export default function StreamCard({ stream, variant, formatEth, onWithdraw, onCancel }) {
  const nowSec = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, Math.min(nowSec, stream.stopTime) - stream.startTime);
  const duration = Math.max(1, stream.stopTime - stream.startTime);
  const progressPct = Math.min(100, (elapsed / duration) * 100);

  return (
    <div className={`card-glass relative overflow-hidden p-4 ${stream.isActive ? '' : 'opacity-70'} `} role="region" aria-label={`Stream ${stream.id}`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-hero opacity-10 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-white/60">ID #{stream.id}</div>
          {variant === 'incoming' ? (
            <div className="text-sm text-white/60">from {stream.sender.slice(0, 6)}...{stream.sender.slice(-4)}</div>
          ) : (
            <div className="text-sm text-white/60">to {stream.recipient.slice(0, 6)}...{stream.recipient.slice(-4)}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{formatEth(stream.totalAmount)} ETH</div>
          <div className="font-mono text-xs text-white/60">{formatEth(stream.flowRate)} ETH/s</div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${progressPct}%` }} />
      </div>

      {variant === 'incoming' && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-white/60">Claimable</div>
          <div className="font-mono text-sm font-semibold text-cyan-300">{formatEth(stream.claimableInitial)} ETH</div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {variant === 'incoming' && (
          <button
            className="btn-default"
            onClick={() => onWithdraw?.(stream.id)}
            disabled={!stream.isActive}
          >
            Withdraw
          </button>
        )}
        <button
          className="btn-danger"
          onClick={() => onCancel?.(stream.id)}
          disabled={!stream.isActive}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


