import { Routes, Route } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Home from './pages/Home.jsx'
import AddOperation from './pages/AddOperation.jsx'
import Forecast from './pages/Forecast.jsx'
import Rates from './pages/Rates.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  const { token } = useAuth()

  if (!token) {
    return (
      <div className="app">
        <Login />
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddOperation />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/rates" element={<Rates />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
