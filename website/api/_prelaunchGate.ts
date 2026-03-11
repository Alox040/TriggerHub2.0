import crypto from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendJson } from './_auth'

export const PRELAUNCH_GATE_COOKIE = 'th_prelaunch_gate'

interface PrelaunchGateConfig {
  accessKey: string
  sessionSecret: string
  gateTtlMs: number
}

interface SignedPrelaunchGatePayload {
  scope: 'prelaunch_gate'
  issuedAt: string
  expiresAt: string
}

const readEnv = (name: string): string => (process.env[name] ?? '').trim()

const parseRequiredPositiveInt = (name: string): number => {
  const parsed = Number.parseInt(readEnv(name), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Prelaunch access gate config is incomplete: ${name}`)
  }

  return parsed
}

export const loadPrelaunchGateConfig = (): PrelaunchGateConfig => {
  const config: PrelaunchGateConfig = {
    accessKey: readEnv('PRELAUNCH_ACCESS_KEY'),
    sessionSecret: readEnv('PRELAUNCH_SESSION_SECRET'),
    gateTtlMs: parseRequiredPositiveInt('PRELAUNCH_GATE_TTL_MS'),
  }

  if (!config.accessKey || !config.sessionSecret) {
    throw new Error('Prelaunch access gate config is incomplete')
  }

  return config
}

const toBuffer = (value: Buffer | string): Buffer =>
  typeof value === 'string' ? Buffer.from(value, 'utf8') : value

const base64UrlEncode = (value: Buffer | string): string =>
  toBuffer(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const base64UrlDecode = (value: string): Buffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64')
}

const signPayload = (payload: string, secret: string): string =>
  base64UrlEncode(crypto.createHmac('sha256', secret).update(payload).digest())

const encodeGateCookieValue = (payload: SignedPrelaunchGatePayload, secret: string): string => {
  const payloadJson = JSON.stringify(payload)
  const encodedPayload = base64UrlEncode(payloadJson)
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export const decodeGateCookieValue = (
  cookieValue: string | undefined,
  secret: string,
): SignedPrelaunchGatePayload | null => {
  if (!cookieValue) {
    return null
  }

  const [encodedPayload, providedSignature] = cookieValue.split('.')
  if (!encodedPayload || !providedSignature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload, secret)
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as SignedPrelaunchGatePayload
    if (payload.scope !== 'prelaunch_gate') {
      return null
    }

    const issuedAt = Date.parse(payload.issuedAt)
    const expiresAt = Date.parse(payload.expiresAt)
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || expiresAt <= issuedAt || expiresAt <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const verifyPrelaunchAccessKey = (accessKey: string, config: PrelaunchGateConfig): boolean =>
{
  if (typeof accessKey !== 'string' || typeof config.accessKey !== 'string') {
    return false
  }

  const provided = Buffer.from(accessKey, 'utf8')
  const expected = Buffer.from(config.accessKey, 'utf8')

  if (provided.length === 0 || expected.length === 0 || provided.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(provided, expected)
}

export const createPrelaunchGatePayload = (config: PrelaunchGateConfig): SignedPrelaunchGatePayload => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + config.gateTtlMs)
  return {
    scope: 'prelaunch_gate',
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

export const writePrelaunchGateCookie = (
  res: VercelResponse,
  payload: SignedPrelaunchGatePayload,
  config: PrelaunchGateConfig,
) => {
  const cookieValue = encodeGateCookieValue(payload, config.sessionSecret)
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAge = Math.floor(config.gateTtlMs / 1000)
  res.setHeader(
    'Set-Cookie',
    `${PRELAUNCH_GATE_COOKIE}=${cookieValue}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureFlag}`,
  )
}

export const clearPrelaunchGateCookie = (res: VercelResponse) => {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${PRELAUNCH_GATE_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureFlag}`,
  )
}

export const readPrelaunchGateCookie = (
  req: Pick<VercelRequest, 'headers'>,
  config: PrelaunchGateConfig,
): SignedPrelaunchGatePayload | null => {
  const cookieHeader = req.headers.cookie ?? ''
  const cookieValue = cookieHeader
    .split(';')
    .map((entry: string) => entry.trim())
    .find((entry: string) => entry.startsWith(`${PRELAUNCH_GATE_COOKIE}=`))
    ?.slice(PRELAUNCH_GATE_COOKIE.length + 1)

  return decodeGateCookieValue(cookieValue, config.sessionSecret)
}

export const requirePrelaunchGate = (req: VercelRequest, res: VercelResponse): PrelaunchGateConfig | null => {
  let config: PrelaunchGateConfig
  try {
    config = loadPrelaunchGateConfig()
  } catch {
    sendJson(res, 503, {
      authorized: false,
      error: {
        code: 'PRELAUNCH_GATE_UNAVAILABLE',
        message: 'Prelaunch access gate config is incomplete',
      },
    })
    return null
  }

  if (!readPrelaunchGateCookie(req, config)) {
    sendJson(res, 403, {
      authorized: false,
      error: {
        code: 'PRELAUNCH_GATE_REQUIRED',
        message: 'Prelaunch access gate authorization is required',
      },
    })
    return null
  }

  return config
}
