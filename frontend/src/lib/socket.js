import { io } from 'socket.io-client'

const DEFAULT_SOCKET_URL = 'http://localhost:3000'

function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_BASE_URL ?? DEFAULT_SOCKET_URL
}

// Reusable singleton socket instance for the app.
// No business logic here—only connection lifecycle logging.
export const socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => {
  console.log('[socket] connected', { id: socket.id, url: getSocketUrl() })
})

socket.on('disconnect', (reason) => {
  console.log('[socket] disconnected', { reason })
})

