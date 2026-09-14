import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

export default async function handler(req, res) {
  try {
    const mod = await import('../server.js')
    const app = mod.default
    return app(req, res)
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack?.split('\n').slice(0, 5) })
  }
}
