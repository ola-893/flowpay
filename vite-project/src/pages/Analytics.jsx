import { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { EfficiencyMetrics } from '../components/EfficiencyMetrics';
import { ServiceGraph } from '../components/ServiceGraph';
import { ErrorBoundary } from '../components/ui';

export default function Analytics() {
  const { walletAddress, outgoingStreams, incomingStreams, formatEth } = useWallet();
  
  const [efficiencyMetrics] = useState({ requestsSent: 47, signersTriggered: 2 });
  const [timeRange, setTimeRange] = useState('7d');

  // Calculate analytics from streams
  const analytics = useMemo(() => {
    const totalOutgoing = outgoingStreams.reduce((sum, s) => sum + s.totalAmount, BigInt(0));
    const totalIncoming = incomingStreams.reduce((sum, s) => sum + s.totalAmount, BigInt(0));
    const activeCount = outgoingStreams.filter(s => s.isActive).length + incomingStreams.filter(s => s.isActive).length;
    const completedCount = outgoingStreams.filter(s => !s.isActive).length + incomingStreams.filter(s => !s.isActive).length;
    
    return {
      totalOutgoing,
      totalIncoming,
      activeCount,
      completedCount,
      totalStreams: outgoingStreams.length + incomingStreams.length
    };
  }, [outgoingStreams, incomingStreams]);

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-white/60 text-center max-w-md">
          Connect your wallet to view detailed analytics and performance metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Analytics Overview</h2>
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'All'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-flowpay-500/20 text-flowpay-300 border border-flowpay-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-glass p-4">
          <div className="text-sm text-white/60 mb-1">Total Streams</div>
          <div className="text-2xl font-bold text-white">{analytics.totalStreams}</div>
          <div className="text-xs text-emerald-400 mt-1">+12% from last period</div>
        </div>
        <div className="card-glass p-4">
          <div className="text-sm text-white/60 mb-1">Active Streams</div>
          <div className="text-2xl font-bold text-cyan-400">{analytics.activeCount}</div>
          <div className="text-xs text-white/40 mt-1">{analytics.completedCount} completed</div>
        </div>
        <div className="card-glass p-4">
          <div className="text-sm text-white/60 mb-1">Total Sent</div>
          <div className="text-2xl font-bold text-amber-400">{formatEth(analytics.totalOutgoing)}</div>
          <div className="text-xs text-white/40 mt-1">MNEE</div>
        </div>
        <div className="card-glass p-4">
          <div className="text-sm text-white/60 mb-1">Total Received</div>
          <div className="text-2xl font-bold text-emerald-400">{formatEth(analytics.totalIncoming)}</div>
          <div className="text-xs text-white/40 mt-1">MNEE</div>
        </div>
      </div>

      {/* Efficiency Section */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">⚡ Efficiency Analysis</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-4xl font-bold text-gradient-primary">
              {efficiencyMetrics.requestsSent > 0 
                ? Math.round((1 - efficiencyMetrics.signersTriggered / efficiencyMetrics.requestsSent) * 100) 
                : 0}%
            </div>
            <div className="text-sm text-white/60 mt-2">Gas Savings</div>
            <div className="text-xs text-white/40 mt-1">vs traditional payments</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-4xl font-bold text-cyan-400">{efficiencyMetrics.requestsSent}</div>
            <div className="text-sm text-white/60 mt-2">Total Requests</div>
            <div className="text-xs text-white/40 mt-1">processed via streams</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-4xl font-bold text-emerald-400">{efficiencyMetrics.signersTriggered}</div>
            <div className="text-sm text-white/60 mt-2">Signatures Used</div>
            <div className="text-xs text-white/40 mt-1">instead of {efficiencyMetrics.requestsSent}</div>
          </div>
        </div>
      </div>

      <ErrorBoundary variant="inline">
        <EfficiencyMetrics efficiencyMetrics={efficiencyMetrics} />
      </ErrorBoundary>

      <ErrorBoundary variant="inline">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔗 Service Connections</h3>
          <ServiceGraph />
        </div>
      </ErrorBoundary>

      {/* Recent Activity */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Recent Activity</h3>
        <div className="space-y-3">
          {[...outgoingStreams, ...incomingStreams]
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, 5)
            .map((stream, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stream.isActive ? 'bg-emerald-500' : 'bg-white/30'}`} />
                  <div>
                    <div className="text-sm text-white">
                      Stream #{stream.id} - {outgoingStreams.includes(stream) ? 'Outgoing' : 'Incoming'}
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(stream.startTime * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-cyan-300">{formatEth(stream.totalAmount)} MNEE</div>
                  <div className={`text-xs ${stream.isActive ? 'text-emerald-400' : 'text-white/40'}`}>
                    {stream.isActive ? 'Active' : 'Completed'}
                  </div>
                </div>
              </div>
            ))}
          {analytics.totalStreams === 0 && (
            <div className="text-center py-8 text-white/50">
              No activity yet. Create your first stream to see analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
