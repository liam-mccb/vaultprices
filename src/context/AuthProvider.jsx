// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/supabaseClient';               // :contentReference[oaicite:5]{index=5}

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      /* -------- 1. OAuth redirect -------- */
      const search = new URLSearchParams(window.location.search);
      if (search.has('code')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession();
        if (error) console.error('[supabase] exchangeCodeForSession', error);
        if (data?.session) setSession(data.session);

        // clean the ?code=… from the bar
        window.history.replaceState({}, document.title, '/');
      }

      /* -------- 2. Magic-link / pw-reset (#access_token …) -------- */
      if (window.location.hash.includes('access_token')) {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const access_token  = hash.get('access_token');
        const refresh_token = hash.get('refresh_token');

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) console.error('[supabase] setSession', error);
          if (data?.session) setSession(data.session);
        }
        /* if the link is a password-recovery link, jump to the form
          BEFORE we strip the hash so the condition stays true */
        if (hash.get('type') === 'recovery') {
          navigate('/reset-password', { replace: true });
        }

        // now clean the URL bar
        window.history.replaceState({}, document.title, '/');
      }



      /* -------- 3. Normal load -------- */
      if (!session) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      }
    })();

    // live updates
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthCtx.Provider value={{ session, user: session?.user }}>
      {children}
    </AuthCtx.Provider>
  );
}
