import React from 'react';
import './TipFeed.css';

export default function TipFeed({ tips, loading }) {
  return (
    <div className="tip-feed">
      <div className="feed-header">
        <span className="feed-title">Recent Tips</span>
        <span className="live-badge">
          <span className="live-dot"></span> LIVE
        </span>
      </div>

      <div className="feed-list">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="tip-row skeleton">
              <div className="skeleton-left">
                <div className="skel-line w-24"></div>
                <div className="skel-line w-16 subtle"></div>
              </div>
              <div className="skel-line w-16"></div>
            </div>
          ))
        ) : tips.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">☕</span>
            <p>No tips yet. Be the first!</p>
          </div>
        ) : (
          tips.slice(0, 5).map((t, i) => (
            <div key={i} className="tip-row" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="tip-details">
                <span className="tip-from">{t.from}</span>
                <span className="tip-time">{t.time}</span>
              </div>
              <div className="tip-amount">+{t.amount} SOL</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
