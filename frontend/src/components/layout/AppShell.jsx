import '../ui/base.css'

export default function AppShell({ children }) {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">Live Auction Dashboard</div>
      </header>
      <main className="app__main">{children}</main>
    </div>
  )
}

