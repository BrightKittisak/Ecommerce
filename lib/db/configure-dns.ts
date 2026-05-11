import dns from 'node:dns'

type GlobalDnsConfig = typeof globalThis & {
  _mongoDnsConfigured?: boolean
}

export function configureMongoDns() {
  const globalWithDns = global as GlobalDnsConfig

  if (globalWithDns._mongoDnsConfigured) return

  dns.setServers(['1.1.1.1', '8.8.8.8'])

  const dnsServers =
    process.env.MONGODB_DNS_SERVERS?.split(',')
      .map((server) => server.trim())
      .filter(Boolean) ?? []

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers)
  }

  globalWithDns._mongoDnsConfigured = true
}
