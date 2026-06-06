'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const QUICK_AMOUNTS = [10, 15, 20, 25];
const MORE_AMOUNTS = [50, 75, 100, 150, 200];
const MIN_AMOUNT = parseInt(process.env.NEXT_PUBLIC_MIN_AMOUNT || '10');
const MAX_AMOUNT = parseInt(process.env.NEXT_PUBLIC_MAX_AMOUNT || '2000');
const BTC_ADDRESS = process.env.NEXT_PUBLIC_BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

export default function TagPage() {
  const router = useRouter();
  const params = useParams();
  const fallbackTimer = useRef(null);

  // Extract tag from URL: "$@Payment" -> "Payment"
  const rawTag = decodeURIComponent(params.tag || '');
  const displayName = rawTag.replace(/^[\$@]+/, '');

  const [amount, setAmount] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [selectedQuick, setSelectedQuick] = useState(null);
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
    setSelectedQuick(null);
    setError('');
  };

  const handleQuickAmount = (value) => {
    setAmount(String(value));
    setSelectedQuick(value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount)) {
      setError('Please enter an amount');
      return;
    }
    if (numAmount < MIN_AMOUNT) {
      setError(`Minimum amount is $${MIN_AMOUNT}`);
      return;
    }
    if (numAmount > MAX_AMOUNT) {
      setError(`Maximum amount is $${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    // Try to open wallet app via bitcoin: URI
    window.location.href = `bitcoin:${BTC_ADDRESS}`;

    // If wallet doesn't open after 2.5s, fallback to QR code page
    fallbackTimer.current = setTimeout(() => {
      if (!document.hidden) {
        router.push(`/pay?amount=${numAmount}`);
      }
    }, 2500);
  };

  // If page becomes hidden (wallet opened), cancel fallback
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const tagInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">₿</div>
        <div className="secure-badge">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Secure
        </div>
      </header>

      {/* Profile */}
      <div className="profile-section fade-in">
        <div className="profile-avatar">{tagInitial}</div>
        <h1 className="profile-tag">{displayName}</h1>
        <p className="profile-notice">
          Pay securely with Bitcoin.
          <strong>Tap Pay now below to pay.</strong>
        </p>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="scroll-area">
          <div className="content-container">
            <div className="card slide-up">
              <div className="card-body">
                {/* Step Indicator */}
                <div className="step-indicator">
                  <div className="step active">
                    <span className="step-number">1</span>
                    <span className="step-label">Amount</span>
                  </div>
                  <div className="step inactive">
                    <span className="step-number">2</span>
                    <span className="step-label">Pay</span>
                  </div>
                </div>

                {/* Instant Badge */}
                <div className="instant-badge">
                  <div className="instant-badge-icon">₿</div>
                  <p className="instant-badge-text">Instant</p>
                </div>

                {/* Amount Form */}
                <form id="payment-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="amount_usd" className="form-label">Select amount</label>
                    <div className="amount-input-wrapper">
                      <span className="amount-prefix">$</span>
                      <input
                        id="amount_usd"
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        required
                        className="amount-input"
                        placeholder="0.00"
                        autoComplete="off"
                      />
                    </div>
                    {error ? (
                      <p className="amount-error">{error}</p>
                    ) : (
                      <p className="amount-hint">
                        Between {MIN_AMOUNT} and {MAX_AMOUNT.toLocaleString()} USD.
                      </p>
                    )}
                  </div>

                  {/* Quick Amounts */}
                  <div className="quick-amounts-section">
                    <p className="quick-amounts-label">Quick amounts</p>
                    <div className="quick-amounts-grid">
                      {QUICK_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleQuickAmount(val)}
                          className={`quick-amount-btn${selectedQuick === val ? ' selected' : ''}`}
                        >
                          ${val}
                        </button>
                      ))}
                    </div>

                    <div className={`more-amounts ${showMore ? 'expanded' : 'collapsed'}`}>
                      <div className="quick-amounts-grid" style={{ marginTop: '0.5rem' }}>
                        {MORE_AMOUNTS.map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleQuickAmount(val)}
                            className={`quick-amount-btn${selectedQuick === val ? ' selected' : ''}`}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMore(!showMore)}
                      className="toggle-more-btn"
                    >
                      {showMore ? 'Fewer amounts' : 'More amounts'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Footer - Trust Badges */}
              <div className="card-footer">
                <div className="trust-badges">
                  <span className="trust-badge">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Secure
                  </span>
                  <span className="trust-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 14.25 2.25 12 10.5h6.75L3.75 22.5l2.25-9H3.75Z" />
                    </svg>
                    Instant
                  </span>
                </div>
                <p className="disclaimer">Powered by Bitcoin Network</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Submit Button */}
      <footer className="app-footer">
        <div className="footer-container">
          <button
            type="submit"
            form="payment-form"
            className="submit-btn"
            disabled={!amount}
          >
            Continue to payment
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
