import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

// This handler must never be cached or prerendered — every call generates a
// fresh, single-use Lightning invoice at a live exchange rate.
export const dynamic = 'force-dynamic';

// Fetch the current BTC/USD spot price.
async function getBtcUsd() {
  const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Could not fetch the BTC price');
  const data = await res.json();
  const price = parseFloat(data?.data?.amount);
  if (!price || isNaN(price)) throw new Error('Invalid BTC price response');
  return price;
}

// Resolve a Lightning Address (name@domain) via LNURL-pay and request a
// BOLT11 invoice for the given amount in millisatoshis.
async function requestInvoice(lnAddress, amountMsat) {
  const [name, domain] = lnAddress.split('@');
  if (!name || !domain) throw new Error('Invalid Lightning Address configured');

  // 1. Look up the receiver's LNURL-pay parameters.
  const metaRes = await fetch(`https://${domain}/.well-known/lnurlp/${name}`, {
    cache: 'no-store',
  });
  if (!metaRes.ok) throw new Error('Could not resolve the Lightning Address');
  const meta = await metaRes.json();
  if (meta.tag !== 'payRequest' || !meta.callback) {
    throw new Error('This Lightning Address does not accept payments');
  }

  // 2. Make sure the amount is within the receiver's accepted range.
  if (amountMsat < meta.minSendable || amountMsat > meta.maxSendable) {
    const min = Math.ceil(meta.minSendable / 1000);
    const max = Math.floor(meta.maxSendable / 1000);
    throw new Error(`This wallet only accepts ${min}–${max} sats per payment`);
  }

  // 3. Request the actual invoice.
  const sep = meta.callback.includes('?') ? '&' : '?';
  const invRes = await fetch(`${meta.callback}${sep}amount=${amountMsat}`, {
    cache: 'no-store',
  });
  if (!invRes.ok) throw new Error('Could not generate the invoice');
  const inv = await invRes.json();
  if (!inv.pr) throw new Error(inv.reason || 'No invoice was returned');
  return inv.pr;
}

export async function POST(request) {
  if (!config.LN_ADDRESS) {
    return NextResponse.json(
      { error: 'Lightning payments are not set up yet.' },
      { status: 503 }
    );
  }

  let amountUsd;
  try {
    ({ amountUsd } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  amountUsd = parseFloat(amountUsd);
  if (!amountUsd || isNaN(amountUsd)) {
    return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 });
  }
  if (amountUsd < config.MIN_AMOUNT || amountUsd > config.MAX_AMOUNT) {
    return NextResponse.json(
      { error: `Amount must be between $${config.MIN_AMOUNT} and $${config.MAX_AMOUNT}` },
      { status: 400 }
    );
  }

  try {
    const btcUsd = await getBtcUsd();
    const sats = Math.round((amountUsd / btcUsd) * 1e8);
    const invoice = await requestInvoice(config.LN_ADDRESS, sats * 1000);
    return NextResponse.json({ invoice, sats, btcUsd, amountUsd });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to create the invoice' },
      { status: 502 }
    );
  }
}
