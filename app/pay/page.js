'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');

  const [btcAddress, setBtcAddress] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!btcAddress) return;
    try {
      await navigator.clipboard.writeText(btcAddress);
    } catch {
      // Fallback for browsers without the async clipboard API
      const ta = document.createElement('textarea');
      ta.value = btcAddress;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWallet = () => {
    if (bitcoinUri) window.location.href = bitcoinUri;
  };

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
                  <div className="qr-amount-label">Scan with your wallet, or copy the address below</div>

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

                  {/* Timer */}
                  <div className="qr-timer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Payment window: {formatTime(timeLeft)}
                  </div>

                  {/* Bitcoin address with copy */}
                  <div className="btc-address-section">
                    <div className="btc-address-label">Bitcoin address</div>
                    <div className="btc-address-box">
                      <span className="btc-address-text">{btcAddress}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`copy-btn${copied ? ' copied' : ''}`}
                        aria-label="Copy Bitcoin address"
                      >
                        {copied ? (
                          <>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
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
            onClick={handleOpenWallet}
            className="submit-btn submit-btn-orange"
          >
            Open in wallet app
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
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

