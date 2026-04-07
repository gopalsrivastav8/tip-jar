import React from 'react';
import './TipPresets.css';

export default function TipPresets({ selected, onSelect, customAmount, onCustomChange }) {
  const presets = [0.1, 0.5, 1.0];

  return (
    <div className="tip-presets-container">
      <div className="presets-grid">
        {presets.map((amt) => {
          const isSelected = selected === amt && !customAmount;
          return (
            <button
              key={amt}
              className={`preset-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                onSelect(amt);
                onCustomChange('');
              }}
            >
              <span className="amt">{amt}</span>
              <span className="currency">SOL</span>
            </button>
          );
        })}
      </div>
      
      <div className="custom-input-wrapper">
        <input
          type="number"
          className={`custom-input ${customAmount ? 'active' : ''}`}
          placeholder="Custom Amount"
          value={customAmount}
          onChange={(e) => onCustomChange(e.target.value)}
          min="0"
          step="0.01"
        />
        <span className="input-suffix">SOL</span>
      </div>
    </div>
  );
}
