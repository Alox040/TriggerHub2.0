const base64ToBytes = (value: string): Uint8Array => {
  if (typeof atob === 'function') {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    return bytes
  }

  return new Uint8Array(Buffer.from(value, 'base64'))
}

const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === 'function') {
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    return btoa(binary)
  }

  return Buffer.from(bytes).toString('base64')
}

const textEncoder = new TextEncoder()

export const hashPasswordPbkdf2 = async (
  password: string,
  saltBase64: string,
  iterations: number,
): Promise<string> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )

  const salt = base64ToBytes(saltBase64)
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt,
    },
    keyMaterial,
    256,
  )

  return bytesToBase64(new Uint8Array(bits))
}

export const verifyPasswordHash = async (
  password: string,
  expectedHashBase64: string,
  saltBase64: string,
  iterations: number,
): Promise<boolean> => {
  const candidateHash = await hashPasswordPbkdf2(password, saltBase64, iterations)
  return candidateHash === expectedHashBase64
}
