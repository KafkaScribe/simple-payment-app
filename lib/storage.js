import getClient from './mongodb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'cashpay';
const COLLECTION_NAME = 'invoices';

async function getCollection() {
  const client = await getClient();
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

/**
 * Returns all invoices sorted by createdAt descending.
 */
export async function getInvoices() {
  const collection = await getCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

/**
 * Returns a single invoice by id, or null if not found.
 */
export async function getInvoice(id) {
  const collection = await getCollection();
  return collection.findOne({ id });
}

/**
 * Creates a new invoice and returns it.
 */
export async function createInvoice({ amountUsd, btcAddress, payerNote }) {
  const collection = await getCollection();

  const newInvoice = {
    id: uuidv4(),
    amountUsd,
    btcAddress,
    createdAt: new Date().toISOString(),
    status: 'pending',
    payerNote: payerNote || '',
  };

  await collection.insertOne(newInvoice);
  return newInvoice;
}

/**
 * Partially updates an invoice. Returns the updated invoice or null.
 */
export async function updateInvoice(id, updates) {
  const collection = await getCollection();

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );

  return result || null;
}

/**
 * Deletes an invoice by id. Returns true if deleted, false if not found.
 */
export async function deleteInvoice(id) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}
