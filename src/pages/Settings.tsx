import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your application preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
        <SettingsIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-30" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Settings Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page will contain user preferences, notification settings, and other configuration options.
        </p>
      </div>
    </div>
  );
};
