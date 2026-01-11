import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { mneeTokenAddress } from '../contactInfo';
import CreateStreamForm from '../components/CreateStreamForm';
import StreamList from '../components/StreamList';
import { CollapsibleSection, SkeletonStreamCard } from '../components/ui';
import { ArrowRightLeft, Coins, Plus, Wallet } from 'lucide-react';

export default function Streams() {
  const {
    walletAddress, mneeBalance, isProcessing, isInitialLoad, isLoadingStreams,
    incomingStreams, setIncomingStreams, outgoingStreams,
    fetchMneeBalance, mintMneeTokens, createStream, withdraw, cancel,
    formatEth, getClaimableBalance, setStatus, toast
  } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [manualStreamId, setManualStreamId] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.0');

  const handleCreateStream = async (e) => {
    e.preventDefault();
    const streamId = await createStream(recipient, durationSeconds, amountEth);
    if (streamId !== null) {
      setRecipient('');
      setAmountEth('');
      setDurationSeconds('');
      setManualStreamId(String(streamId));
    }
  };

  const checkClaimableBalance = async () => {
    const id = parseInt(manualStreamId || '0', 10);
    if (!Number.isFinite(id) || id <= 0) {
      toast.warning('Enter a valid stream ID');
      return;
    }
    setStatus('Checking claimable balance...');
    const balance = await getClaimableBalance(id);
    setClaimableBalance(balance);
    setStatus('Fetched claimable balance.');
  };

  const handleWithdrawManual = async () => {
    const id = parseInt(manualStreamId || '0', 10);
    if (!Number.isFinite(id) || id <= 0) {
      toast.warning('Enter a valid stream ID');
      return;
    }
    await withdraw(id);
    await checkClaimableBalance();
  };

  // Live claimable ticker
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
  }, [incomingStreams.length, setIncomingStreams]);

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ArrowRightLeft className="w-16 h-16 text-white/60 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-white/60 text-center max-w-md">
          Connect your wallet to create and manage payment streams.
        </p>
      </div>
    );
  }

  if (isInitialLoad && isLoadingStreams) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[...Array(3)].map((_, i) => <SkeletonStreamCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* MNEE Token Balance Card */}
      <section className="card-glass p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Coins className="w-5 h-5" /> MNEE Token Balance
            </h3>
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
        <CollapsibleSection title="Create Stream" icon={<Plus className="w-5 h-5" />} defaultOpen={true}>
          <p className="text-sm text-white/50 mb-4">
            Funds stream per second using MNEE tokens. Flow rate = total / duration.
          </p>
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

        <CollapsibleSection title="Withdraw Funds" icon={<Wallet className="w-5 h-5" />} defaultOpen={true}>
          <p className="text-sm text-white/60 mb-4">
            Enter a stream ID to check and withdraw claimable MNEE funds.
          </p>
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
              <button
                type="button"
                className="btn-default flex-1 min-h-[44px]"
                onClick={checkClaimableBalance}
              >
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
              Can Withdraw:{' '}
              <span className="font-mono text-cyan-300">
                {Number(claimableBalance || '0').toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </span>{' '}
              MNEE
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
}
