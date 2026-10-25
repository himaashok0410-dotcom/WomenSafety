import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SOSButton({ onActivate, disabled }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const holdDurationMs = 2500; // 2.5 seconds hold
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startHold = (e) => {
    if (disabled) return;
    if (e.cancelable) e.preventDefault();
    setHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / holdDurationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(0);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        onActivate();
      }
    }, 40);
  };

  const cancelHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Circumference for 144px SVG ring (radius = 70)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="sos-button-wrapper">
      <div className="sos-pulse-ring"></div>

      {/* Radial Progress Ring */}
      <svg className="sos-progress-svg" viewBox="0 0 160 160">
        <circle
          className="sos-progress-circle-bg"
          cx="80"
          cy="80"
          r={radius}
        />
        <circle
          className="sos-progress-circle-active"
          cx="80"
          cy="80"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      <button
        type="button"
        className="sos-hold-btn"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        disabled={disabled}
        aria-label="Hold for 2.5 seconds to trigger SOS"
      >
        <AlertTriangle size={32} strokeWidth={2.6} style={{ marginBottom: '2px' }} />
        <span>SOS</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.9 }}>
          {holding ? `${Math.round(progress)}%` : 'HOLD 2.5s'}
        </span>
      </button>
    </div>
  );
}
