'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || 'cute_girl';

function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id');
  const amount = searchParams.get('amount');

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) {
      router.push('/');
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        }
      } catch {
        // Silently fail — we still show the confirmation with URL params
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  if (!invoiceId) return null;

  const tagInitial = CASHTAG.replace('@', '').charAt(0).toUpperCase();

  const displayAmount = invoice?.amountUsd || amount || '0';
  const displayDate = invoice?.createdAt
    ? new Date(invoice.createdAt).toLocaleString()
    : new Date().toLocaleString();
  const displayId = invoiceId;

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
                  <div className="step completed">
                    <span className="step-number">✓</span>
                    <span className="step-label">Pay</span>
                  </div>
                </div>

                {/* Confirmation Section */}
                <div className="confirmation-section">
                  <div className="success-icon-wrapper">
                    <div className="success-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div className="success-ripple"></div>
                  </div>

                  <h2 className="confirmation-title">Payment Submitted!</h2>
                  <p className="confirmation-subtitle">
                    Your payment of <strong>${parseFloat(displayAmount).toFixed(2)}</strong> has been recorded. 
                    We&apos;ll confirm once the transaction is verified on the Bitcoin network.
                  </p>

                  {/* Invoice Summary */}
                  {!loading && (
                    <div className="invoice-summary fade-in">
                      <div className="invoice-row">
                        <span className="invoice-row-label">Invoice ID</span>
                        <span className="invoice-row-value mono">{displayId.substring(0, 8)}…</span>
                      </div>
                      <div className="invoice-row">
                        <span className="invoice-row-label">Amount</span>
                        <span className="invoice-row-value">${parseFloat(displayAmount).toFixed(2)} USD</span>
                      </div>
                      <div className="invoice-row">
                        <span className="invoice-row-label">Status</span>
                        <span className="invoice-row-value" style={{ color: '#F59E0B' }}>Pending</span>
                      </div>
                      <div className="invoice-row">
                        <span className="invoice-row-label">Date</span>
                        <span className="invoice-row-value">{displayDate}</span>
                      </div>
                      {invoice?.btcAddress && (
                        <div className="invoice-row">
                          <span className="invoice-row-label">BTC Address</span>
                          <span className="invoice-row-value mono">{invoice.btcAddress.substring(0, 12)}…</span>
                        </div>
                      )}
                      {invoice?.payerNote && (
                        <div className="invoice-row">
                          <span className="invoice-row-label">Note</span>
                          <span className="invoice-row-value">{invoice.payerNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
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
        <div className="footer-container">
          <Link href="/" className="submit-btn" style={{ textDecoration: 'none' }}>
            Make Another Payment
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'rgba(247,147,26,0.2)', borderTopColor: '#F7931A', width: '2rem', height: '2rem' }} />
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  );
}
