import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import './WalletButton.css';

export default function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  // Shorten address for display
  const shortAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <button 
        className="custom-wallet-btn connect-mode" 
        onClick={() => setVisible(true)}
      >
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="custom-wallet-btn connected-mode">
      <div className="status-indicator">
        <span className="dot"></span>
      </div>
      <span className="address" onClick={handleCopy}>
        {copied ? 'Copied!' : shortAddress}
      </span>
      <button className="disconnect-btn" onClick={disconnect} title="Disconnect">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
