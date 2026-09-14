import mongoose from 'mongoose'

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

export default async function handler(req, res) {
  const results = {
    mongodb: { status: 'unknown', error: null, latency: null },
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET (hidden)' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      CLOUDINARY: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
    },
    vercel: {
      VERCEL: process.env.VERCEL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      region: process.env.VERCEL_REGION || 'NOT SET',
    },
  }

  // Test MongoDB connection
  try {
    const start = Date.now()
    if (!cached.conn) {
      cached.conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
    }
    await cached.conn.asPromise()
    const db = cached.conn.connection.db

    // Run a simple ping
    await db.admin().ping()
    const latency = Date.now() - start

    // List collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)

    // Count documents in each collection
    const counts = {}
    for (const name of collectionNames) {
      counts[name] = await db.collection(name).countDocuments()
    }

    results.mongodb = { status: 'CONNECTED', error: null, latency: `${latency}ms` }
    results.database = {
      name: db.databaseName,
      collections: collectionNames,
      documentCounts: counts,
    }
  } catch (err) {
    results.mongodb = { status: 'FAILED', error: err.message, latency: null }
  }

  res.status(200).json(results)
}
