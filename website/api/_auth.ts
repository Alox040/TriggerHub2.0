import crypto from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { UserRole } from '../src/modules/access-control/types'

export const PRELAUNCH_SESSION_COOKIE = 'th_prelaunch_session'
export const PRELAUNCH_CSRF_COOKIE = 'th_csrf'

export interface OwnerServerConfig {
  userId: string
  email: string
  username: string
  passwordHashBase64: string
  saltBase64: string
  iterations: number
  sessionSecret: string
  sessionTtlMs: number
}

export interface SignedSessionPayload {
  userId: string
  email: string
  role: UserRole
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  sessionVersion: number
  tokenId: string
}

interface JwtHeader {
  alg: 'HS256'
  typ: 'JWT'
}

interface JwtSessionClaims {
  sub: string
  email: string
  role: UserRole
  iat: number
  exp: number
  lat: string
  ver: number
  jti: string
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

const signValue = (payload: string, secret: string): string =>
  base64UrlEncode(crypto.createHmac('sha256', secret).update(payload).digest())

const parseCookies = (req: Pick<VercelRequest, 'headers'>): Record<string, string> => {
  const cookieHeader = req.headers.cookie ?? ''

  return cookieHeader
    .split(';')
    .map((entry: string) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, entry) => {
      const separatorIndex = entry.indexOf('=')
      if (separatorIndex <= 0) {
        return cookies
      }

      const key = entry.slice(0, separatorIndex)
      const value = entry.slice(separatorIndex + 1)
      cookies[key] = value
      return cookies
    }, {})
}

const createJwt = (claims: JwtSessionClaims, secret: string): string => {
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedClaims = base64UrlEncode(JSON.stringify(claims))
  const signature = signValue(`${encodedHeader}.${encodedClaims}`, secret)
  return `${encodedHeader}.${encodedClaims}.${signature}`
}

const verifyJwt = (token: string | undefined, secret: string): JwtSessionClaims | null => {
  if (!token) {
    return null
  }

  const [encodedHeader, encodedClaims, providedSignature] = token.split('.')
  if (!encodedHeader || !encodedClaims || !providedSignature) {
    return null
  }

  const expectedSignature = signValue(`${encodedHeader}.${encodedClaims}`, secret)
  const provided = Buffer.from(providedSignature, 'utf8')
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as Partial<JwtHeader>
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null
    }

    const claims = JSON.parse(base64UrlDecode(encodedClaims).toString('utf8')) as Partial<JwtSessionClaims>
    const sessionVersion = claims.ver
    if (
      typeof claims.sub !== 'string' ||
      !claims.sub ||
      typeof claims.email !== 'string' ||
      !claims.email ||
      (claims.role !== 'owner' && claims.role !== 'user') ||
      typeof claims.iat !== 'number' ||
      typeof claims.exp !== 'number' ||
      typeof claims.lat !== 'string' ||
      typeof sessionVersion !== 'number' ||
      !Number.isInteger(sessionVersion) ||
      sessionVersion < 1 ||
      typeof claims.jti !== 'string' ||
      !claims.jti
    ) {
      return null
    }

    const nowSeconds = Math.floor(Date.now() / 1000)
    if (claims.exp <= nowSeconds || claims.iat > claims.exp) {
      return null
    }

    return {
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
      iat: claims.iat,
      exp: claims.exp,
      lat: claims.lat,
      ver: sessionVersion,
      jti: claims.jti,
    }
  } catch {
    return null
  }
}

export const readCsrfCookie = (req: Pick<VercelRequest, 'headers'>): string | null =>
  parseCookies(req)[PRELAUNCH_CSRF_COOKIE] ?? null

const createCsrfToken = (): string => crypto.randomBytes(32).toString('base64url')

export const ensureCsrfCookie = (
  req: Pick<VercelRequest, 'headers'>,
  res: VercelResponse,
  maxAgeSeconds: number,
): string => {
  const existingToken = readCsrfCookie(req)
  if (existingToken) {
    return existingToken
  }

  const csrfToken = createCsrfToken()
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${PRELAUNCH_CSRF_COOKIE}=${csrfToken}; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secureFlag}`,
  )

  return csrfToken
}

export const decodeSessionCookieValue = (
  cookieValue: string | undefined,
  secret: string,
): SignedSessionPayload | null => {
  const claims = verifyJwt(cookieValue, secret)
  if (!claims) {
    return null
  }

  return {
    userId: claims.sub,
    email: claims.email,
    role: claims.role,
    issuedAt: new Date(claims.iat * 1000).toISOString(),
    expiresAt: new Date(claims.exp * 1000).toISOString(),
    lastAuthenticatedAt: claims.lat,
    sessionVersion: claims.ver,
    tokenId: claims.jti,
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
    tokenId: crypto.randomUUID(),
  }
}

export const writeSessionCookie = (res: VercelResponse, payload: SignedSessionPayload, config: OwnerServerConfig) => {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const maxAge = Math.floor(config.sessionTtlMs / 1000)
  const sessionToken = createJwt(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: Math.floor(Date.parse(payload.issuedAt) / 1000),
      exp: Math.floor(Date.parse(payload.expiresAt) / 1000),
      lat: payload.lastAuthenticatedAt,
      ver: payload.sessionVersion,
      jti: payload.tokenId,
    },
    config.sessionSecret,
  )

  res.setHeader(
    'Set-Cookie',
    [
      `${PRELAUNCH_SESSION_COOKIE}=${sessionToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureFlag}`,
      `${PRELAUNCH_CSRF_COOKIE}=${createCsrfToken()}; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureFlag}`,
    ] as unknown as string,
  )
}

export const clearSessionCookie = (res: VercelResponse) => {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    [
      `${PRELAUNCH_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureFlag}`,
      `${PRELAUNCH_CSRF_COOKIE}=; SameSite=Strict; Path=/; Max-Age=0${secureFlag}`,
    ] as unknown as string,
  )
}

export const readSessionCookie = (req: VercelRequest, config: OwnerServerConfig): SignedSessionPayload | null => {
  const cookieValue = parseCookies(req)[PRELAUNCH_SESSION_COOKIE]

  return decodeSessionCookieValue(cookieValue, config.sessionSecret)
}

export const applySecurityHeaders = (res: VercelResponse) => {
  res.setHeader('Cache-Control', 'no-store, private')
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  res.setHeader('Origin-Agent-Cluster', '?1')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-DNS-Prefetch-Control', 'off')
  res.setHeader('X-Download-Options', 'noopen')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader('X-XSS-Protection', '0')
}

export const sendJson = (res: VercelResponse, status: number, payload: unknown) => {
  applySecurityHeaders(res)
  res.status(status).setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(payload))
}
