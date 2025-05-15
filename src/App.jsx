// Starter React app for trak.money

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold">Welcome to Trak</h1>
      <p className="mt-2 text-lg">Track the value of what matters to you.</p>
      <p className="mt-1 text-sm text-gray-500">(MVP site – early version)</p>
    </div>
  );
}

function About() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">About Trak</h2>
      <p className="mt-2">Trak helps you track the financial value of items you care about – from collectibles to everyday essentials. No ads. No data-selling. Just pure utility.</p>
    </div>
  );
}

function Contact() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Contact Us</h2>
      <p className="mt-2">Email us at <a className="text-blue-600 underline" href="mailto:info@trak.money">info@trak.money</a></p>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-gray-100 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Trak</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
