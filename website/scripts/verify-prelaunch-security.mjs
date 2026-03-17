const appAccessMode = (process.env.VITE_ACCESS_MODE ?? '').trim()

const sensitiveClientEnvKeys = [
  'VITE_OWNER_USERNAME',
  'VITE_OWNER_PASSWORD',
  'VITE_OWNER_PASSWORD_HASH',
  'VITE_OWNER_PASSWORD_SALT',
  'VITE_OWNER_PASSWORD_ITERATIONS',
  'VITE_OWNER_USER_ID',
  'VITE_OWNER_EMAIL',
  'VITE_JWT_SECRET',
  'VITE_PRELAUNCH_SESSION_SECRET',
  'VITE_PRELAUNCH_ACCESS_KEY',
]

const configuredSensitiveClientEnvKeys = sensitiveClientEnvKeys.filter((key) => {
  const value = process.env[key]
  return typeof value === 'string' && value.trim().length > 0
})

if (configuredSensitiveClientEnvKeys.length > 0) {
  throw new Error(
    `Prelaunch security check failed: remove sensitive client auth env vars from the build: ${configuredSensitiveClientEnvKeys.join(', ')}`,
  )
}

if (appAccessMode !== 'public_product') {
  throw new Error(
    `Website build check failed: VITE_ACCESS_MODE must be explicitly set to public_product for this website build. Received: ${appAccessMode || '(missing)'}`,
  )
}

const sessionTtlMs = Number.parseInt((process.env.VITE_SESSION_TTL_MS ?? '').trim(), 10)

if (!Number.isFinite(sessionTtlMs) || sessionTtlMs <= 0) {
  throw new Error('Website build check failed: VITE_SESSION_TTL_MS must be set to a positive integer.')
}
