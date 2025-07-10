// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

// 8–20 chars, 1 lower, 1 upper, 1 digit, 1 special
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$/;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');

    if (!PWD_REGEX.test(pwd)) {
      setErr(
        'Password must be 8–20 characters and include upper & lower case letters, a number, and a special character.'
      );
      return;
    }

    setLoading(true);
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

        <p className="hint">
          8–20 chars, 1 lower, 1 UPPER, 1 number, 1 special
        </p>

        <button disabled={loading}>
          {loading ? '…' : 'Update password'}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
