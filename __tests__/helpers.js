// Minimal Vercel-style req/res mocks for testing serverless handlers.

export function createReq({ method = 'GET', body = undefined, headers = {} } = {}) {
  return { method, body, headers }
}

export function createRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(payload) { this.body = payload; return this },
    end() { return this },
  }
  return res
}

export async function callHandler(handler, reqOptions) {
  const req = createReq(reqOptions)
  const res = createRes()
  await handler(req, res)
  return { status: res.statusCode, body: res.body, headers: res.headers }
}
