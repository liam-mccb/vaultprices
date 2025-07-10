// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    const { error } = await supabase.auth.updateUser({ password: pwd.trim() });
    if (error) setErr(error.message);
    else navigate('/vault');
    setLoading(false);
  }

  return (
    <main className="auth-card">
      <h1>Choose a new password</h1>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          required
        />
        <button disabled={loading}>
          {loading ? '…' : 'Update password'}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
