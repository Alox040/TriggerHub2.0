import crypto from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendJson } from './_auth'

interface InMemoryRateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitDecision {
  allowed: boolean
  retryAfterSeconds: number
}

type RateLimitBucket = 'prelaunch_gate_login' | 'owner_login' | 'auth_session_read' | 'auth_logout'

const LOGIN_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS = 5
const LOGIN_RATE_LIMIT_DEFAULT_WINDOW_MS = 5 * 60 * 1000
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS_ENV = 'PRELAUNCH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS'
const LOGIN_RATE_LIMIT_WINDOW_MS_ENV = 'PRELAUNCH_LOGIN_RATE_LIMIT_WINDOW_MS'
const AUTH_READ_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS = 60
const AUTH_READ_RATE_LIMIT_DEFAULT_WINDOW_MS = 60 * 1000
const AUTH_LOGOUT_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS = 30
const AUTH_LOGOUT_RATE_LIMIT_DEFAULT_WINDOW_MS = 60 * 1000

const inMemoryRateLimitStore = new Map<string, InMemoryRateLimitEntry>()

const parsePositiveIntEnv = (name: string, fallback: number): number => {
  const parsed = Number.parseInt((process.env[name] ?? '').trim(), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}

const resolveRateLimitConfig = (bucket: RateLimitBucket): { maxAttempts: number; windowMs: number } => {
  if (bucket === 'auth_session_read') {
    return {
      maxAttempts: AUTH_READ_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS,
      windowMs: AUTH_READ_RATE_LIMIT_DEFAULT_WINDOW_MS,
    }
  }

  if (bucket === 'auth_logout') {
    return {
      maxAttempts: AUTH_LOGOUT_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS,
      windowMs: AUTH_LOGOUT_RATE_LIMIT_DEFAULT_WINDOW_MS,
    }
  }

  return {
    maxAttempts: parsePositiveIntEnv(LOGIN_RATE_LIMIT_MAX_ATTEMPTS_ENV, LOGIN_RATE_LIMIT_DEFAULT_MAX_ATTEMPTS),
    windowMs: parsePositiveIntEnv(LOGIN_RATE_LIMIT_WINDOW_MS_ENV, LOGIN_RATE_LIMIT_DEFAULT_WINDOW_MS),
  }
}

const getClientAddress = (req: VercelRequest): string => {
  const forwardedForHeader = req.headers['x-forwarded-for']
  if (typeof forwardedForHeader === 'string' && forwardedForHeader.trim()) {
    const [firstAddress] = forwardedForHeader.split(',')
    return (firstAddress ?? '').trim()
  }

  return ''
}

const getClientFingerprint = (req: VercelRequest): string => {
  const clientAddress = getClientAddress(req)
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : ''
  const rawFingerprint = `${clientAddress}|${userAgent}`
  return crypto.createHash('sha256').update(rawFingerprint).digest('hex').slice(0, 16)
}

const consumeInMemoryRateLimit = (key: string, maxAttempts: number, windowMs: number): RateLimitDecision => {
  const now = Date.now()
  const currentEntry = inMemoryRateLimitStore.get(key)

  if (!currentEntry || currentEntry.resetAt <= now) {
    inMemoryRateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return {
      allowed: true,
      retryAfterSeconds: 0,
    }
  }

  if (currentEntry.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
    }
  }

  currentEntry.count += 1
  inMemoryRateLimitStore.set(key, currentEntry)

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

export const logSecurityEvent = (
  event: 'prelaunch_gate_login_failed' | 'prelaunch_gate_login_succeeded' | 'owner_login_failed' | 'owner_login_succeeded' | 'login_rate_limited',
  req: VercelRequest,
  metadata: Record<string, string | number | boolean | undefined> = {},
) => {
  const safeMetadata = Object.entries(metadata).reduce<Record<string, string | number | boolean>>(
    (accumulator, [key, value]) => {
      if (value !== undefined) {
        accumulator[key] = value
      }
      return accumulator
    },
    {},
  )

  console.warn(
    JSON.stringify({
      category: 'security',
      event,
      method: req.method ?? 'UNKNOWN',
      clientFingerprint: getClientFingerprint(req),
      timestamp: new Date().toISOString(),
      ...safeMetadata,
    }),
  )
}

export const enforceLoginRateLimit = (
  req: VercelRequest,
  res: VercelResponse,
  bucket: 'prelaunch_gate_login' | 'owner_login',
): boolean => {
  return enforceApiRateLimit(req, res, bucket)
}

export const enforceApiRateLimit = (
  req: VercelRequest,
  res: VercelResponse,
  bucket: RateLimitBucket,
): boolean => {
  const config = resolveRateLimitConfig(bucket)
  const clientFingerprint = getClientFingerprint(req)
  const key = `${bucket}:${clientFingerprint}`
  const decision = consumeInMemoryRateLimit(key, config.maxAttempts, config.windowMs)

  if (decision.allowed) {
    return true
  }

  res.setHeader('Retry-After', String(decision.retryAfterSeconds))
  logSecurityEvent('login_rate_limited', req, {
    bucket,
    retryAfterSeconds: decision.retryAfterSeconds,
  })
  sendJson(res, 429, {
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: 'Too many login attempts. Please retry later.',
    },
    retryAfterSeconds: decision.retryAfterSeconds,
  })

  return false
}

export const checkRateLimit = enforceApiRateLimit

export const resetInMemorySecurityGuardsForTests = () => {
  inMemoryRateLimitStore.clear()
}
