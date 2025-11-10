import React from 'react';
import { Search, Bell, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

const breadcrumbMap: Record<string, string[]> = {
  '/': ['Dashboard'],
  '/domains': ['Domains'],
  '/workflows': ['Workflows'],
  '/analytics': ['Analytics'],
  '/stakeholders': ['Stakeholders'],
  '/settings': ['Settings'],
};

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbs = breadcrumbMap[location.pathname] || ['Dashboard'];
  const photoUrl = user?.user_metadata?.photo_url || '';

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400 dark:text-gray-600">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors p-1.5"
            title="Profile & Settings"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
