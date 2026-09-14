export default async function handler(req, res) {
  try {
    const { default: createApp } = await import('../server.js')
    return createApp(req, res)
  } catch (err) {
    return res.status(500).json({ 
      error: err.message, 
      stack: err.stack?.split('\n').slice(0, 5),
      path: req.url,
      method: req.method
    })
  }
}
