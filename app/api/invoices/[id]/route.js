import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { getInvoice, updateInvoice, deleteInvoice } from '@/lib/storage';

export async function GET(request, { params }) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function PATCH(request, { params }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');

  if (!authCookie || authCookie.value !== config.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = await updateInvoice(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');

  if (!authCookie || authCookie.value !== config.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteInvoice(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
