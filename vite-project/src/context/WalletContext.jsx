import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI, mneeTokenAddress, mneeTokenABI } from '../contactInfo.js';
import { useToast } from '../components/ui';

const WalletContext = createContext(null);

const TARGET_CHAIN_ID_DEC = 11155111;
const TARGET_CHAIN_ID_HEX = '0x' + TARGET_CHAIN_ID_DEC.toString(16);

export function WalletProvider({ children }) {
  const toast = useToast();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [status, setStatus] = useState('Not Connected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mneeBalance, setMneeBalance] = useState('0.0');

  // Stream state
  const [incomingStreams, setIncomingStreams] = useState([]);
  const [outgoingStreams, setOutgoingStreams] = useState([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const contractWithProvider = useMemo(() => {
    if (!provider) return null;
    try { return new ethers.Contract(contractAddress, contractABI, provider); }
    catch { return null; }
  }, [provider]);

  const contractWithSigner = useMemo(() => {
    if (!signer) return null;
    try { return new ethers.Contract(contractAddress, contractABI, signer); }
    catch { return null; }
  }, [signer]);

  const getNetworkName = (id) => {
    if (!id) return '...';
    const mapping = { 11155111: 'Ethereum Sepolia' };
    return mapping[id] || `Chain ${id}`;
  };

  const ensureCorrectNetwork = async (eth) => {
    const currentChainIdHex = await eth.request({ method: 'eth_chainId' });
    setChainId(parseInt(currentChainIdHex, 16));
    if (currentChainIdHex !== TARGET_CHAIN_ID_HEX) {
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET_CHAIN_ID_HEX }] });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: TARGET_CHAIN_ID_HEX, chainName: 'Ethereum Sepolia',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'], blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } else throw switchError;
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

  const fetchMneeBalance = useCallback(async () => {
    if (!provider || !walletAddress) return;
    try {
      const mneeContract = new ethers.Contract(mneeTokenAddress, mneeTokenABI, provider);
      const balance = await mneeContract.balanceOf(walletAddress);
      setMneeBalance(ethers.formatEther(balance));
    } catch (error) { console.error('Failed to fetch MNEE balance:', error); }
  }, [provider, walletAddress]);

  const mintMneeTokens = async (amount = '1000') => {
    if (!signer || !walletAddress) { toast.warning('Please connect your wallet first'); return; }
    try {
      setIsProcessing(true);
      setStatus('Minting MNEE tokens...');
      const loadingToast = toast.transaction.pending('Minting MNEE tokens...');
      const mneeContract = new ethers.Contract(mneeTokenAddress, mneeTokenABI, signer);
      const tx = await mneeContract.mint(walletAddress, ethers.parseEther(amount));
      await tx.wait();
      toast.dismiss(loadingToast);
      toast.success(`Minted ${amount} MNEE tokens!`, { title: 'Mint Successful' });
      setStatus(`Minted ${amount} MNEE tokens.`);
      await fetchMneeBalance();
    } catch (error) {
      console.error('Mint failed:', error);
      toast.error(error?.shortMessage || error?.message || 'Mint failed', { title: 'Mint Failed' });
      setStatus(error?.shortMessage || error?.message || 'Mint failed.');
    } finally { setIsProcessing(false); }
  };

  const fetchStreamsFromEvents = useCallback(async (me) => {
    if (!contractWithProvider) return { incoming: [], outgoing: [] };
    try {
      const filter = contractWithProvider.filters.StreamCreated();
      const events = await contractWithProvider.queryFilter(filter, 0, 'latest');
      const streamCards = await Promise.all(events.map(async (ev) => {
        const streamId = ev.args.streamId;
        const [sender, recipient, totalAmount, flowRate, startTime, stopTime, amountWithdrawn, isActive] = 
          Object.values(await contractWithProvider.streams(streamId));
        const now = Math.floor(Date.now() / 1000);
        const elapsed = Math.max(0, Math.min(Number(stopTime), now) - Number(startTime));
        const streamedSoFar = BigInt(elapsed) * BigInt(flowRate);
        const claimable = isActive ? (streamedSoFar > BigInt(amountWithdrawn) ? streamedSoFar - BigInt(amountWithdrawn) : 0n) : 0n;
        return { id: Number(streamId), sender, recipient, totalAmount: BigInt(totalAmount), flowRate: BigInt(flowRate),
          startTime: Number(startTime), stopTime: Number(stopTime), amountWithdrawn: BigInt(amountWithdrawn),
          isActive: Boolean(isActive), claimableInitial: claimable };
      }));
      const meLc = me?.toLowerCase();
      return { incoming: streamCards.filter(s => s.recipient.toLowerCase() === meLc),
               outgoing: streamCards.filter(s => s.sender.toLowerCase() === meLc) };
    } catch (err) { console.error('Failed to fetch events:', err); return { incoming: [], outgoing: [] }; }
  }, [contractWithProvider]);

  const refreshStreams = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoadingStreams(true);
    const { incoming, outgoing } = await fetchStreamsFromEvents(walletAddress);
    setIncomingStreams(incoming);
    setOutgoingStreams(outgoing);
    setIsLoadingStreams(false);
    setIsInitialLoad(false);
  }, [walletAddress, fetchStreamsFromEvents]);

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
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Withdraw failed.');
      toast.error(e?.shortMessage || e?.message || 'Withdraw failed', { title: 'Withdrawal Failed' });
    } finally { setIsProcessing(false); }
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
      await refreshStreams();
    } catch (e) {
      console.error(e);
      setStatus(e?.shortMessage || e?.message || 'Cancel failed.');
      toast.error(e?.shortMessage || e?.message || 'Cancel failed', { title: 'Cancellation Failed' });
    } finally { setIsProcessing(false); }
  };

  const createStream = async (recipient, duration, amount) => {
    if (!contractWithSigner || !provider || !signer) {
      setStatus('Please connect your wallet.');
      return null;
    }
    try {
      if (!ethers.isAddress(recipient)) { setStatus('Invalid recipient address.'); return null; }
      const totalAmountWei = ethers.parseEther(amount.toString());
      const dur = parseInt(duration, 10);
      if (totalAmountWei <= 0n || !Number.isFinite(dur) || dur <= 0) {
        setStatus('Enter a positive amount and duration.'); return null;
      }
      setStatus('Approving MNEE...');
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
      const tx = await contractWithSigner.createStream(recipient, dur, totalAmountWei, "{}");
      const receipt = await tx.wait();
      let createdId = null;
      try {
        const iface = contractWithSigner.interface;
        const topic = iface.getEventTopic('StreamCreated');
        for (const log of receipt.logs || []) {
          if (log.address?.toLowerCase() === contractAddress.toLowerCase() && log.topics?.[0] === topic) {
            const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data });
            const sid = parsed?.args?.streamId ?? parsed?.args?.[0];
            if (sid !== undefined && sid !== null) { createdId = Number(sid); break; }
          }
        }
      } catch {}
      if (createdId !== null) {
        setStatus(`Stream created. ID #${createdId}`);
        toast.stream.created(createdId);
      } else {
        setStatus('Stream created.');
        toast.success('Stream created successfully', { title: 'Stream Created' });
      }
      await refreshStreams();
      return createdId;
    } catch (error) {
      console.error('Stream creation failed:', error);
      setStatus(error?.shortMessage || error?.message || 'Transaction failed.');
      toast.error(error?.shortMessage || error?.message || 'Transaction failed', { title: 'Stream Creation Failed' });
      return null;
    } finally { setIsProcessing(false); }
  };

  const getClaimableBalance = async (streamId) => {
    if (!provider) return '0.0';
    try {
      const read = new ethers.Contract(contractAddress, contractABI, provider);
      const amount = await read.getClaimableBalance(streamId);
      return ethers.formatEther(amount);
    } catch { return '0.0'; }
  };

  const formatEth = (weiBigInt) => {
    try { return Number(ethers.formatEther(weiBigInt)).toLocaleString(undefined, { maximumFractionDigits: 6 }); }
    catch { return '0'; }
  };

  useEffect(() => {
    if (!walletAddress || !contractWithProvider) return;
    refreshStreams();
    fetchMneeBalance();
    const listener = () => refreshStreams();
    contractWithProvider.on('StreamCreated', listener);
    contractWithProvider.on('StreamCancelled', listener);
    contractWithProvider.on('Withdrawn', listener);
    return () => {
      try {
        contractWithProvider.off('StreamCreated', listener);
        contractWithProvider.off('StreamCancelled', listener);
        contractWithProvider.off('Withdrawn', listener);
      } catch {}
    };
  }, [walletAddress, contractWithProvider, refreshStreams, fetchMneeBalance]);

  const value = {
    provider, signer, walletAddress, chainId, status, setStatus, isProcessing, setIsProcessing,
    mneeBalance, incomingStreams, setIncomingStreams, outgoingStreams, isLoadingStreams, isInitialLoad,
    contractWithProvider, contractWithSigner, getNetworkName, connectWallet, fetchMneeBalance,
    mintMneeTokens, refreshStreams, withdraw, cancel, createStream, getClaimableBalance, formatEth, toast
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
