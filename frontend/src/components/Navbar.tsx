import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search,
  FolderKanban, Brain, Activity, Stethoscope, Settings,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');
  const isActiveExact = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/chat', label: 'Clinical AI', icon: Stethoscope, exact: false },
    { to: '/projects', label: 'Case Files', icon: FolderKanban, exact: false },
    { to: '/memory', label: 'Med Records', icon: Brain, exact: false },
    { to: '/search', label: 'Search', icon: Search, exact: false },
  ];

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 border-b border-navy-700/40 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-base font-semibold text-white tracking-tight hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="gradient-text font-display">ChatSphere</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navLinks.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? isActiveExact(to) : isActive(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-neon-purple/15 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-navy-800/60'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side — Language + Settings */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Link
              to="/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 text-sm font-medium hover:text-white hover:bg-navy-800/60 transition-colors"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>

        </div>
      </div>
    </motion.nav>
  );
}
