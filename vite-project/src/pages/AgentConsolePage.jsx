import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { AgentConsole } from '../components/AgentConsole';
import { DecisionLog } from '../components/DecisionLog';
import { ErrorBoundary, SkeletonAgentConsole } from '../components/ui';
import { Bot, Play, Pause, RefreshCw, BarChart3, StopCircle, Settings } from 'lucide-react';

export default function AgentConsolePage() {
  const { walletAddress, isInitialLoad } = useWallet();
  
  const [agentConfig, setAgentConfig] = useState({
    agentId: 'FlowPay-Agent-001',
    spendingLimits: { dailyLimit: '100', perRequestLimit: '1' }
  });
  const [isPaused, setIsPaused] = useState(false);
  const [decisionLogs, setDecisionLogs] = useState([
    { 
      timestamp: Date.now() - 300000, 
      mode: 'stream', 
      reasoning: 'High volume detected (50+ requests). Streaming is 40% cheaper than direct payments.',
      volume: 50,
      provider: 'api.provider.com'
    },
    { 
      timestamp: Date.now() - 180000, 
      mode: 'stream', 
      reasoning: 'Existing stream found for provider. Reusing stream #42.',
      volume: 25,
      provider: 'api.provider.com'
    },
    { 
      timestamp: Date.now() - 60000, 
      mode: 'direct', 
      reasoning: 'Low traffic (2 requests). Direct payment is optimal for small volumes.',
      volume: 2,
      provider: 'api.other.com'
    },
  ]);

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Bot className="w-16 h-16 text-white/60 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-white/60 text-center max-w-md">
          Connect your wallet to configure and monitor your AI payment agent.
        </p>
      </div>
    );
  }

  if (isInitialLoad) {
    return <SkeletonAgentConsole />;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Agent Status Banner */}
      <div className={`card-glass p-4 flex items-center justify-between ${isPaused ? 'border-amber-500/50' : 'border-emerald-500/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          <div>
            <span className="font-medium text-white">Agent Status:</span>
            <span className={`ml-2 ${isPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
        <div className="text-sm text-white/60">
          Agent ID: <span className="font-mono text-cyan-300">{agentConfig.agentId}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`card-glass p-4 text-center hover:bg-white/5 transition-colors ${isPaused ? 'border-amber-500/30' : ''}`}
        >
          <div className="flex justify-center mb-2">
            {isPaused ? <Play className="w-6 h-6 text-white/80" /> : <Pause className="w-6 h-6 text-white/80" />}
          </div>
          <div className="text-sm text-white/80">{isPaused ? 'Resume' : 'Pause'} Agent</div>
        </button>
        <button className="card-glass p-4 text-center hover:bg-white/5 transition-colors">
          <div className="flex justify-center mb-2">
            <RefreshCw className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-sm text-white/80">Refresh Status</div>
        </button>
        <button className="card-glass p-4 text-center hover:bg-white/5 transition-colors">
          <div className="flex justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-sm text-white/80">View Metrics</div>
        </button>
        <button className="card-glass p-4 text-center hover:bg-white/5 transition-colors border-red-500/30">
          <div className="flex justify-center mb-2">
            <StopCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-sm text-white/80">Emergency Stop</div>
        </button>
      </div>

      <ErrorBoundary variant="inline">
        <AgentConsole
          config={agentConfig}
          setConfig={setAgentConfig}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </ErrorBoundary>

      <ErrorBoundary variant="inline">
        <DecisionLog logs={decisionLogs} />
      </ErrorBoundary>

      {/* Agent Configuration Summary */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Configuration Summary
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-2">Spending Limits</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Daily Limit</span>
                <span className="font-mono text-cyan-300">{agentConfig.spendingLimits.dailyLimit} MNEE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Per Request</span>
                <span className="font-mono text-cyan-300">{agentConfig.spendingLimits.perRequestLimit} MNEE</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-2">AI Decision Engine</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Model</span>
                <span className="font-mono text-cyan-300">Gemini Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Mode</span>
                <span className="font-mono text-cyan-300">Auto (Stream Preferred)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
