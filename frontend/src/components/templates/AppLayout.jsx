import { Navbar } from '../organisms/Navbar'

export function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  )
}
