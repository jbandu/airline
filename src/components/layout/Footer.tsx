import React from 'react';

interface FooterProps {
  sidebarCollapsed: boolean;
}

export const Footer: React.FC<FooterProps> = ({ sidebarCollapsed }) => {
  return (
    <footer
      className={`fixed bottom-0 right-0 h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-20 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span>&copy; 2025 AirFlow. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Help
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Terms
          </a>
          <span className="text-gray-400 dark:text-gray-600">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
