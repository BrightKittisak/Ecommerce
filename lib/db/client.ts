import dns from 'node:dns'
import { MongoClient, ServerApiVersion } from 'mongodb'

// This approach is adapted from the official Next.js MongoDB example,
// but delayed so builds do not fail before env vars are configured.
dns.setServers(['1.1.1.1', '8.8.8.8'])

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

type GlobalMongo = typeof globalThis & {
  _mongoClient?: MongoClient
  _mongoDnsConfigured?: boolean
}

export default function getMongoClient() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('ไม่พบตัวแปรแวดล้อม MONGODB_URI')
  }

  const globalWithMongo = global as GlobalMongo

  if (!globalWithMongo._mongoDnsConfigured) {
    const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(',')
      .map((server) => server.trim())
      .filter(Boolean)

    if (dnsServers && dnsServers.length > 0) {
      dns.setServers(dnsServers)
    }

    globalWithMongo._mongoDnsConfigured = true
  }

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = new MongoClient(uri, options)
    }

    return globalWithMongo._mongoClient
  }

  return new MongoClient(uri, options)
}
