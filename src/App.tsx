import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>🔍 ChainGlass</h1>
        <p className="tagline">See through your crypto</p>
      </header>
      <Dashboard />
    </div>
  )
}

export default App
