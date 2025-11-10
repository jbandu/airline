import { createClient } from '@supabase/supabase-js';
import { errorLogger } from './errorLogger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const auth = {
  signUp: async (email: string, password: string) => {
    const result = await supabase.auth.signUp({ email, password });

    if (result.error) {
      errorLogger.logError(
        result.error,
        'Auth signup failed',
        {
          route: '/auth/signup',
          operation: 'signUp',
          email: email.substring(0, 3) + '***', // Partial email for privacy
        }
      );
    }

    return result;
  },

  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      errorLogger.logError(
        result.error,
        'Auth signin failed',
        {
          route: '/auth/signin',
          operation: 'signIn',
          email: email.substring(0, 3) + '***', // Partial email for privacy
        }
      );
    }

    return result;
  },

  signOut: async () => {
    const result = await supabase.auth.signOut();

    if (result.error) {
      errorLogger.logError(
        result.error,
        'Auth signout failed',
        {
          route: '/auth/signout',
          operation: 'signOut',
        }
      );
    }

    return result;
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        callback(event, session);
      })();
    });
  }
};
