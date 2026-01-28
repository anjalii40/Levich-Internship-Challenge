const DEFAULT_API_BASE_URL = 'http://localhost:3000'

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
}

export async function fetchJson(path, init) {
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`
  const res = await fetch(url, init)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const detail = text ? `: ${text}` : ''
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail}`)
  }

  return res.json()
}

