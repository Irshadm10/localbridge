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
import Footer from './components/Footer';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Trust from './pages/Trust';
import Community from './pages/Community';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bridge-page text-stone-900 font-sans antialiased">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentors/:id" element={<MentorProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
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
          <Footer/>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
