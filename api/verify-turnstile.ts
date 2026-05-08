import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false })

  const { token } = req.body
  if (!token) return res.status(400).json({ success: false, error: 'No token provided' })

  const secret = process.env.TURNSTILE_SECRET
  if (!secret) return res.status(500).json({ success: false, error: 'Server misconfigured' })

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  })

  const data = await response.json()
  return res.json({ success: data.success })
}