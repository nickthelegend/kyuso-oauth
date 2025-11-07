import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginModal from './components/LoginModal'
import PopupComplete from './components/PopupComplete'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginModal />} />
        <Route path="/popup-complete" element={<PopupComplete />} />
      </Routes>
    </Router>
  )
}

export default App
