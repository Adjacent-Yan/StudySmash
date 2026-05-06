import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Gameplay from './pages/Gameplay'
import QuizBrowse from './pages/QuizBrowse'
import CreateQuizPage from './pages/CreateQuizPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ForumPage from './pages/ForumPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quizbrowse" element={<ProtectedRoute><QuizBrowse /></ProtectedRoute>} />
          <Route path="/gameplay" element={<ProtectedRoute><Gameplay /></ProtectedRoute>} />
          <Route path="/gameplay/:quizId" element={<ProtectedRoute><Gameplay /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
          <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
