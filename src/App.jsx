import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@/styles/global.css'
import '@/styles/layout.css'
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Vault from './pages/Vault'; // make sure this is here too
import Navbar from '@/components/layout/Navbar';

function App() {
  return (
    <Router>
      <Navbar /> {/* ✅ Only keep this one */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/vault" element={<Vault />} />
      </Routes>
    </Router>
  );
}

export default App;
