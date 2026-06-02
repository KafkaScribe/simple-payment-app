'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices');

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch {
      console.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function handleConfirm(id) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (res.ok) {
        fetchInvoices();
      }
    } catch {
      console.error('Failed to confirm invoice');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 204) {
        setExpandedId(null);
        fetchInvoices();
      }
    } catch {
      console.error('Failed to delete invoice');
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      console.error('Logout failed');
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const totalInvoices = invoices.length;
  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length;
  const confirmedCount = invoices.filter((inv) => inv.status === 'confirmed').length;
  const totalUsd = invoices.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatUsd(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-logo">₿</div>
          <h1 className="admin-title">Invoice Dashboard</h1>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="admin-body">
        {/* Summary Cards */}
        <div className="admin-summary">
          <div className="admin-summary-card">
            <span className="admin-summary-value">{totalInvoices}</span>
            <span className="admin-summary-label">Total Invoices</span>
          </div>
          <div className="admin-summary-card">
            <span className="admin-summary-value orange">{pendingCount}</span>
            <span className="admin-summary-label">Pending</span>
          </div>
          <div className="admin-summary-card">
            <span className="admin-summary-value green">{confirmedCount}</span>
            <span className="admin-summary-label">Confirmed</span>
          </div>
          <div className="admin-summary-card">
            <span className="admin-summary-value orange">{formatUsd(totalUsd)}</span>
            <span className="admin-summary-label">Total USD</span>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          {['all', 'pending', 'confirmed'].map((f) => (
            <button
              key={f}
              className={`admin-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' ? ` (${totalInvoices})` : f === 'pending' ? ` (${pendingCount})` : ` (${confirmedCount})`}
            </button>
          ))}

          {/* Refresh button */}
          <button
            className="admin-filter-btn"
            onClick={() => { setLoading(true); fetchInvoices(); }}
            title="Refresh"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📋</div>
            <p className="admin-empty-text">No invoices found</p>
            <p className="admin-empty-subtext">
              {filter === 'all'
                ? 'Invoices will appear here when customers make payments.'
                : `No ${filter} invoices right now.`}
            </p>
          </div>
        ) : (
          <div className="admin-table">
            {/* Desktop Table Header */}
            <div className="admin-table-header">
              <span>Invoice ID</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {filteredInvoices.map((inv) => (
              <div key={inv.id}>
                {/* Invoice Row */}
                <div
                  className="admin-invoice-row"
                  onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="admin-invoice-id" data-label="ID" title={inv.id}>
                    {inv.id.substring(0, 8)}…
                  </span>
                  <span className="admin-invoice-amount" data-label="Amount">
                    {formatUsd(inv.amountUsd)}
                  </span>
                  <span data-label="Status">
                    <span className={`admin-badge ${inv.status}`}>
                      {inv.status}
                    </span>
                  </span>
                  <span className="admin-invoice-date" data-label="Date">
                    {formatDate(inv.createdAt)}
                  </span>
                  <span className="admin-actions" data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    {inv.status === 'pending' && (
                      <button
                        className="admin-action-btn confirm"
                        onClick={() => handleConfirm(inv.id)}
                      >
                        ✓ Confirm
                      </button>
                    )}
                    <button
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(inv.id)}
                    >
                      ✕ Delete
                    </button>
                  </span>
                </div>

                {/* Expanded Detail */}
                {expandedId === inv.id && (
                  <div className="admin-invoice-detail">
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Full Invoice ID</span>
                      <span className="admin-detail-value mono">{inv.id}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">BTC Address</span>
                      <span className="admin-detail-value mono">{inv.btcAddress}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Amount</span>
                      <span className="admin-detail-value">{formatUsd(inv.amountUsd)}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Status</span>
                      <span className="admin-detail-value">
                        <span className={`admin-badge ${inv.status}`}>{inv.status}</span>
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Created</span>
                      <span className="admin-detail-value">{formatDate(inv.createdAt)}</span>
                    </div>
                    {inv.payerNote && (
                      <div className="admin-detail-row">
                        <span className="admin-detail-label">Payer Note</span>
                        <span className="admin-detail-value">{inv.payerNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
