import React, { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import confetti from 'canvas-confetti';

import { fetchTips } from './helius';

// Styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

// Components
import WalletButton from './components/WalletButton';
import TipPresets from './components/TipPresets';
import SendTipButton from './components/SendTipButton';
import TipFeed from './components/TipFeed';
import ShareLink from './components/ShareLink';
import StatusToast from './components/StatusToast';
import IntentModal from './components/IntentModal';
import EditProfileModal from './components/EditProfileModal';

// Base config
const FALLBACK_RECIPIENT = '4MWFrMMxYyik6uhcqURym8o8fcX71L2rQHA4TQRLfLyB';

function TipJarApp() {
  const { publicKey, sendTransaction, connected } = useWallet();
  
  // App State
  const [selectedPreset, setSelectedPreset] = useState(0.5);
  const [customAmount, setCustomAmount] = useState('');
  
  const [tips, setTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [totalReceived, setTotalReceived] = useState('0.00');
  
  // Transaction State
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ status: '', type: '' });
  
  // Intent Modal State
  const [showIntent, setShowIntent] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const displayAmount = customAmount ? parseFloat(customAmount) : selectedPreset;

  // Get dynamic profile data from query params
  const searchParams = new URLSearchParams(window.location.search);
  let recipientAddress = searchParams.get('wallet');
  const urlName = searchParams.get('name');
  const urlAvatar = searchParams.get('avatar');
  
  // Validate recipient address format, otherwise use fallback
  try {
    if (recipientAddress) {
      new PublicKey(recipientAddress);
    } else {
      recipientAddress = FALLBACK_RECIPIENT;
    }
  } catch (error) {
    recipientAddress = FALLBACK_RECIPIENT;
  }

  // Effect: Load Tips
  useEffect(() => {
    async function loadTips() {
      try {
        const data = await fetchTips(recipientAddress);
        setTips(data || []);
        const sum = (data || []).reduce((acc, t) => acc + parseFloat(t.amount), 0);
        setTotalReceived(sum.toFixed(2));
      } catch (error) {
        console.error('Failed to load tips', error);
      } finally {
        setLoadingTips(false);
      }
    }
    
    loadTips();
    const intervalId = setInterval(loadTips, 15000);
    return () => clearInterval(intervalId);
  }, [recipientAddress]);

  const initiateTip = () => {
    if (!displayAmount || displayAmount <= 0) {
      setToast({ status: 'Please enter a valid amount', type: 'error' });
      return;
    }
    
    if (!connected || !publicKey) {
      setToast({ status: 'Please connect your wallet first', type: 'info' });
      return;
    }

    setShowIntent(true);
  };

  // Execute Tip
  const executeTip = async () => {
    setShowIntent(false);

    try {
      setIsSending(true);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: Math.round(displayAmount * LAMPORTS_PER_SOL),
        })
      );
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Success Path
      setToast({ status: `Successfully tipped ${displayAmount} SOL!`, type: 'success' });
      setCustomAmount('');
      
      // Trigger Confetti
      triggerConfetti();
      
      // Reload feed fast
      setTimeout(() => {
        setLoadingTips(true);
        fetchTips(recipientAddress).then(data => {
          setTips(data || []);
          const sum = (data || []).reduce((acc, t) => acc + parseFloat(t.amount), 0);
          setTotalReceived(sum.toFixed(2));
          setLoadingTips(false);
        });
      }, 2000);

    } catch (e) {
      console.error(e);
      setToast({ status: 'Transaction failed or rejected', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 4500;
    const end = Date.now() + duration;
    // Cyberpunk/Solana rich gradient colors
    const colors = ['#7c6fff', '#34d399', '#ffffff', '#f472b6', '#fbbf24', '#00f0ff'];

    // Phase 1: Massive high-velocity blast from bottom
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.95 },
      colors: colors,
      startVelocity: 65,
      gravity: 0.8,
      ticks: 350,
      zIndex: 3000
    });

    // Phase 2: Distinct mid-air fireworks bursts
    const firework = (x, y) => {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { x, y },
        colors: colors,
        startVelocity: 35,
        zIndex: 3000
      });
    };
    
    // Sequence the fireworks across the screen
    setTimeout(() => firework(0.2, 0.4), 300);
    setTimeout(() => firework(0.8, 0.3), 700);
    setTimeout(() => firework(0.5, 0.2), 1100);

    // Phase 3: Continuous elegant drifting snow/stars from the top
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 90,
        spread: 60,
        origin: { x: Math.random(), y: -0.1 },
        colors: colors,
        startVelocity: 15,
        gravity: 0.4, // floaty
        scalar: Math.random() * 1.5 + 0.5, // mixed sizes
        ticks: 300,
        zIndex: 2999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const currentName = urlName ? urlName : (recipientAddress === FALLBACK_RECIPIENT ? 'Gopal Srivastav' : 'Web3 Creator');

  return (
    <div className="app-container">
      {/* Background visual effects */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <main className="tip-card">
        {/* Profile Header */}
        <div className="profile-section" aria-live="polite" style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowEditProfile(true)}
            style={{ position: 'absolute', right: 0, top: 0, zIndex: 10, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', transition: 'color 0.2s' }}
            title="Edit Profile Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          
          <div className="avatar-initials" aria-hidden="true">
            {urlAvatar ? urlAvatar : (recipientAddress === FALLBACK_RECIPIENT ? 'GS' : '👾')}
          </div>
          <h1 className="recipient-name">
            {currentName}
          </h1>
          <div className="section-label" style={{marginBottom: 0, marginTop: '8px'}} aria-label="Recipient Wallet Address">
            Tipping to: {recipientAddress.slice(0,4)}...{recipientAddress.slice(-4)}
          </div>
        </div>

        {/* Share Link */}
        <ShareLink address={recipientAddress} />

        <div className="divider"></div>

        {/* Amount Selection */}
        <div className="section-label">Select Amount</div>
        <TipPresets 
          selected={selectedPreset}
          onSelect={setSelectedPreset}
          customAmount={customAmount}
          onCustomChange={setCustomAmount}
        />

        {/* CTA Button */}
        <div className="send-btn-wrapper">
          <SendTipButton 
            onSend={initiateTip}
            isSending={isSending}
            disabled={!connected}
          />
        </div>

        {/* Connect Wallet */}
        <div className="connect-wrapper">
          <WalletButton />
        </div>

        <div className="divider"></div>

        {/* Live Feed */}
        <TipFeed tips={tips} loading={loadingTips} />

      </main>

      {/* Intent Confirmation Modal */}
      {showIntent && (
        <IntentModal 
          amount={displayAmount}
          recipientName={currentName}
          recipientAddress={recipientAddress}
          onConfirm={executeTip}
          onCancel={() => setShowIntent(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          currentName={currentName}
          currentAvatar={urlAvatar || (recipientAddress === FALLBACK_RECIPIENT ? 'GS' : '👾')}
          currentWallet={recipientAddress}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Floating Status Notification */}
      <StatusToast 
        status={toast.status} 
        type={toast.type} 
        onClose={() => setToast({ status: '', type: '' })}
      />
    </div>
  );
}

// App Wrapper with Context Providers
function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Multiple Wallets!
  const wallets = useMemo(() => [
    new PhantomWalletAdapter({ network }),
    new SolflareWalletAdapter({ network })
  ], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TipJarApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;