// Contract tests for /api/generate
// Strategy: test input validation + early-return paths without invoking the LLM.
// LLM calls are mocked. This catches regressions in:
//   - Method/CORS handling
//   - Input validation (mode/language defaults)
//   - Configuration errors

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import handler from '../../api/generate.js'
import { callHandler } from '../helpers.js'

describe('/api/generate — handshake & validation', () => {
  beforeEach(() => {
    process.env.KAHAANI_AI_OPENROUTER_API_KEY = 'test-key-not-real'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('OPTIONS request returns 200 with CORS headers', async () => {
    const { status, headers } = await callHandler(handler, { method: 'OPTIONS' })
    expect(status).toBe(200)
    expect(headers['Access-Control-Allow-Origin']).toBeDefined()
    expect(headers['Access-Control-Allow-Methods']).toContain('POST')
  })

  it('GET request returns 405 (POST only)', async () => {
    const { status, body } = await callHandler(handler, { method: 'GET' })
    expect(status).toBe(405)
    expect(body.error).toContain('POST')
  })

  it('returns 500 when API key not configured', async () => {
    delete process.env.KAHAANI_AI_OPENROUTER_API_KEY
    // Stub fetch so it doesn't matter — we should never reach it
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ text: () => Promise.resolve('') })

    const { status, body } = await callHandler(handler, {
      method: 'POST',
      body: { mode: 'inform', language: 'en' },
    })
    expect(status).toBe(500)
    expect(body.error).toBeDefined()
  })
})
