import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';   // 👈  useRef added
import { User, Settings as Cog, Moon, Sun } from 'lucide-react';
import './Navbar.css';

/* small helpers so privacy-mode won’t explode */
const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
const prefersDark = () => {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch { return false; }
};

export default function Navbar() {
  /* ------------ state ------------ */
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen,   setUserMenuOpen]   = useState(false);
  const [arrowOffset, setArrowOffset] = useState(16);
  const [dark, setDark] = useState(() => {
    const saved = safeGet('theme');
    if (saved) return saved === 'dark';
    return prefersDark();
  });

  /* keep <html> up to date */
  useEffect(() => {
    document.documentElement.classList.toggle('dark',  dark);
    document.documentElement.classList.toggle('light', !dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  /* close the account dropdown on outside click */
  const userBtnRef = useRef(null);
  useEffect(() => {
    const close = e =>
      isUserMenuOpen &&
      userBtnRef.current &&
      !userBtnRef.current.contains(e.target) &&
      setUserMenuOpen(false);

    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [isUserMenuOpen]);

  /* helpers for active-link styling */
  const { pathname } = useLocation();
  const NavLink = ({ to, label, icon }) => (
    <Link to={to} className={pathname === to ? 'nav-link active' : 'nav-link'}>
      {icon && <span className="icon">{icon}</span>}
      {label}
    </Link>
  );

  /* ------------ render ------------ */
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">Vault Prices</div>

        {/* desktop links */}
        <div className="nav-right">
          <NavLink to="/"        label="Home" />
          <NavLink to="/about"   label="About" />
          <NavLink to="/contact" label="Contact" />
          <NavLink to="/vault"   label="Vault" />

          {/* account hamburger (desktop) */}
          <button
            ref={userBtnRef}
            className={`user-hamburger ${isUserMenuOpen ? 'open' : ''}`}
            onClick={() => {
              const willOpen = !isUserMenuOpen;

              if (willOpen && userBtnRef.current) {
                const rect = userBtnRef.current.getBoundingClientRect();
                setArrowOffset(window.innerWidth - (rect.left + rect.width / 2));

              }
              
              setUserMenuOpen(willOpen);
            }}
            aria-label="Account menu"
          >
            ≡
          </button>
        </div>

        {/* global theme toggle (mobile only) */}
        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark / light mode"
        >
          {dark ? '☀︎' : '☾'}
        </button>

        {/* main nav hamburger (mobile) */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Open navigation"
        >
          ☰
        </button>
      </div>

      {/* mobile nav panel */}
      {isMobileMenuOpen && (
        <div className="mobile-links" onClick={() => setMobileMenuOpen(false)}>
          <NavLink to="/"        label="Home" />
          <NavLink to="/about"   label="About" />
          <NavLink to="/contact" label="Contact" />
          <NavLink to="/vault"   label="Vault" />
        </div>
      )}

      {/* desktop account panel */}
      {isUserMenuOpen && (
        <div 
          className="user-dropdown"
          style={{ '--arrow-offset': `${arrowOffset}px`  }}
        >
          <NavLink to="/profile"  label="Profile" icon={<User size={16}/>}/>
          <NavLink to="/settings" label="Settings" icon={<Cog size={16}/>}/>
          <button className="dropdown-link" onClick={() => setDark(!dark)}>
            <span className="icon">{dark ? <Sun size={16}/> : <Moon size={16}/>}</span>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
}
