import { describe, expect, it } from 'vitest'
import {
  createPrelaunchGatePayload,
  decodeGateCookieValue,
  loadPrelaunchGateConfig,
  readPrelaunchGateCookie,
  verifyPrelaunchAccessKey,
  writePrelaunchGateCookie,
} from '../../website/api/_prelaunchGate'

describe('website prelaunch gate', () => {
  it('loads server-side prelaunch gate config from env', () => {
    const originalAccessKey = process.env.PRELAUNCH_ACCESS_KEY
    const originalSessionSecret = process.env.PRELAUNCH_SESSION_SECRET
    const originalGateTtl = process.env.PRELAUNCH_GATE_TTL_MS

    process.env.PRELAUNCH_ACCESS_KEY = 'shared-gate-secret'
    process.env.PRELAUNCH_SESSION_SECRET = 'session-signing-secret'
    process.env.PRELAUNCH_GATE_TTL_MS = '60000'

    try {
      const config = loadPrelaunchGateConfig()
      expect(config.accessKey).toBe('shared-gate-secret')
      expect(config.sessionSecret).toBe('session-signing-secret')
      expect(config.gateTtlMs).toBe(60000)
    } finally {
      process.env.PRELAUNCH_ACCESS_KEY = originalAccessKey
      process.env.PRELAUNCH_SESSION_SECRET = originalSessionSecret
      process.env.PRELAUNCH_GATE_TTL_MS = originalGateTtl
    }
  })

  it('validates the configured shared access key', () => {
    expect(
      verifyPrelaunchAccessKey('shared-gate-secret', {
        accessKey: 'shared-gate-secret',
        sessionSecret: 'session-signing-secret',
        gateTtlMs: 60000,
      }),
    ).toBe(true)

    expect(
      verifyPrelaunchAccessKey('wrong-secret', {
        accessKey: 'shared-gate-secret',
        sessionSecret: 'session-signing-secret',
        gateTtlMs: 60000,
      }),
    ).toBe(false)
  })

  it('fails closed for access keys with different lengths', () => {
    expect(
      verifyPrelaunchAccessKey('short', {
        accessKey: 'shared-gate-secret',
        sessionSecret: 'session-signing-secret',
        gateTtlMs: 60000,
      }),
    ).toBe(false)
  })

  it('fails closed for empty access key inputs', () => {
    expect(
      verifyPrelaunchAccessKey('', {
        accessKey: 'shared-gate-secret',
        sessionSecret: 'session-signing-secret',
        gateTtlMs: 60000,
      }),
    ).toBe(false)
  })

  it('round-trips the signed prelaunch gate cookie', () => {
    const config = {
      accessKey: 'shared-gate-secret',
      sessionSecret: 'session-signing-secret',
      gateTtlMs: 60000,
    }

    let setCookieHeader = ''
    writePrelaunchGateCookie(
      {
        setHeader: (name: string, value: string) => {
          if (name === 'Set-Cookie') {
            setCookieHeader = value
          }
        },
      } as never,
      createPrelaunchGatePayload(config),
      config,
    )

    const cookieValue = setCookieHeader.split(';')[0]?.split('=')[1]
    const decoded = decodeGateCookieValue(cookieValue, config.sessionSecret)
    expect(decoded?.scope).toBe('prelaunch_gate')

    const hydrated = readPrelaunchGateCookie(
      {
        headers: {
          cookie: setCookieHeader,
        },
      } as never,
      config,
    )

    expect(hydrated?.scope).toBe('prelaunch_gate')
  })
})
