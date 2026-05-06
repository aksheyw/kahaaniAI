// Health check endpoint for Kahaani AI
// GET /api/health — verifies deployment and config

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  const hasApiKey = Boolean(process.env.KAHAANI_AI_OPENROUTER_API_KEY)

  return res.status(hasApiKey ? 200 : 503).json({
    status: hasApiKey ? 'ok' : 'degraded',
    service: 'Kahaani AI',
    timestamp: new Date().toISOString(),
    checks: {
      llm_key_configured: hasApiKey,
      provider: 'OpenRouter',
      node_env: process.env.NODE_ENV || 'unknown',
    },
  })
}
