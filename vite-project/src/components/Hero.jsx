export default function Hero({ networkName = 'Morph Holesky' }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg sm:p-12">
        <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-hero opacity-20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-hero opacity-10 blur-2xl" />
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
          Live on {networkName}
        </div>
        <div className="max-w-3xl">
          <h2 className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-5xl">
            MorphStream
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            Real-time money streaming on Morph. Create programmable flows of ETH per second with a single transaction.
          </p>
        </div>
      </div>
    </section>
  );
}


