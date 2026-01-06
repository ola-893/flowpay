export default function Header({ walletAddress, chainId, networkName, onConnect }) {
  return (
    <header className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 shadow-glow" />
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-200 bg-clip-text text-transparent">
                MorphStream
              </span>
            </h1>
            <p className="-mt-0.5 text-xs text-white/60" aria-live="polite">Real-time money streaming on {networkName || 'Morph'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <>
              <span className="chip">{chainId ? `Chain: ${chainId}` : '...'}</span>
              <span className="chip">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </>
          ) : (
            <button className="btn-primary" onClick={onConnect}>Connect Wallet</button>
          )}
        </div>
      </div>
    </header>
  );
}


