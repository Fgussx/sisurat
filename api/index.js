export default function handler(req, res) {
  if (req.method === 'POST' && req.url === '/api/login') {
    return res.status(200).json({ test: true, message: 'Function works!' })
  }
  return res.status(200).json({ test: true, url: req.url })
}
