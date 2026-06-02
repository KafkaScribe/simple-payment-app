import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { getInvoices, createInvoice } from '@/lib/storage';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');

  if (!authCookie || authCookie.value !== config.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoices = await getInvoices();
  return NextResponse.json(invoices);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { amountUsd, payerNote } = body;

    if (!amountUsd || typeof amountUsd !== 'number') {
      return NextResponse.json(
        { error: 'amountUsd is required and must be a number' },
        { status: 400 }
      );
    }

    const invoice = await createInvoice({
      amountUsd,
      btcAddress: config.BTC_ADDRESS,
      payerNote: payerNote || '',
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
