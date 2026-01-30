import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_BACKEND_URL

// Reusable singleton socket instance for the app.
// No business logic here—only connection lifecycle logging.
export const socket = io(BASE_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => {
  console.log('[socket] connected', { id: socket.id, url: BASE_URL })
})

socket.on('disconnect', (reason) => {
  console.log('[socket] disconnected', { reason })
})

