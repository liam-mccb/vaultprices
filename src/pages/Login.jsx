import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import supabase from '../supabaseClient';              // default export
import { useAuth } from '../context/AuthProvider';     // named export

export default function Login() {
  const { user } = useAuth();          // will be null when logged-out
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState(null);
  const [loading, setLoading]   = useState(false);

  if (user) return <Navigate to="/vault" replace />;   // already logged in

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      setErr(error.message);
    }
  }

  return (
    <main className="auth-card">
      <h1>Log in</h1>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button disabled={loading}>{loading ? '…' : 'Log in'}</button>
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </main>
  );
}
