import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, Settings, User, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { to: '/users', icon: <Users size={20} />, label: 'Users' },
  ];

  const userLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'My Tasks' },
  ];

  const links = user?.role === 'Admin' ? adminLinks : userLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 glass border-r border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <nav className="space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            <User size={20} className="mr-3" />
            Profile
          </NavLink>
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
