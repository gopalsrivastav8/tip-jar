import React from 'react';
import './SendTipButton.css';

export default function SendTipButton({ onSend, isSending, disabled }) {
  return (
    <button 
      className={`send-tip-btn ${isSending ? 'sending' : ''}`}
      onClick={onSend}
      disabled={disabled || isSending}
    >
      {isSending ? (
        <div className="spinner-wrapper">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
          </svg>
          Sending...
        </div>
      ) : (
        <span>Send Tip</span>
      )}
    </button>
  );
}
