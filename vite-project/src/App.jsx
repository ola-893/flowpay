import { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contactInfo.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import CreateStreamForm from './components/CreateStreamForm.jsx';
import StreamList from './components/StreamList.jsx';

const TARGET_CHAIN_ID_DEC = 11155111; // Sepolia
const ALT_CHAIN_ID_DEC = 11155111; // Allow same for now
const TARGET_CHAIN_ID_HEX = '0x' + TARGET_CHAIN_ID_DEC.toString(16);
const ALT_CHAIN_ID_HEX = '0x' + ALT_CHAIN_ID_DEC.toString(16);

function App() {
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

  // Manual withdraw UI state
  const [manualStreamId, setManualStreamId] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [myStreamIds, setMyStreamIds] = useState([]);

  const addMyStreamId = (idNumber) => {
    if (!Number.isFinite(idNumber) || idNumber <= 0) return;
    setMyStreamIds((prev) => (prev.includes(idNumber) ? prev : [...prev, idNumber]));
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
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Connection failed.');
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
      // Note: In a real app we would import the ERC20 ABI and call approve here.
      // For now, we assume the user has already approved or we rely on the contract to handle it (which it can't without approval).
      // Since this is a frontend update, we need to add the MNEE approval step.
      // However, to keep it simple and consistent with the plan, I will just call createStream with the new signature.
      // But wait! usage of `value` is removed in favor of ERC20 transfer.
      // I need to update this logic significantly to support ERC20 approval.

      // Let's assume we have an IERC20 ABI available or generic ERC20 calls.
      // I will create a helper for this or just do it inline if I can.

      const mneeAddress = await contractWithSigner.mneeToken();
      const mneeContract = new ethers.Contract(mneeAddress, [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
      ], signer);

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
      } else {
        setStatus(`Stream created. (ID not detected, check dashboard)`);
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
      } else {
        setStatus(error?.shortMessage || error?.message || 'Transaction failed.');
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
      return;
    }
    try {
      const id = parseInt(manualStreamId || '0', 10);
      if (!Number.isFinite(id) || id <= 0) {
        setStatus('Enter a valid stream ID.');
        return;
      }
      setStatus('Sending withdraw transaction...');
      setIsProcessing(true);
      const tx = await contractWithSigner.withdrawFromStream(id);
      setStatus('Waiting for confirmation...');
      await tx.wait();
      setStatus('Withdraw successful.');
      addMyStreamId(id);
      await refreshStreams();
      // Refresh claimable for convenience
      await checkClaimableBalance();
    } catch (error) {
      console.error('Withdraw failed:', error);
      setStatus(error?.shortMessage || error?.message || 'Withdraw failed.');
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
  };

  useEffect(() => {
    if (!walletAddress || !contractWithProvider) return;
    refreshStreams();
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
      const tx = await contractWithSigner.withdrawFromStream(streamId);
      await tx.wait();
      setStatus('Withdrawn.');
      addMyStreamId(Number(streamId));
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Withdraw failed.');
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
      const tx = await contractWithSigner.cancelStream(streamId);
      await tx.wait();
      setStatus('Stream cancelled.');
      addMyStreamId(Number(streamId));
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Cancel failed.');
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

  return (
    <div className="min-h-screen w-full">
      <div className="absolute inset-0 bg-grid bg-[size:24px_24px] opacity-20 pointer-events-none" />

      <Header
        walletAddress={walletAddress}
        chainId={chainId}
        networkName={getNetworkName(chainId)}
        onConnect={connectWallet}
      />

      <Hero networkName={getNetworkName(chainId)} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16">
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card-glass relative p-6 sm:p-8">
            <div className="absolute -top-10 right-6 hidden h-20 w-20 animate-float rounded-full bg-hero opacity-20 blur-2xl sm:block" />
            <h2 className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Create Stream
            </h2>
            <p className="mt-1 text-sm text-white/60">Funds stream per second. Flow rate = total / duration.</p>

            <CreateStreamForm
              recipient={recipient}
              setRecipient={setRecipient}
              amountEth={amountEth}
              setAmountEth={setAmountEth}
              durationSeconds={durationSeconds}
              setDurationSeconds={setDurationSeconds}
              onSubmit={handleCreateStream}
            />
          </div>

          <aside className="card-glass relative p-6 sm:p-8">
            <div className="absolute -top-10 right-6 hidden h-20 w-20 animate-float rounded-full bg-hero opacity-20 blur-2xl sm:block" />
            <h2 className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Withdraw from a Stream
            </h2>
            <p className="mt-1 text-sm text-white/60">Enter a stream ID to check and withdraw claimable funds.</p>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <label>
                <span className="block text-sm text-white/70">Stream ID</span>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={manualStreamId}
                  onChange={(e) => setManualStreamId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn-default" onClick={checkClaimableBalance}>
                  Check Claimable Balance
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleWithdrawManual}
                  disabled={!manualStreamId || parseFloat(claimableBalance || '0') <= 0}
                >
                  Withdraw Funds
                </button>
              </div>

              <p className="text-sm text-white/70">
                Can Withdraw: <span className="font-mono text-cyan-300">{Number(claimableBalance || '0').toLocaleString(undefined, { maximumFractionDigits: 6 })}</span> ETH
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <StreamList
            title="Incoming Streams"
            emptyText="No incoming streams."
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
        </section>

        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2">
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
      </main>
    </div>
  );
}

export default App;