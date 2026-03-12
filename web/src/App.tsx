import { useState } from 'react'
import './App.css'

function App() {
  const [entered, setEntered] = useState(false)

  if (entered) {
    return (
      <main className="app">
        <div className="app-card">
          <p>You&apos;re in. (Main app coming soon.)</p>
          <button className="back-btn" onClick={() => setEntered(false)}>Back</button>
        </div>
      </main>
    )
  }

  return (
    <main className="welcome">
      <div className="welcome-card">
        <h1>Welcome</h1>
        <p className="project">NestConnect</p>
        <p className="tagline">Social networking and chat</p>
        <button className="enter" onClick={() => setEntered(true)}>
          Enter
        </button>
      </div>
    </main>
  )
}

export default App
