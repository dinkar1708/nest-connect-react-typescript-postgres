import { useState, useEffect } from 'react'
import { isLoggedIn } from './lib/auth'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import './App.css'

type Page = 'splash' | 'login' | 'register' | 'home'

function App() {
  const [page, setPage] = useState<Page>('splash')

  useEffect(() => {
    if (page !== 'splash') return
    const t = setTimeout(() => {
      setPage(isLoggedIn() ? 'home' : 'login')
    }, 2000)
    return () => clearTimeout(t)
  }, [page])

  if (page === 'splash') {
    return (
      <main className="welcome splash">
        <div className="welcome-card">
          <h1>Welcome</h1>
          <p className="project">NestConnect</p>
          <p className="tagline">Social networking and chat</p>
        </div>
      </main>
    )
  }

  if (page === 'login') {
    return (
      <Login
        onSuccess={() => setPage('home')}
        onGoRegister={() => setPage('register')}
      />
    )
  }

  if (page === 'register') {
    return (
      <Register
        onSuccess={() => setPage('home')}
        onGoLogin={() => setPage('login')}
      />
    )
  }

  return <Home onLogout={() => setPage('login')} />
}

export default App
