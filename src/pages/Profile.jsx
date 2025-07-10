import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import supabase from '@/supabaseClient';

export default function Profile() {
  const { user } = useAuth();                     // already in context
  const [fullName, setFullName] = useState('');
  const [dob, setDob]           = useState('');
  const [msg, setMsg]           = useState('');
  const [loading, setLoading]   = useState(false);

  /* preload existing metadata when the page mounts */
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setFullName(meta.full_name      || '');
      setDob(      meta.date_of_birth || '');
    }
  }, [user]);

  async function handleUpdate(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name:      fullName.trim(),
        date_of_birth:  dob.trim(),
      },
    });

    setLoading(false);
    setMsg(error ? `Update failed: ${error.message}` : 'Profile updated!');
  }

  return (
    <main className="auth-card">
      <h1>Your Profile</h1>

      {msg && <p>{msg}</p>}

      <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Full Name
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </label>

        <label>
          Date of Birth
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
          />
        </label>

        <button disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
