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
  const [info, setInfo]         = useState(null);

  if (user) return <Navigate to="/vault" replace />;   // already logged in

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.log(error);
      console.log('[supabase] sign-in error ->', error);
      setErr(error.message);
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    // basic guard - user must type an e-mail first
    if (!email.trim()) {
      setErr('Enter your e-mail above, then click “Forgot password?” again.');
      return;
    }

    setLoading(true);
    setErr(null); setInfo(null);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,   // 👈 key line
      }
    );

    if (error) {
      console.error('[supabase] reset-email error →', error);
      setErr(error.message);
    } else {
      setInfo('Reset link sent – check your inbox.');
    }
    setLoading(false);
  }

  {err === 'Email not confirmed' && (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.resend({ type: 'signup', email: email.trim() });
        setErr('Confirmation e-mail sent – check your inbox.');
      }}
    >
      Resend confirmation e-mail
    </button>
  )}


  return (
    <main className="auth-card">
      <h1>Log in</h1>
      {err && <p className="error">{err}</p>}
      {info && <p className="info">{info}</p>}
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


      <button
        type="button"
        className="text-link"
        onClick={handleForgotPassword}
        disabled={loading}
        style={{ marginTop: '0.75rem' }}
      >
        Forgot password?
      </button>

      <p>No account? <Link to="/signup">Sign up</Link></p>
    </main>
  );
}
