import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';   // ← adjust path or use '@/…' alias
import '@/styles/global.css'
import '@/styles/layout.css'
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Vault from './pages/Vault'; // make sure this is here too
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import Navbar from '@/components/layout/Navbar';

function PrivateRoute({ children}) {
  const { user } = useAuth ();
  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar /> {/* ✅ Only keep this one */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vault" element={<Vault />} />

          {/* auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* protected area */}
          <Route path="/vault" element={<PrivateRoute><Vault /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
