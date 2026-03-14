import { useEffect, useState } from 'react'

const readWindowPathname = (): string => (typeof window === 'undefined' ? '/' : window.location.pathname)

export const usePathname = (): string => {
  const [pathname, setPathname] = useState(readWindowPathname())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleLocation = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocation)
    return () => {
      window.removeEventListener('popstate', handleLocation)
    }
  }, [])

  return pathname
}

export const navigateTo = (path: string): void => {
  if (typeof window === 'undefined' || window.location.pathname === path) {
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const replaceTo = (path: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const readNextPath = (): string => {
  if (typeof window === 'undefined') {
    return '/'
  }

  const search = new URLSearchParams(window.location.search)
  const nextValue = search.get('next')
  return nextValue && nextValue.startsWith('/') ? nextValue : '/'
}
