import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../supabaseClient';              // adjust path if you use @/ alias

// ①  create the context
const AuthCtx = createContext(null);

// ②  export the hook ***by name***
export const useAuth = () => useContext(AuthCtx);

// ③  default export = provider component
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

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
