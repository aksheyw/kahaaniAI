// Health check endpoint for Kahaani AI
// GET /api/health — verifies deployment and config

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
  const healthy = hasOpenAIKey

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'Kahaani AI',
    timestamp: new Date().toISOString(),
    checks: {
      openai_key_configured: hasOpenAIKey,
      node_env: process.env.NODE_ENV || 'unknown',
    },
  })
}
