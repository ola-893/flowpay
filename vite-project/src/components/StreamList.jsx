import StreamCard from './StreamCard.jsx';

export default function StreamList({ title, emptyText, isLoading, streams, variant, formatEth, onWithdraw, onCancel }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white/90">{title}</h3>
        {isLoading && <div className="text-xs text-white/50">Loading...</div>}
      </div>
      {!isLoading && streams.length === 0 && (
        <div className="text-sm text-white/60">{emptyText}</div>
      )}
      <div className="grid gap-3">
        {streams.map((s) => (
          <StreamCard
            key={`${variant}-${s.id}`}
            stream={s}
            variant={variant}
            formatEth={formatEth}
            onWithdraw={onWithdraw}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}


