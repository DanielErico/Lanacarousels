import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, SupabaseProfile } from '../services/supabaseClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: SupabaseProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data as SupabaseProfile);
    } catch {
      // Ignore profile fetch failure if table not created yet
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error: null };
    } catch (err: unknown) {
      return {
        error: err instanceof Error ? err.message : 'Unable to connect to Supabase. Check your internet connection.',
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error: null };
    } catch (err: unknown) {
      return {
        error: err instanceof Error ? err.message : 'Unable to connect to Supabase. Check your internet connection.',
      };
    }
  };

  const continueAsGuest = () => {
    const mockUser: User = {
      id: 'demo-user-123',
      email: 'demo@lana-studio.app',
      app_metadata: {},
      user_metadata: { full_name: 'Demo Creator' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    setUser(mockUser);
    setProfile({
      id: 'demo-user-123',
      email: 'demo@lana-studio.app',
      full_name: 'Demo Creator',
      avatar_url: null,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout network error
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
