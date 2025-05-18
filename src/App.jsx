import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Tracker from './pages/Tracker'; // make sure this is here too


function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand">Trak</div>
        <div className="nav-right">
          <Link to="/" className={currentPath === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/about" className={currentPath === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" className={currentPath === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          <Link to="/tracker" className={currentPath === '/tracker' ? 'nav-link active' : 'nav-link'}>Tracker</Link> {/* ✅ Add this */}
        </div>
      </div>
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
