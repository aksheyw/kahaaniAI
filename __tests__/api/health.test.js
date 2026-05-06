// Contract tests for /api/health
// Pattern (from ai-regression-testing skill): assert response shape, not implementation.

import { describe, it, expect, beforeEach } from 'vitest'
import handler from '../../api/health.js'
import { callHandler } from '../helpers.js'

const REQUIRED_FIELDS = ['status', 'service', 'timestamp', 'checks']
const REQUIRED_CHECKS = ['llm_key_configured', 'provider', 'node_env']

describe('GET /api/health', () => {
  beforeEach(() => {
    process.env.KAHAANI_AI_OPENROUTER_API_KEY = 'test-key-not-real'
  })

  it('returns 200 when API key is configured', async () => {
    const { status, body } = await callHandler(handler, { method: 'GET' })
    expect(status).toBe(200)
    expect(body.status).toBe('ok')
  })

  it('returns 503 when API key is missing (degraded mode)', async () => {
    delete process.env.KAHAANI_AI_OPENROUTER_API_KEY
    const { status, body } = await callHandler(handler, { method: 'GET' })
    expect(status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.checks.llm_key_configured).toBe(false)
  })

  it('response includes all required top-level fields', async () => {
    const { body } = await callHandler(handler, { method: 'GET' })
    for (const field of REQUIRED_FIELDS) {
      expect(body, `missing field: ${field}`).toHaveProperty(field)
    }
  })

  it('checks object includes all required keys', async () => {
    const { body } = await callHandler(handler, { method: 'GET' })
    for (const key of REQUIRED_CHECKS) {
      expect(body.checks, `missing check: ${key}`).toHaveProperty(key)
    }
  })

  it('sets CORS and cache headers', async () => {
    const { headers } = await callHandler(handler, { method: 'GET' })
    expect(headers['Access-Control-Allow-Origin']).toBe('*')
    expect(headers['Cache-Control']).toBe('no-store')
  })
})
