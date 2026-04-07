import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './IntentModal.css'; // We can reuse the modal styling

export default function EditProfileModal({ currentName, currentAvatar, currentWallet, onClose }) {
  const { publicKey } = useWallet();
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar || '👾');
  
  // Default to connected wallet if no custom wallet passed
  const defaultWallet = currentWallet !== '4MWFrMMxYyik6uhcqURym8o8fcX71L2rQHA4TQRLfLyB' 
    ? currentWallet 
    : (publicKey ? publicKey.toString() : '');
    
  const [wallet, setWallet] = useState(defaultWallet);

  const handleSave = () => {
    const params = new URLSearchParams(window.location.search);
    if (name) params.set('name', name);
    if (avatar) params.set('avatar', avatar);
    if (wallet) params.set('wallet', wallet);

    // Navigate to the new URL instantly
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="intent-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className="intent-content" style={{maxWidth: '400px', textAlign: 'left'}}>
        <h2 id="edit-profile-title" className="intent-title" style={{textAlign: 'center'}}>Customize Tip Jar</h2>
        <p className="intent-msg" style={{textAlign: 'center', marginBottom: '24px'}}>
          Setup your profile details to generate your personal share link.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Display Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Satoshi"
            style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '15px'}}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avatar Emoji</label>
          <input 
            type="text" 
            value={avatar} 
            onChange={(e) => setAvatar(e.target.value)}
            maxLength={2}
            placeholder="e.g. 🐼"
            style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '15px'}}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Receiving Solana Address</label>
          <input 
            type="text" 
            value={wallet} 
            onChange={(e) => setWallet(e.target.value)} 
            placeholder="Solana Wallet Address"
            style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'monospace'}}
          />
        </div>

        <div className="intent-actions">
          <button className="intent-btn cancel-btn" onClick={onClose} aria-label="Cancel">
            Cancel
          </button>
          <button className="intent-btn confirm-btn" onClick={handleSave} aria-label="Save Profile">
            Save & Update Link
          </button>
        </div>
      </div>
    </div>
  );
}
