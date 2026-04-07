import React, { useEffect } from 'react';
import './StatusToast.css';

export default function StatusToast({ status, type, onClose }) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!status) return null;

  const icons = {
    success: '🎉',
    error: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`status-toast ${type}`}>
      <span className="toast-icon">{icons[type] || 'ℹ️'}</span>
      <span className="toast-msg">{status}</span>
    </div>
  );
}
