import React, { useState } from 'react';
import QRCodeModal from './QRCodeModal';
import './ShareLink.css';

export default function ShareLink({ address }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Construct dynamic URL preserving other query params
  const currentParams = new URLSearchParams(window.location.search);
  currentParams.set('wallet', address);
  const shareUrl = `${window.location.origin}/?${currentParams.toString()}`;
  
  // Truncate URL just for display
  const displayUrl = `${window.location.host}/?wallet=${address.slice(0, 4)}...`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-link-wrapper">
      <div className="share-label">Your Shareable Link</div>
      <div className="share-box" onClick={copyToClipboard} role="button" tabIndex={0}>
        <span className="share-url">{displayUrl}</span>
        <div className="share-actions">
          <button className="action-btn" onClick={(e) => { e.stopPropagation(); setShowQR(true); }} title="Show QR Code">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          
          <div className="action-divider"></div>

          <button className="action-btn copy-btn" onClick={copyToClipboard} title="Copy Link">
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {showQR && <QRCodeModal address={address} onClose={() => setShowQR(false)} />}
    </div>
  );
}
