#!/usr/bin/env node
/**
 * Fails the build if Vercel is building from repo root instead of website/.
 * Prevents deploying the desktop app (dashboard UI) to the production domain.
 * Only runs when VERCEL=1; no effect on local or CI builds.
 */
import { existsSync } from 'fs'
import { join } from 'path'

if (process.env.VERCEL !== '1') process.exit(0)

const hasVercelConfig = existsSync(join(process.cwd(), 'vercel.json'))
if (hasVercelConfig) process.exit(0)

console.error('')
console.error('*** Vercel: Wrong Root Directory ***')
console.error('This build is running from the repo root (desktop app).')
console.error("Set Root Directory to 'website' in Vercel Project Settings.")
console.error('See: docs/deployment/vercel-deployment.md')
console.error('')
process.exit(1)
