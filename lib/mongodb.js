import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

let client;
let clientPromise;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    // In development, use a global variable so the client is not recreated on every hot reload
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production, create a new client for each instance
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
}

export default async function getClient() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }
  return clientPromise;
}
