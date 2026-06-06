'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');

  const [btcAddress, setBtcAddress] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [walletAttempted, setWalletAttempted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const timerRef = useRef(null);

  // Redirect if no amount
  useEffect(() => {
    if (!amount) {
      router.push('/');
    }
  }, [amount, router]);

  // Fetch BTC address
  useEffect(() => {
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

  const bitcoinUri = btcAddress ? `bitcoin:${btcAddress}` : '';

  const handleOpenWallet = () => {
    setWalletAttempted(true);

    // Try to open the bitcoin: URI
    window.location.href = bitcoinUri;

    // After 2.5 seconds, if the page is still visible (no app opened),
    // show the QR code as fallback
    timerRef.current = setTimeout(() => {
      if (!document.hidden) {
        setShowQR(true);
      }
    }, 2500);
  };

  // If page becomes hidden (wallet app opened), clear the fallback timer
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

                <div className="qr-section">
                  {/* Amount Display */}
                  <div className="qr-amount-display">${parseFloat(amount).toFixed(2)}</div>

                  {!showQR ? (
                    <>
                      {/* Open Wallet Button */}
                      <div className="qr-amount-label">
                        {walletAttempted
                          ? 'Opening your wallet app...'
                          : 'Tap below to pay with your wallet app'}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', padding: '2rem 0' }}>
                        <button
                          type="button"
                          onClick={handleOpenWallet}
                          className="submit-btn submit-btn-orange"
                          style={{ width: '100%', maxWidth: '320px' }}
                          disabled={!btcAddress}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                          </svg>
                          Open Wallet &amp; Pay
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowQR(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontFamily: 'inherit',
                          }}
                        >
                          Show QR Code instead
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* QR Code Fallback */}
                      <div className="qr-amount-label">Scan to pay</div>

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
                    </>
                  )}

                  {/* Timer */}
                  <div className="qr-timer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Payment window: {formatTime(timeLeft)}
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

