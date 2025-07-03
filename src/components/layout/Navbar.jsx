import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';     // if you’re still using useEffect
import './Navbar.css';
import useDark from '@/hooks/useDark';

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // ✅ Add toggle state
  const [dark, setDark] = useState(() =>
    // first load: use saved setting, else the OS preference
    (localStorage.getItem('theme') ?? 'system') === 'dark' ||
    (localStorage.getItem('theme') === null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  // whenever `dark` changes → flip the .dark class & remember choice
// inside Navbar()  …

  useEffect(() => {
    const root = document.documentElement;

    // 👉  add / remove the theme classes
    root.classList.toggle('dark',  dark);   // already there
    root.classList.toggle('light', !dark);  // 🔥 NEW LINE

    // remember the choice
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);


  const location = useLocation();
  const currentPath = location.pathname;

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev); // ✅ Toggle menu visibility
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">Vault Prices</div>

        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark / light mode"
        >
          {dark ? '☀︎' : '☾'}
        </button>

        {/* ☰ Icon (shown only on mobile) */}
        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>

        {/* Desktop Links (hidden on small screens) */}
        <div className="nav-right">
          <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/about" className={currentPath === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" className={currentPath === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          <Link to="/vault" className={currentPath === '/vault' ? 'nav-link active' : 'nav-link'}>Vault</Link>
        </div>
      </div>

      {/* Mobile Dropdown Links */}
      {isMobileMenuOpen && (
        <div className="mobile-links">
          <Link to="/" onClick={toggleMenu} className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/about" onClick={toggleMenu} className={currentPath === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" onClick={toggleMenu} className={currentPath === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          <Link to="/vault" onClick={toggleMenu} className={currentPath === '/vault' ? 'nav-link active' : 'nav-link'}>Vault</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;