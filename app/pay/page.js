'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');

  const [btcAddress, setBtcAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Redirect if no amount
  useEffect(() => {
    if (!amount) {
      router.push('/');
    }
  }, [amount, router]);

  // Fetch BTC address from config
  useEffect(() => {
    // We'll get the BTC address from the invoice creation response
    // For now, use a default that the API will also use
    setBtcAddress(process.env.NEXT_PUBLIC_BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(btcAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = btcAddress;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [btcAddress]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(amount),
          payerNote: note || undefined,
        }),
      });
      const invoice = await res.json();
      if (res.ok) {
        router.push(`/confirmed?id=${invoice.id}&amount=${amount}`);
      } else {
        alert('Failed to create invoice. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setLoading(false);
    }
  };

  const bitcoinUri = `bitcoin:${btcAddress}?label=${encodeURIComponent(`Payment ${CASHTAG}`)}&message=${encodeURIComponent(`$${amount} USD payment`)}`;

  if (!amount) return null;

  const tagInitial = CASHTAG.replace('@', '').charAt(0).toUpperCase();

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
        <h1 className="profile-tag">{CASHTAG}</h1>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="scroll-area">
          <div className="content-container">
            <div className="card slide-up">
              <div className="card-body">
                {/* Step Indicator */}
                <div className="step-indicator">
                  <div className="step completed">
                    <span className="step-number">✓</span>
                    <span className="step-label">Amount</span>
                  </div>
                  <div className="step active">
                    <span className="step-number">2</span>
                    <span className="step-label">Pay</span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="qr-section">
                  <div className="qr-amount-display">${parseFloat(amount).toFixed(2)}</div>
                  <div className="qr-amount-label">Scan to pay with Bitcoin</div>

                  <div className="qr-wrapper">
                    <QRCodeSVG
                      value={bitcoinUri}
                      size={200}
                      level="M"
                      bgColor="white"
                      fgColor="#1A1A2E"
                      style={{ display: 'block' }}
                    />
                    <div className="qr-overlay-icon">₿</div>
                  </div>

                  {/* BTC Address */}
                  <div className="btc-address-section">
                    <div className="btc-address-label">Bitcoin Address</div>
                    <div className="btc-address-box">
                      <span className="btc-address-text">{btcAddress}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`copy-btn${copied ? ' copied' : ''}`}
                      >
                        {copied ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="qr-timer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Payment window: {formatTime(timeLeft)}
                  </div>

                  {/* Note */}
                  <div className="note-section">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note (optional)"
                      className="note-input"
                      maxLength={200}
                    />
                  </div>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={loading}
            className="submit-btn submit-btn-orange"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                I&apos;ve Sent the Payment
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="secondary-btn"
          >
            ← Back to amount
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'rgba(247,147,26,0.2)', borderTopColor: '#F7931A', width: '2rem', height: '2rem' }} />
      </div>
    }>
      <PayPageContent />
    </Suspense>
  );
}
