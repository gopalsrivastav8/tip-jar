import React from 'react';
import './IntentModal.css';

export default function IntentModal({ amount, recipientName, recipientAddress, onConfirm, onCancel }) {
  return (
    <div className="intent-overlay" role="dialog" aria-modal="true" aria-labelledby="intent-title">
      <div className="intent-content">
        <h2 id="intent-title" className="intent-title">Confirm Tip</h2>
        
        <p className="intent-msg">
          You are tipping <strong className="intent-amt">{amount} SOL</strong> to <strong className="intent-dest">{recipientName}</strong>
        </p>

        <div className="intent-wallet-preview">
          <code>{recipientAddress.slice(0,6)}...{recipientAddress.slice(-6)}</code>
        </div>

        <div className="intent-actions">
          <button className="intent-btn cancel-btn" onClick={onCancel} aria-label="Cancel tip">
            Cancel
          </button>
          <button className="intent-btn confirm-btn" onClick={onConfirm} aria-label="Confirm and sign transaction">
            Confirm & Sign
          </button>
        </div>
      </div>
    </div>
  );
}
