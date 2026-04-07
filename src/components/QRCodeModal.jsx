import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import './QRCodeModal.css';

export default function QRCodeModal({ address, onClose }) {
  const [qrSrc, setQrSrc] = useState('');
  
  // Solana Pay specification formula
  const qrValue = `solana:${address}`;

  useEffect(() => {
    // Generate QR code as a data URL
    QRCode.toDataURL(qrValue, { 
      width: 240, 
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
    .then(url => setQrSrc(url))
    .catch(console.error);

    // Screen Wake Lock API
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };
    
    requestWakeLock();

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [qrValue]);

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="qr-close-btn" onClick={onClose} aria-label="Close QR Code">×</button>
        
        <div className="qr-header">
          <h3>Scan to Tip</h3>
          <p>Scan this code using Phantom mobile or any Solana Pay compatible wallet.</p>
        </div>

        <div className="qr-box">
          {qrSrc ? (
            <img src={qrSrc} alt="Solana Pay Request QR Code" width="240" height="240" />
          ) : (
            <div style={{width: 240, height: 240, background: '#eee', borderRadius: 8}}></div>
          )}
        </div>
        
        <div className="qr-footer">
          <code>{address.slice(0, 8)}...{address.slice(-8)}</code>
        </div>
      </div>
    </div>
  );
}
