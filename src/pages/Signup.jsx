import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent]         = useState(false);
  const [err, setErr]           = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/welcome` }
    });

    if (error) setErr(error.message);
    else       setSent(true);
  }

  if (sent) return (
    <main className="auth-card">
      <h1>Almost there!</h1>
      <p>Check <strong>{email}</strong> and click the confirmation link.</p>
    </main>
  );

  return (
    <main className="auth-card">
      <h1>Create account</h1>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)} required />
        <input
        type="password"
        placeholder="Password"
        className="border px-2 py-1 w-full"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$"
        title="8-20 chars, 1 upper, 1 lower, 1 number, 1 special"
        />
        <button>Sign up</button>
      </form>
      <p>Have an account? <Link to="/login">Log in</Link></p>
    </main>
  );
}
