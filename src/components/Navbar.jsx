import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Hexagon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'API Playground', path: '/api-playground' },
    { label: 'DB Sandbox', path: '/db-sandbox' },
    { label: 'Workflows', path: '/workflows' },
    { label: 'Events', path: '/events' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Docs', path: '/docs' },
  ];

  const getLinkClasses = ({ isActive }) =>
    `relative rounded-md px-3 py-2 text-sm transition-colors duration-300 ${
      isActive
        ? 'text-primary font-semibold'
        : 'text-gray-400 hover:text-primary'
    } ${
      isActive ? 'border-b-2 border-accent' : 'border-b-2 border-transparent'
    }`;

  const mobileLinkClasses = ({ isActive }) =>
    `block px-4 py-3 rounded-lg transition-all duration-300 ${
      isActive
        ? 'bg-surface-light text-primary font-semibold'
        : 'text-gray-400 hover:text-primary hover:bg-surface-light/50'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass backdrop-blur-md bg-surface/88 border-b border-surface-light/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Hexagon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </motion.div>
              <Hexagon className="w-7 h-7 text-accent/50" strokeWidth={1.5} />
            </div>
            <span className="gradient-text text-lg font-bold tracking-tight sm:text-xl">
              APIForge Lab
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <NavLink to={link.path} className={getLinkClasses}>
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-light/50 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-accent" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-accent" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 pt-4 border-t border-surface-light/20"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <NavLink
                      to={link.path}
                      className={mobileLinkClasses}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
