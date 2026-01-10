import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI, mneeTokenAddress, mneeTokenABI } from './contactInfo.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CreateStreamForm from './components/CreateStreamForm.jsx';
import StreamList from './components/StreamList.jsx';
import { AgentConsole } from './components/AgentConsole.jsx';
import { DecisionLog } from './components/DecisionLog.jsx';
import { StreamMonitor } from './components/StreamMonitor.jsx';
import { ServiceGraph } from './components/ServiceGraph.jsx';
import { EfficiencyMetrics } from './components/EfficiencyMetrics.jsx';
import { 
  MobileBottomNav, 
  CollapsibleSection,
  ToastProvider, 
  useToast,
  ErrorBoundary,
  SkeletonDashboard,
  SkeletonAgentConsole,
  SkeletonDecisionLog,
  SkeletonStreamCard,
  EmptyState,
  LoadingState,
  WalletNotConnected
} from './components/ui';

const TARGET_CHAIN_ID_DEC = 11155111; // Sepolia
const ALT_CHAIN_ID_DEC = 11155111; // Allow same for now
const TARGET_CHAIN_ID_HEX = '0x' + TARGET_CHAIN_ID_DEC.toString(16);
const ALT_CHAIN_ID_HEX = '0x' + ALT_CHAIN_ID_DEC.toString(16);

// Inner App component that uses toast
function AppContent() {
  const toast = useToast();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [status, setStatus] = useState('Not Connected');

  const [recipient, setRecipient] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');

  const [incomingStreams, setIncomingStreams] = useState([]);
  const [outgoingStreams, setOutgoingStreams] = useState([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Manual withdraw UI state
  const [manualStreamId, setManualStreamId] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [myStreamIds, setMyStreamIds] = useState([]);
  const [mneeBalance, setMneeBalance] = useState('0.0');

  // FlowPay Dashboard State
  const [agentConfig, setAgentConfig] = useState({ agentId: 'Dashboard-Agent', spendingLimits: { dailyLimit: '100' } });
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [decisionLogs, setDecisionLogs] = useState([
    { timestamp: Date.now() - 120000, mode: 'stream', reasoning: 'High volume detected (50+ requests). Streaming is 40% cheaper.', volume: 50 },
    { timestamp: Date.now() - 60000, mode: 'direct', reasoning: 'Low traffic. Direct payment is optimal.', volume: 2 },
  ]);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState({ requestsSent: 47, signersTriggered: 2 });

  // Convert outgoing streams to StreamMonitor format
  const activeStreamsForMonitor = useMemo(() => {
    return outgoingStreams.map(s => ({
      streamId: s.id?.toString() || '0',
      startTime: Number(s.startTime || 0),
      rate: s.flowRate || BigInt(0),
      amount: s.totalAmount || BigInt(0),
      agentId: agentConfig.agentId
    }));
  }, [outgoingStreams, agentConfig.agentId]);

  const addMyStreamId = (idNumber) => {
    if (!Number.isFinite(idNumber) || idNumber <= 0) return;
    setMyStreamIds((prev) => (prev.includes(idNumber) ? prev : [...prev, idNumber]));
  };

  // Fetch MNEE balance
  const fetchMneeBalance = async () => {
    if (!provider || !walletAddress) return;
    try {
      const mneeContract = new ethers.Contract(mneeTokenAddress, mneeTokenABI, provider);
      const balance = await mneeContract.balanceOf(walletAddress);
      setMneeBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to fetch MNEE balance:', error);
    }
  };

  // Mint MNEE tokens for testing
  const mintMneeTokens = async (amount = '1000') => {
    if (!signer || !walletAddress) {
      toast.warning('Please connect your wallet first');
      return;
    }
    try {
      setIsProcessing(true);
      setStatus('Minting MNEE tokens...');
      const loadingToast = toast.transaction.pending('Minting MNEE tokens...');
      
      const mneeContract = new ethers.Contract(mneeTokenAddress, mneeTokenABI, signer);
      const amountWei = ethers.parseEther(amount);
      const tx = await mneeContract.mint(walletAddress, amountWei);
      await tx.wait();
      
      toast.dismiss(loadingToast);
      toast.success(`Minted ${amount} MNEE tokens!`, { title: 'Mint Successful' });
      setStatus(`Minted ${amount} MNEE tokens.`);
      await fetchMneeBalance();
    } catch (error) {
      console.error('Mint failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Mint failed', { title: 'Mint Failed' });
      setStatus(error?.shortMessage || error?.message || 'Mint failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const contractWithProvider = useMemo(() => {
    if (!provider) return null;
    try {
      return new ethers.Contract(contractAddress, contractABI, provider);
    } catch {
      return null;
    }
  }, [provider]);

  const contractWithSigner = useMemo(() => {
    if (!signer) return null;
    try {
      return new ethers.Contract(contractAddress, contractABI, signer);
    } catch {
      return null;
    }
  }, [signer]);

  const getNetworkName = (id) => {
    if (!id) return '...';
    const mapping = {
      11155111: 'Ethereum Sepolia',
    };
    return mapping[id] || `Chain ${id}`;
  };

  const ensureCorrectNetwork = async (eth) => {
    const currentChainIdHex = await eth.request({ method: 'eth_chainId' });
    setChainId(parseInt(currentChainIdHex, 16));
    const isOk = currentChainIdHex === TARGET_CHAIN_ID_HEX; // Only check Target
    if (!isOk) {
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: TARGET_CHAIN_ID_HEX }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_ID_HEX,
                chainName: 'Ethereum Sepolia',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setStatus('Please install MetaMask.');
      toast.error('MetaMask not found', { title: 'Wallet Error' });
      return;
    }
    try {
      const eth = window.ethereum;
      await ensureCorrectNetwork(eth);
      await eth.request({ method: 'eth_requestAccounts' });

      const nextProvider = new ethers.BrowserProvider(eth);
      const nextSigner = await nextProvider.getSigner();
      const address = await nextSigner.getAddress();

      setProvider(nextProvider);
      setSigner(nextSigner);
      setWalletAddress(address);
      setStatus('Connected');
      toast.success(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`, { title: 'Wallet Connected' });
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Connection failed.');
      toast.error(error?.message || 'Failed to connect wallet', { title: 'Connection Failed' });
    }
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();
    if (!contractWithSigner || !provider) {
      setStatus('Please connect your wallet.');
      return;
    }
    try {
      if (!ethers.isAddress(recipient)) {
        setStatus('Invalid recipient address.');
        return;
      }
      const totalAmountWei = ethers.parseEther((amountEth || '0').toString());
      const duration = parseInt(durationSeconds || '0', 10);
      if (totalAmountWei <= 0n || !Number.isFinite(duration) || duration <= 0) {
        setStatus('Enter a positive amount and duration.');
        return;
      }
      const code = await provider.getCode(contractAddress);
      if (!code || code === '0x') {
        setStatus('Contract not deployed on this network. Switch to Morph Holesky.');
        return;
      }
      setStatus('Approving MNEE...');
      // Use the imported MNEE token address and ABI
      const mneeContract = new ethers.Contract(mneeTokenAddress, mneeTokenABI, signer);

      const currentAllowance = await mneeContract.allowance(await signer.getAddress(), contractAddress);
      if (currentAllowance < totalAmountWei) {
        setStatus('Approving MNEE token...');
        const approveTx = await mneeContract.approve(contractAddress, totalAmountWei);
        await approveTx.wait();
        setStatus('MNEE Approved.');
      }

      setStatus('Creating stream...');
      setIsProcessing(true);
      // New signature: createStream(recipient, duration, amount, metadata)
      // Removing { value: ... }
      const tx = await contractWithSigner.createStream(recipient, duration, totalAmountWei, "{}");
      const receipt = await tx.wait();

      // Parse StreamCreated event for streamId (with robust fallbacks)
      let createdId = null;
      try {
        const iface = contractWithSigner.interface;
        const topic = iface.getEventTopic('StreamCreated');
        for (const log of receipt.logs || []) {
          if (log.address?.toLowerCase() === contractAddress.toLowerCase() && log.topics?.[0] === topic) {
            const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data });
            const sid = parsed?.args?.streamId ?? parsed?.args?.[0];
            if (sid !== undefined && sid !== null) {
              createdId = Number(sid);
              break;
            }
          }
        }
      } catch { }
      // Fallback: query events at the tx block filtered by sender
      if (createdId === null && contractWithProvider) {
        try {
          const filter = contractWithProvider.filters.StreamCreated(null, walletAddress, null);
          const events = await contractWithProvider.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
          const match = events.find((ev) => ev.transactionHash?.toLowerCase() === tx.hash.toLowerCase());
          const sid = match?.args?.streamId ?? match?.args?.[0];
          if (sid !== undefined && sid !== null) {
            createdId = Number(sid);
          }
        } catch { }
      }

      if (createdId !== null) {
        addMyStreamId(createdId);
        setStatus(`Stream created. ID #${createdId}`);
        setManualStreamId(String(createdId));
        toast.stream.created(createdId);
      } else {
        setStatus(`Stream created. (ID not detected, check dashboard)`);
        toast.success('Stream created successfully', { title: 'Stream Created' });
      }
      setRecipient('');
      setAmountEth('');
      setDurationSeconds('');
      await refreshStreams();
    } catch (error) {
      console.error('Stream creation failed:', error);
      const raw = `${error?.shortMessage || error?.message || ''}`.toLowerCase();
      if (raw.includes('missing revert data')) {
        setStatus('Transaction reverted. Check inputs and wallet balance.');
        toast.error('Transaction reverted. Check inputs and wallet balance.', { title: 'Transaction Failed' });
      } else {
        setStatus(error?.shortMessage || error?.message || 'Transaction failed.');
        toast.error(error?.shortMessage || error?.message || 'Transaction failed', { title: 'Stream Creation Failed' });
      }
    }
    finally {
      setIsProcessing(false);
    }
  };

  const checkClaimableBalance = async () => {
    if (!provider) {
      setStatus('Please connect your wallet.');
      return;
    }
    try {
      const id = parseInt(manualStreamId || '0', 10);
      if (!Number.isFinite(id) || id <= 0) {
        setStatus('Enter a valid stream ID.');
        return;
      }
      const code = await provider.getCode(contractAddress);
      if (!code || code === '0x') {
        setStatus('Contract not deployed on this network.');
        return;
      }
      setStatus('Checking claimable balance...');
      const read = new ethers.Contract(contractAddress, contractABI, provider);
      const amount = await read.getClaimableBalance(id);
      const formatted = ethers.formatEther(amount);
      setClaimableBalance(formatted);
      setStatus('Fetched claimable balance.');
    } catch (error) {
      console.error('Check claimable failed:', error);
      setClaimableBalance('0.0');
      setStatus(error?.shortMessage || error?.message || 'Failed to fetch claimable balance.');
    }
  };

  const handleWithdrawManual = async () => {
    if (!contractWithSigner) {
      setStatus('Please connect your wallet.');
      toast.warning('Please connect your wallet first');
      return;
    }
    try {
      const id = parseInt(manualStreamId || '0', 10);
      if (!Number.isFinite(id) || id <= 0) {
        setStatus('Enter a valid stream ID.');
        toast.warning('Enter a valid stream ID');
        return;
      }
      setStatus('Sending withdraw transaction...');
      setIsProcessing(true);
      const loadingToast = toast.transaction.pending('Processing withdrawal...');
      const tx = await contractWithSigner.withdrawFromStream(id);
      setStatus('Waiting for confirmation...');
      await tx.wait();
      toast.dismiss(loadingToast);
      setStatus('Withdraw successful.');
      toast.stream.withdrawn(claimableBalance);
      addMyStreamId(id);
      await refreshStreams();
      // Refresh claimable for convenience
      await checkClaimableBalance();
    } catch (error) {
      console.error('Withdraw failed:', error);
      setStatus(error?.shortMessage || error?.message || 'Withdraw failed.');
      toast.transaction.error(error?.shortMessage || error?.message || 'Withdraw failed');
    }
    finally {
      setIsProcessing(false);
    }
  };

  const fetchStreamsFromEvents = async (me) => {
    if (!contractWithProvider) return { incoming: [], outgoing: [] };
    try {
      const filter = contractWithProvider.filters.StreamCreated();
      const events = await contractWithProvider.queryFilter(filter, 0, 'latest');
      const streamCards = await Promise.all(
        events.map(async (ev) => {
          const streamId = ev.args.streamId;
          const [sender, recipient, totalAmount, flowRate, startTime, stopTime, amountWithdrawn, isActive] = Object.values(
            await contractWithProvider.streams(streamId)
          );
          const now = Math.floor(Date.now() / 1000);
          const elapsed = Math.max(0, Math.min(Number(stopTime), now) - Number(startTime));
          const streamedSoFar = BigInt(elapsed) * BigInt(flowRate);
          const claimable = isActive
            ? streamedSoFar > BigInt(amountWithdrawn)
              ? streamedSoFar - BigInt(amountWithdrawn)
              : 0n
            : 0n;
          return {
            id: Number(streamId),
            sender: sender,
            recipient: recipient,
            totalAmount: BigInt(totalAmount),
            flowRate: BigInt(flowRate),
            startTime: Number(startTime),
            stopTime: Number(stopTime),
            amountWithdrawn: BigInt(amountWithdrawn),
            isActive: Boolean(isActive),
            claimableInitial: claimable,
          };
        })
      );
      const meLc = me?.toLowerCase();
      const incoming = streamCards.filter((s) => s.recipient.toLowerCase() === meLc);
      const outgoing = streamCards.filter((s) => s.sender.toLowerCase() === meLc);
      return { incoming, outgoing };
    } catch (err) {
      console.error('Failed to fetch events:', err);
      return { incoming: [], outgoing: [] };
    }
  };

  const refreshStreams = async () => {
    if (!walletAddress) return;
    setIsLoadingStreams(true);
    const { incoming, outgoing } = await fetchStreamsFromEvents(walletAddress);
    setIncomingStreams(incoming);
    setOutgoingStreams(outgoing);
    setIsLoadingStreams(false);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!walletAddress || !contractWithProvider) return;
    refreshStreams();
    fetchMneeBalance();
    // Listen for new streams and updates
    const createdListener = () => refreshStreams();
    const cancelledListener = () => refreshStreams();
    const withdrawnListener = () => refreshStreams();
    contractWithProvider.on('StreamCreated', createdListener);
    contractWithProvider.on('StreamCancelled', cancelledListener);
    contractWithProvider.on('Withdrawn', withdrawnListener);
    return () => {
      try {
        contractWithProvider.off('StreamCreated', createdListener);
        contractWithProvider.off('StreamCancelled', cancelledListener);
        contractWithProvider.off('Withdrawn', withdrawnListener);
      } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, contractWithProvider]);

  // Live claimable ticker based on local clock to avoid spamming RPC
  const tickerRef = useRef(null);
  useEffect(() => {
    if (!incomingStreams.length) return;
    const tick = () => {
      setIncomingStreams((prev) =>
        prev.map((s) => {
          if (!s.isActive) return s;
          const now = Math.floor(Date.now() / 1000);
          const cappedNow = Math.min(now, s.stopTime);
          const elapsed = Math.max(0, cappedNow - s.startTime);
          const streamed = BigInt(elapsed) * BigInt(s.flowRate);
          const claimable = streamed > BigInt(s.amountWithdrawn) ? streamed - BigInt(s.amountWithdrawn) : 0n;
          return { ...s, claimableInitial: claimable };
        })
      );
    };
    tickerRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickerRef.current);
  }, [incomingStreams.length]);

  const withdraw = async (streamId) => {
    if (!contractWithSigner) return;
    try {
      setStatus('Withdrawing...');
      setIsProcessing(true);
      const loadingToast = toast.transaction.pending('Processing withdrawal...');
      const tx = await contractWithSigner.withdrawFromStream(streamId);
      await tx.wait();
      toast.dismiss(loadingToast);
      setStatus('Withdrawn.');
      toast.success(`Withdrawn from Stream #${streamId}`, { title: 'Withdrawal Complete' });
      addMyStreamId(Number(streamId));
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Withdraw failed.');
      toast.error(e?.shortMessage || e?.message || 'Withdraw failed', { title: 'Withdrawal Failed' });
    }
    finally {
      setIsProcessing(false);
    }
  };

  const cancel = async (streamId) => {
    if (!contractWithSigner) return;
    try {
      setStatus('Cancelling stream...');
      setIsProcessing(true);
      const loadingToast = toast.transaction.pending('Cancelling stream...');
      const tx = await contractWithSigner.cancelStream(streamId);
      await tx.wait();
      toast.dismiss(loadingToast);
      setStatus('Stream cancelled.');
      toast.stream.cancelled(streamId);
      addMyStreamId(Number(streamId));
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Cancel failed.');
      toast.error(e?.shortMessage || e?.message || 'Cancel failed', { title: 'Cancellation Failed' });
    }
    finally {
      setIsProcessing(false);
    }
  };

  const formatEth = (weiBigInt) => {
    try {
      return Number(ethers.formatEther(weiBigInt)).toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch {
      return '0';
    }
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const isWorking = isProcessing;

  // Render loading skeleton for initial load
  const renderDashboardContent = () => {
    if (isInitialLoad && isLoadingStreams) {
      return <SkeletonDashboard />;
    }
    return (
      <div className="space-y-8 md:space-y-12">
        <CollapsibleSection title="Stream Monitor" icon="🌊" defaultOpen={true}>
          <StreamMonitor activeStreams={activeStreamsForMonitor} />
        </CollapsibleSection>
        <CollapsibleSection title="Efficiency Metrics" icon="📈" defaultOpen={true}>
          <EfficiencyMetrics efficiencyMetrics={efficiencyMetrics} />
        </CollapsibleSection>
        <CollapsibleSection title="Service Graph" icon="🔗" defaultOpen={false} className="desktop-only">
          <ServiceGraph />
        </CollapsibleSection>
      </div>
    );
  };

  const renderStreamsContent = () => {
    if (isInitialLoad && isLoadingStreams) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonStreamCard key={i} />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-8 md:space-y-12">
        {/* MNEE Token Balance Card */}
        <section className="card-glass p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">💰 MNEE Token Balance</h3>
              <p className="text-2xl font-mono text-cyan-300">
                {Number(mneeBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })} MNEE
              </p>
              <p className="text-xs text-white/50 mt-1 font-mono truncate">
                Token: {mneeTokenAddress}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-default min-h-[44px] px-4"
                onClick={fetchMneeBalance}
                disabled={isProcessing}
              >
                Refresh
              </button>
              <button
                type="button"
                className="btn-primary min-h-[44px] px-4"
                onClick={() => mintMneeTokens('1000')}
                disabled={isProcessing}
              >
                Mint 1000 MNEE
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <CollapsibleSection title="Create Stream" icon="➕" defaultOpen={true}>
            <p className="text-sm text-white/50 mb-4">Funds stream per second using MNEE tokens. Flow rate = total / duration.</p>
            <CreateStreamForm
              recipient={recipient}
              setRecipient={setRecipient}
              amountEth={amountEth}
              setAmountEth={setAmountEth}
              durationSeconds={durationSeconds}
              setDurationSeconds={setDurationSeconds}
              onSubmit={handleCreateStream}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Withdraw Funds" icon="💰" defaultOpen={true}>
            <p className="text-sm text-white/60 mb-4">Enter a stream ID to check and withdraw claimable MNEE funds.</p>
            <div className="grid grid-cols-1 gap-4">
              <label>
                <span className="block text-sm text-white/70 mb-1.5">Stream ID</span>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={manualStreamId}
                  onChange={(e) => setManualStreamId(e.target.value)}
                  className="input-default w-full"
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" className="btn-default flex-1 min-h-[44px]" onClick={checkClaimableBalance}>
                  Check Balance
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1 min-h-[44px]"
                  onClick={handleWithdrawManual}
                  disabled={!manualStreamId || parseFloat(claimableBalance || '0') <= 0}
                >
                  Withdraw
                </button>
              </div>

              <p className="text-sm text-white/70">
                Can Withdraw: <span className="font-mono text-cyan-300">{Number(claimableBalance || '0').toLocaleString(undefined, { maximumFractionDigits: 6 })}</span> MNEE
              </p>
            </div>
          </CollapsibleSection>
        </section>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          <StreamList
            title="Incoming Streams"
            emptyText="No incoming streams found."
            isLoading={isLoadingStreams}
            streams={incomingStreams}
            variant="incoming"
            formatEth={formatEth}
            onWithdraw={withdraw}
            onCancel={cancel}
          />
          <StreamList
            title="Outgoing Streams"
            emptyText="No outgoing streams."
            isLoading={isLoadingStreams}
            streams={outgoingStreams}
            variant="outgoing"
            formatEth={formatEth}
            onCancel={cancel}
          />
        </div>
      </div>
    );
  };

  const renderAgentContent = () => {
    if (isInitialLoad) {
      return <SkeletonAgentConsole />;
    }
    return (
      <div className="space-y-6 md:space-y-8">
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
      </div>
    );
  };

  const renderAnalyticsContent = () => {
    return (
      <div className="space-y-6 md:space-y-8">
        <ErrorBoundary variant="inline">
          <EfficiencyMetrics efficiencyMetrics={efficiencyMetrics} />
        </ErrorBoundary>
        <ErrorBoundary variant="inline">
          <ServiceGraph />
        </ErrorBoundary>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full">
      <div className="absolute inset-0 bg-grid bg-[size:24px_24px] opacity-20 pointer-events-none" />

      <Header
        walletAddress={walletAddress}
        chainId={chainId}
        networkName={getNetworkName(chainId)}
        onConnect={connectWallet}
        balance={claimableBalance}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Hero networkName={getNetworkName(chainId)} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 md:pb-16">
        <ErrorBoundary>
          {activeTab === 'dashboard' && (
            <div className="mt-6 md:mt-8 animate-fade-in">
              {renderDashboardContent()}
            </div>
          )}

          {activeTab === 'streams' && (
            <div className="mt-6 md:mt-8 animate-fade-in">
              {renderStreamsContent()}
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="mt-6 md:mt-8 animate-fade-in">
              {renderAgentContent()}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="mt-6 md:mt-8 animate-fade-in">
              {renderAnalyticsContent()}
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
      />

      {/* Status Bar */}
      <div className="pointer-events-none fixed bottom-20 md:bottom-6 left-1/2 z-40 w-[92%] max-w-3xl -translate-x-1/2">
        <div className="pointer-events-auto card-glass flex items-center gap-3 px-4 py-3">
          <div
            className={`h-2 w-2 rounded-full ${isWorking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
              }`}
          />
          <div className="font-mono text-sm sm:text-base text-white/90 truncate flex items-center gap-2">
            {isWorking && (
              <svg className="h-4 w-4 animate-spin text-cyan-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            <span className="truncate">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App wrapper
function App() {
  return <AppContent />;
}

export default App;