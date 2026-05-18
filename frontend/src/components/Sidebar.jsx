import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, User, LogOut } from 'lucide-react';

const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
    isActive
      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
  }`;

const Sidebar = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/users', icon: Users, label: 'Users' },
  ];

  const userLinks = [
    { to: '/', icon: LayoutDashboard, label: 'My Tasks' },
  ];

  const links = user?.role === 'Admin' ? adminLinks : userLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800">
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className={navClass}>
                <Icon size={20} strokeWidth={2} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800">
        <nav className="space-y-1">
          <NavLink to="/profile" className={navClass}>
            <User size={20} strokeWidth={2} />
            Profile
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-base font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut size={20} strokeWidth={2} />
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
