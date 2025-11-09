import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// UI Theme profiles
export type UIThemeProfile = 'palantir-dark' | 'classic-light';

interface UIThemeContextType {
  uiTheme: UIThemeProfile;
  setUITheme: (theme: UIThemeProfile) => Promise<void>;
  loading: boolean;
}

const UIThemeContext = createContext<UIThemeContextType | undefined>(undefined);

export const UIThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [uiTheme, setUIThemeState] = useState<UIThemeProfile>('palantir-dark');
  const [loading, setLoading] = useState(true);

  // Load user's theme preference from database
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!user) {
        // Not logged in, use localStorage or default
        const stored = localStorage.getItem('ui-theme') as UIThemeProfile;
        if (stored && (stored === 'palantir-dark' || stored === 'classic-light')) {
          setUIThemeState(stored);
        }
        setLoading(false);
        return;
      }

      try {
        // Fetch from database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('ui_theme')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no preferences exist, create default
          if (error.code === 'PGRST116') {
            await supabase.from('user_preferences').insert({
              user_id: user.id,
              ui_theme: 'palantir-dark'
            });
            setUIThemeState('palantir-dark');
          } else {
            console.error('Error loading theme preference:', error);
          }
        } else if (data) {
          setUIThemeState(data.ui_theme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user]);

  // Apply theme to document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-palantir-dark', 'theme-classic-light');
    root.classList.add(`theme-${uiTheme}`);
    localStorage.setItem('ui-theme', uiTheme);
  }, [uiTheme]);

  // Update theme preference
  const setUITheme = async (newTheme: UIThemeProfile) => {
    setUIThemeState(newTheme);

    if (user) {
      try {
        // Update in database
        const { error } = await supabase
          .from('user_preferences')
          .update({ ui_theme: newTheme })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating theme preference:', error);
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  return (
    <UIThemeContext.Provider value={{ uiTheme, setUITheme, loading }}>
      {children}
    </UIThemeContext.Provider>
  );
};

export const useUITheme = () => {
  const context = useContext(UIThemeContext);
  if (context === undefined) {
    throw new Error('useUITheme must be used within a UIThemeProvider');
  }
  return context;
};
