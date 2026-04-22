import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import ResumeReview from './pages/ResumeReview';
import Footer from './components/Footer';
import About from './pages/About';
import Careers from './pages/footer/Careers.jsx';
import Blog from './pages/footer/Blog.jsx';
import FAQ from './pages/footer/FAQ.jsx';
import Contact from './pages/footer/Contact.jsx';
import Help from './pages/footer/Help.jsx';
import Trust from './pages/footer/Trust.jsx';
import Community from './pages/footer/Community.jsx';
import Privacy from './pages/footer/Privacy.jsx';
import Terms from './pages/footer/Terms.jsx';
import Cookies from './pages/footer/Cookies.jsx';
import FeedbackFAB from './components/FeedbackFAB';
import VideoCall from './pages/VideoCall';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/profile') ||
                       location.pathname.startsWith('/settings');

  return (
    <div className="min-h-screen bg-bridge-page text-stone-900 font-sans antialiased flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/session/:sessionId/video" element={<VideoCall />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/resume" element={<ResumeReview />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/community" element={<Community />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
        </Routes>
      </div>
      <FeedbackFAB />
      {!isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
