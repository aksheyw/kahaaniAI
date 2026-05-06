// Test environment setup
// Set a placeholder API key so handlers don't 503 in tests.
// Real LLM calls are mocked per-test via vi.spyOn(globalThis, 'fetch').
process.env.KAHAANI_AI_OPENROUTER_API_KEY = 'test-key-not-real'
process.env.NODE_ENV = 'test'
