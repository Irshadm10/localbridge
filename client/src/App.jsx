import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-amber-50 text-stone-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentors/:id" element={<MentorProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
