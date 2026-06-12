'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');

  const [invoice, setInvoice] = useState('');
  const [sats, setSats] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [reloadKey, setReloadKey] = useState(0);

  // Redirect if no amount
  useEffect(() => {
    if (!amount) router.push('/');
  }, [amount, router]);

  // Generate a Lightning invoice for this amount
  useEffect(() => {
    if (!amount) return;
    let cancelled = false;

    const generate = async () => {
      setStatus('loading');
      try {
        const res = await fetch('/api/lightning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountUsd: parseFloat(amount) }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not create the payment.');
          setStatus('error');
          return;
        }
        setInvoice(data.invoice);
        setSats(data.sats);
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setErrorMsg('Network error. Please try again.');
          setStatus('error');
        }
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [amount, reloadKey]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? (clearInterval(timer), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!amount) return null;

  const lightningUri = invoice ? `lightning:${invoice}` : '';
  const cashAppUrl = invoice ? `https://cash.app/launch/lightning/${invoice}` : '';
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
                  {sats != null && (
                    <div className="qr-amount-label">
                      ≈ {sats.toLocaleString()} sats over Lightning
                    </div>
                  )}

                  {status === 'loading' && (
                    <div style={{ padding: '2.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div className="spinner" style={{ borderColor: 'rgba(247,147,26,0.2)', borderTopColor: '#F7931A', width: '2.25rem', height: '2.25rem' }} />
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-secondary)' }}>
                        Generating secure invoice…
                      </p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                      <p className="amount-error" style={{ marginBottom: '1rem' }}>{errorMsg}</p>
                    </div>
                  )}

                  {status === 'ready' && (
                    <>
                      <div className="qr-wrapper">
                        <QRCodeSVG
                          value={lightningUri}
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
                        Invoice expires in {formatTime(timeLeft)}
                      </div>
                    </>
                  )}
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
          {status === 'ready' && (
            <a href={cashAppUrl} className="submit-btn submit-btn-orange" style={{ textDecoration: 'none' }}>
              Open in Cash App
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
          {status === 'error' && (
            <button
              type="button"
              onClick={() => { setTimeLeft(15 * 60); setReloadKey((k) => k + 1); }}
              className="submit-btn submit-btn-orange"
            >
              Try again
            </button>
          )}
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
