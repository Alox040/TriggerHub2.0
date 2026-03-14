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

if (appAccessMode !== 'private_prelaunch') {
  throw new Error(
    `Prelaunch security check failed: VITE_ACCESS_MODE must be explicitly set to private_prelaunch for this website build. Received: ${appAccessMode || '(missing)'}`,
  )
}

if (appAccessMode === 'private_prelaunch') {
  const requiredServerEnvKeys = [
    'VITE_SESSION_TTL_MS',
    'OWNER_LOGIN_USERNAME',
    'OWNER_LOGIN_PASSWORD_HASH',
    'OWNER_LOGIN_PASSWORD_SALT',
    'OWNER_LOGIN_PASSWORD_ITERATIONS',
    'OWNER_USER_ID',
    'OWNER_EMAIL',
    'PRELAUNCH_SESSION_SECRET',
    'PRELAUNCH_ACCESS_KEY',
    'PRELAUNCH_GATE_TTL_MS',
  ]
  const missingServerEnvKeys = requiredServerEnvKeys.filter((key) => {
    const value = process.env[key]
    return typeof value !== 'string' || value.trim().length === 0
  })

  if (missingServerEnvKeys.length > 0) {
    throw new Error(
      `Prelaunch security check failed: required prelaunch auth env vars are missing: ${missingServerEnvKeys.join(', ')}`,
    )
  }

  const positiveIntegerEnvKeys = ['VITE_SESSION_TTL_MS', 'OWNER_LOGIN_PASSWORD_ITERATIONS', 'PRELAUNCH_GATE_TTL_MS']
  const invalidPositiveIntegerEnvKeys = positiveIntegerEnvKeys.filter((key) => {
    const value = Number.parseInt((process.env[key] ?? '').trim(), 10)
    return !Number.isFinite(value) || value <= 0
  })

  if (invalidPositiveIntegerEnvKeys.length > 0) {
    throw new Error(
      `Prelaunch security check failed: expected positive integer env values for ${invalidPositiveIntegerEnvKeys.join(', ')}`,
    )
  }

  if ((process.env.PRELAUNCH_SESSION_SECRET ?? '').trim() === (process.env.PRELAUNCH_ACCESS_KEY ?? '').trim()) {
    throw new Error('Prelaunch security check failed: PRELAUNCH_SESSION_SECRET and PRELAUNCH_ACCESS_KEY must differ.')
  }
}
