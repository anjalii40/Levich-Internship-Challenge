const BASE_URL = import.meta.env.VITE_BACKEND_URL

export async function fetchJson(path, init) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const res = await fetch(url, init)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const detail = text ? `: ${text}` : ''
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail}`)
  }

  return res.json()
}

