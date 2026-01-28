import AppShell from '../components/layout/AppShell.jsx'
import HomePage from '../pages/HomePage.jsx'
import { socket } from '../lib/socket.js'

export default function App() {
  // Ensure the singleton is initialized on app start.
  // (In StrictMode this component renders twice in dev, but the module singleton remains one.)
  void socket

  return (
    <AppShell>
      <HomePage />
    </AppShell>
  )
}

