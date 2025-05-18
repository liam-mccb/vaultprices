import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles.css';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Tracker from './pages/Tracker'; // make sure this is here too
import { useState } from 'react';



function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // ✅ Add toggle state
  const location = useLocation();
  const currentPath = location.pathname;

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev); // ✅ Toggle menu visibility
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">Trak</div>

        {/* ☰ Icon (shown only on mobile) */}
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>

        {/* Desktop Links (hidden on small screens) */}
        <div className="nav-right">
          <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/about" className={currentPath === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" className={currentPath === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          <Link to="/tracker" className={currentPath === '/tracker' ? 'nav-link active' : 'nav-link'}>Tracker</Link>
        </div>
      </div>

      {/* Mobile Dropdown Links */}
      {isMobileMenuOpen && (
        <div className="mobile-links">
          <Link to="/" onClick={toggleMenu} className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/about" onClick={toggleMenu} className={currentPath === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" onClick={toggleMenu} className={currentPath === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          <Link to="/tracker" onClick={toggleMenu} className={currentPath === '/tracker' ? 'nav-link active' : 'nav-link'}>Tracker</Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar /> {/* ✅ Only keep this one */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tracker" element={<Tracker />} />
      </Routes>
    </Router>
  );
}

export default App;
