import crypto from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const PRELAUNCH_SESSION_COOKIE = 'th_prelaunch_session'

interface OwnerServerConfig {
  userId: string
  email: string
  username: string
  passwordHashBase64: string
  saltBase64: string
  iterations: number
  sessionSecret: string
  sessionTtlMs: number
}

interface SignedSessionPayload {
  userId: string
  email: string
  role: 'owner'
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  sessionVersion: number
}

const readEnv = (name: string): string => (process.env[name] ?? '').trim()

const parseRequiredPositiveInt = (name: string): number => {
  const value = Number.parseInt(readEnv(name), 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Prelaunch owner auth server config is incomplete: ${name}`)
  }

  return value
}

export const loadOwnerServerConfig = (): OwnerServerConfig => {
  const config: OwnerServerConfig = {
    userId: readEnv('OWNER_USER_ID'),
    email: readEnv('OWNER_EMAIL'),
    username: readEnv('OWNER_LOGIN_USERNAME').toLowerCase(),
    passwordHashBase64: readEnv('OWNER_LOGIN_PASSWORD_HASH'),
    saltBase64: readEnv('OWNER_LOGIN_PASSWORD_SALT'),
    iterations: parseRequiredPositiveInt('OWNER_LOGIN_PASSWORD_ITERATIONS'),
    sessionSecret: readEnv('PRELAUNCH_SESSION_SECRET'),
    sessionTtlMs: parseRequiredPositiveInt('VITE_SESSION_TTL_MS'),
  }

  if (
    !config.userId ||
    !config.email ||
    !config.username ||
    !config.passwordHashBase64 ||
    !config.saltBase64 ||
    !config.sessionSecret
  ) {
    throw new Error('Prelaunch owner auth server config is incomplete')
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

const encodeSessionCookieValue = (payload: SignedSessionPayload, secret: string): string => {
  const payloadJson = JSON.stringify(payload)
  const encodedPayload = base64UrlEncode(payloadJson)
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export const decodeSessionCookieValue = (
  cookieValue: string | undefined,
  secret: string,
): SignedSessionPayload | null => {
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
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as SignedSessionPayload
    if (!payload.userId || !payload.email || payload.role !== 'owner') {
      return null
    }
    if (Date.parse(payload.expiresAt) <= Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export const verifyOwnerPassword = (password: string, config: OwnerServerConfig): boolean => {
  const derivedHash = crypto.pbkdf2Sync(
    password,
    Buffer.from(config.saltBase64, 'base64'),
    config.iterations,
    32,
    'sha256',
  )
  const expectedHash = Buffer.from(config.passwordHashBase64, 'base64')
  return derivedHash.length === expectedHash.length && crypto.timingSafeEqual(derivedHash, expectedHash)
}

export const createOwnerSessionPayload = (config: OwnerServerConfig): SignedSessionPayload => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + config.sessionTtlMs)
  return {
    userId: config.userId,
    email: config.email,
    role: 'owner',
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastAuthenticatedAt: now.toISOString(),
    sessionVersion: 1,
  }
}

export const writeSessionCookie = (res: VercelResponse, payload: SignedSessionPayload, config: OwnerServerConfig) => {
  const cookieValue = encodeSessionCookieValue(payload, config.sessionSecret)
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAge = Math.floor(config.sessionTtlMs / 1000)
  res.setHeader(
    'Set-Cookie',
    `${PRELAUNCH_SESSION_COOKIE}=${cookieValue}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureFlag}`,
  )
}

export const clearSessionCookie = (res: VercelResponse) => {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${PRELAUNCH_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureFlag}`,
  )
}

export const readSessionCookie = (req: VercelRequest, config: OwnerServerConfig): SignedSessionPayload | null => {
  const cookieHeader = req.headers.cookie ?? ''
  const cookieValue = cookieHeader
    .split(';')
    .map((entry: string) => entry.trim())
    .find((entry: string) => entry.startsWith(`${PRELAUNCH_SESSION_COOKIE}=`))
    ?.slice(PRELAUNCH_SESSION_COOKIE.length + 1)

  return decodeSessionCookieValue(cookieValue, config.sessionSecret)
}

export const sendJson = (res: VercelResponse, status: number, payload: unknown) => {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(payload))
}
