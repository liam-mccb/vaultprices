// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import supabase from '@/supabaseClient';
import '@/pages/Profile.css';          // keep this import

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [dob,      setDob]      = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setFullName(meta.full_name      ?? '');
      setDob(      meta.date_of_birth ?? '');
    }
  }, [user]);

  async function handleUpdate(e) {
    e.preventDefault();
    setMsg(''); setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), date_of_birth: dob.trim() },
    });
    setLoading(false);
    setMsg(error ? `Update failed: ${error.message}` : 'Profile updated!');
  }

  /* ---------------  render  --------------- */
  return (
    <main className="profile-page">
      {/* Same geometry as .nav-inner so the left edge matches the brand */}
      <div className="page-inner">
        <h1>Your profile</h1>

        {msg && <p className="msg">{msg}</p>}

        <form onSubmit={handleUpdate} className="profile-form">
          <label className="field-row">
            <span className="field-label">Full name:</span>
            <input
              className="field-input"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </label>

          <label className="field-row">
            <span className="field-label">Date of birth:</span>
            <input
              className="field-input"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </label>

          {/* button already flush-left inside the same container */}
          <button disabled={loading}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
