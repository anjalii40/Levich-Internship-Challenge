import { fetchJson } from './http.js'

export async function getItems() {
  // Backend route: GET /items -> { serverTime, items }
  return fetchJson('/items')
}

