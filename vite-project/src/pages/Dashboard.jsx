import { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { StreamMonitor } from '../components/StreamMonitor';
import { EfficiencyMetrics } from '../components/EfficiencyMetrics';
import { ServiceGraph } from '../components/ServiceGraph';
import { CollapsibleSection, SkeletonDashboard, ErrorBoundary } from '../components/ui';

export default function Dashboard() {
  const { outgoingStreams, isInitialLoad, isLoadingStreams, walletAddress } = useWallet();
  const [agentConfig] = useState({ agentId: 'Dashboard-Agent' });
  const [efficiencyMetrics] = useState({ requestsSent: 47, signersTriggered: 2 });

  const activeStreamsForMonitor = useMemo(() => {
    return outgoingStreams.map(s => ({
      streamId: s.id?.toString() || '0',
      startTime: Number(s.startTime || 0),
      rate: s.flowRate || BigInt(0),
      amount: s.totalAmount || BigInt(0),
      agentId: agentConfig.agentId
    }));
  }, [outgoingStreams, agentConfig.agentId]);

  if (isInitialLoad && isLoadingStreams) {
    return <SkeletonDashboard />;
  }

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-white/60 text-center max-w-md">
          Connect your wallet to view your dashboard, monitor streams, and track efficiency metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-gradient-primary">{outgoingStreams.length}</div>
          <div className="text-sm text-white/60 mt-1">Active Streams</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{efficiencyMetrics.requestsSent}</div>
          <div className="text-sm text-white/60 mt-1">Requests Sent</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{efficiencyMetrics.signersTriggered}</div>
          <div className="text-sm text-white/60 mt-1">Signatures Used</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">
            {efficiencyMetrics.requestsSent > 0 
              ? Math.round((1 - efficiencyMetrics.signersTriggered / efficiencyMetrics.requestsSent) * 100) 
              : 0}%
          </div>
          <div className="text-sm text-white/60 mt-1">Gas Saved</div>
        </div>
      </div>

      <ErrorBoundary variant="inline">
        <CollapsibleSection title="Stream Monitor" icon="🌊" defaultOpen={true}>
          <StreamMonitor activeStreams={activeStreamsForMonitor} />
        </CollapsibleSection>
      </ErrorBoundary>

      <ErrorBoundary variant="inline">
        <CollapsibleSection title="Efficiency Metrics" icon="📈" defaultOpen={true}>
          <EfficiencyMetrics efficiencyMetrics={efficiencyMetrics} />
        </CollapsibleSection>
      </ErrorBoundary>

      <ErrorBoundary variant="inline">
        <CollapsibleSection title="Service Graph" icon="🔗" defaultOpen={false}>
          <ServiceGraph />
        </CollapsibleSection>
      </ErrorBoundary>
    </div>
  );
}
