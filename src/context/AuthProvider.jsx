import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';              // adjust path if you use @/ alias

// ①  create the context
const AuthCtx = createContext(null);

// ②  export the hook ***by name***
export const useAuth = () => useContext(AuthCtx);

// ③  default export = provider component
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    /** ------------------------------------------------------
     * 1) Handle magic-link / password-recovery redirects
     *    This stores the session *and* cleans the hash.
     * ----------------------------------------------------- */
    supabase.auth
      .getSessionFromUrl({ storeSession: true })
      .then(({ data, error }) => {
        if (error) console.error('[supabase] getSessionFromUrl', error);

        if (data?.session) {
          setSession(data.session);

          // If the hash was a recovery link → route to reset form
          if (window.location.hash.includes('type=recovery')) {
            navigate('/reset-password', { replace: true });
          }
        } else {
          // Not a magic link → fetch existing cookie/token session
          supabase.auth.getSession().then(({ data }) => setSession(data.session));
        }
      });

    // subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evt, newSession) => setSession(newSession)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider value={{ session, user: session?.user }}>
      {children}
    </AuthCtx.Provider>
  );
}
