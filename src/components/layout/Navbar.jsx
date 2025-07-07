import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { useState, useEffect, useRef } from 'react';
import { User, Settings as Cog, Moon, Sun } from 'lucide-react';
import './Navbar.css';

/* Helpers so privacy-mode won’t explode */
const safeGet     = key => { try { return localStorage.getItem(key); } catch { return null; } };
const prefersDark = ()  => { try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; } };

export default function Navbar() {
  /* ------------- state ------------- */
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen,   setUserMenuOpen]   = useState(false);
  const [arrowOffset,      setArrowOffset]    = useState(16);
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

  /* close ≡ dropdown on outside click */
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

  /* link helpers */
  const { user }   = useAuth();
  const { pathname } = useLocation();
  const NavLink = ({ to, label, icon, onClick }) => (
    <Link
      to={to}
      className={pathname === to ? 'nav-link active' : 'nav-link'}
      onClick={onClick}
    >
      {icon && <span className="icon">{icon}</span>}
      {label}
    </Link>
  );

  const closeMobile   = () => setMobileMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);

  /* ------------- render ------------- */
  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* brand → home */}
        <Link
          to="/"
          className="nav-brand"
          onClick={() => { closeMobile(); closeUserMenu(); }}
        >
          Vault Prices
        </Link>

        {/* desktop rail */}
        <div className="nav-right">
          <NavLink to="/about"   label="About"   />
          <NavLink to="/contact" label="Contact" />
          <NavLink to="/vault"   label="My Vault" />

          {/* desktop account hamburger */}
          <button
            ref={userBtnRef}
            className={`user-hamburger ${isUserMenuOpen ? 'open' : ''}`}
            onClick={() => {
              const willOpen = !isUserMenuOpen;
              if (willOpen && userBtnRef.current) {
                const r = userBtnRef.current.getBoundingClientRect();
                setArrowOffset(window.innerWidth - (r.left + r.width / 2));
              }
              setUserMenuOpen(willOpen);
            }}
            aria-label="Account menu"
          >
            ≡
          </button>
        </div>

        {/* main mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Open navigation"
        >
          ☰
        </button>
      </div>

      {/* ---------------- MOBILE SHEET ---------------- */}
      {isMobileMenuOpen && (
        <div className="mobile-links" onClick={closeMobile}>
          <NavLink to="/about"   label="About"   onClick={closeMobile} />
          <NavLink to="/contact" label="Contact" onClick={closeMobile} />
          <NavLink to="/vault"   label="My Vault" onClick={closeMobile} />

          {/* Profile / Settings (signed-in only) */}
          {user && (
            <>
              <NavLink to="/profile"  label="Profile"  icon={<User size={16}/>} onClick={closeMobile} />
              <NavLink to="/settings" label="Settings" icon={<Cog  size={16}/>} onClick={closeMobile} />
            </>
          )}

          {/* Log in / Sign up (signed-out only) */}
          {!user && (
            <NavLink to="/login" label="Log in / Sign up" onClick={closeMobile} />
          )}

          {/* Dark-mode toggle always last */}
          <button className="dropdown-link" onClick={() => { setDark(!dark); closeMobile(); }}>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}

      {/* --------------- DESKTOP ≡ DROPDOWN --------------- */}
      {isUserMenuOpen && (
        <div className="user-dropdown" style={{ '--arrow-offset': `${arrowOffset}px` }}>
          {/* Profile / Settings (signed-in only) */}
          {user && (
            <>
              <NavLink to="/profile"  label="Profile"  icon={<User size={16}/>} onClick={closeUserMenu} />
              <NavLink to="/settings" label="Settings" icon={<Cog  size={16}/>} onClick={closeUserMenu} />
            </>
          )}

          {/* Log in / Sign up (signed-out only) */}
          {!user && (
            <NavLink to="/login" label="Log in / Sign up" onClick={closeUserMenu} />
          )}

          {/* Dark-mode toggle always last */}
          <button className="dropdown-link" onClick={() => { setDark(!dark); closeUserMenu(); }}>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
}
