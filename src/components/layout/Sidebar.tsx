import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, FileText, Bot, Network, GitBranch, Grid3x3, Users, Settings, ChevronLeft, ChevronRight, Plane, TreeDeciduous } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  section?: string;
}

const menuSections = [
  {
    title: 'AIRLINE STRUCTURE',
    items: [
      { icon: Folder, label: 'Domains', path: '/domains' },
      { icon: FileText, label: 'Workflows', path: '/workflows' },
      { icon: Bot, label: 'Agents', path: '/agents' },
    ]
  },
  {
    title: 'KNOWLEDGE VIEWS',
    items: [
      { icon: Network, label: 'Knowledge Graph', path: '/knowledge-graph' },
      { icon: TreeDeciduous, label: 'Ontology Tree', path: '/ontology' },
      { icon: GitBranch, label: 'Cross-Domain Bridges', path: '/bridges' },
      { icon: Grid3x3, label: 'Semantic Matrix', path: '/semantic-matrix' },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  AeroGraph
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Airline Intelligence</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="group cursor-pointer">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-cyan-500/50 transition-all mx-auto">
                <Network className="w-6 h-6 text-white" />
              </div>
            </Link>
          )}
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 mb-4 rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={collapsed ? 'Dashboard' : undefined}
          >
            <Home className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span className="font-medium">Dashboard</span>}
          </Link>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {collapsed && (
                <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Stakeholders & Settings */}
          <div className="mt-6">
            {!collapsed && (
              <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
            )}
            {collapsed && (
              <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
            )}
            <div className="space-y-1">
              <Link
                to="/stakeholders"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/stakeholders'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={collapsed ? 'Stakeholders' : undefined}
              >
                <Users className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="font-medium">Stakeholders</span>}
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/settings'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={collapsed ? 'Settings' : undefined}
              >
                <Settings className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="font-medium">Settings</span>}
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!collapsed && user && (
            <div className="flex items-center gap-3 mb-3">
              {user.user_metadata?.photo_url ? (
                <img
                  src={user.user_metadata.photo_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          {collapsed && user && (
            user.user_metadata?.photo_url ? (
              <img
                src={user.user_metadata.photo_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 mx-auto mb-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-3">
                {user.email?.[0].toUpperCase()}
              </div>
            )
          )}
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
