import { getStoredUser, clearAuth } from '../lib/auth'
import './Home.css'

interface HomeProps {
  onLogout: () => void
}

export function Home({ onLogout }: HomeProps) {
  const user = getStoredUser()

  function handleLogout() {
    clearAuth()
    onLogout()
  }

  return (
    <div className="home-page">
      <div className="home-card">
        <h1>Home</h1>
        <p className="home-welcome">
          Hello, <strong>{user?.name || 'User'}</strong>!
        </p>
        <p className="home-email">{user?.email}</p>
        <button className="home-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}
