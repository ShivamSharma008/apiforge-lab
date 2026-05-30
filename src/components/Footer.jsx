import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ExternalLink, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const platformLinks = [
    { label: 'API Playground', route: '/api-playground' },
    { label: 'DB Sandbox', route: '/db-sandbox' },
    { label: 'Workflows', route: '/workflows' },
    { label: 'Events', route: '/events' },
  ];

  const resourceLinks = [
    { label: 'Documentation', route: '/docs' },
    { label: 'Architecture', route: '/architecture' },
    { label: 'API Reference', route: '/api-reference' },
  ];

  const connectLinks = [
    { label: 'GitHub (APIForge)', href: 'https://github.com/ShivamSharma008/apiforge-lab', icon: Globe },
    { label: 'GitHub (Portfolio)', href: 'https://github.com/ShivamSharma008/ShivamSharma008.github.io', icon: Globe },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shivamsharma-sdet/', icon: ExternalLink },
    { label: 'Portfolio', href: 'https://shivamsharma008.github.io/', icon: User },
    { label: 'Email', href: 'mailto:Shivamapril8@gmail.com', icon: Mail },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-surface border-t border-surface-light/20">
      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-accent via-blue-500 to-purple-500"></div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Brand and Credit Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="gradient-text text-2xl font-bold mb-3">APIForge Lab</h2>
          <div className="flex items-center justify-center gap-2 text-primary/90">
            <span className="text-lg">Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-red-500 text-xl"
            >
              ❤️
            </motion.span>
            <span className="text-lg">by</span>
          </div>
          <p className="text-accent font-semibold text-lg mt-2">
            Senior SDET SHIVAM SHARMA
          </p>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 mb-12"
        >
          {/* Platform */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-primary font-semibold text-lg tracking-wide">Platform</h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <motion.li key={link.label} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={() => navigate(link.route)}
                    className="text-gray-400 hover:text-accent transition-colors duration-300 cursor-pointer"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-primary font-semibold text-lg tracking-wide">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <motion.li key={link.label} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={() => {
                      const base = window.location.origin + window.location.pathname;
                      window.open(`${base}#${link.route}`, '_blank');
                    }}
                    className="text-gray-400 hover:text-accent transition-colors duration-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-primary font-semibold text-lg tracking-wide">Connect</h3>
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <motion.li key={link.label} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group"
                  >
                    {link.icon && <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span>{link.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* About */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-primary font-semibold text-lg tracking-wide">About</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              APIForge Lab is a comprehensive platform for learning and testing APIs, databases, workflows, and event-driven systems — built by Senior SDET Shivam Sharma.
            </p>
            <a
              href="https://shivamsharma008.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-sm font-medium transition-all duration-200"
            >
              <User className="w-4 h-4" />
              Visit Portfolio
            </a>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-surface-light/50 to-transparent mb-8"></div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            © {currentYear}-{currentYear + 2} APIForge Lab. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Designed and built with passion for API development and testing.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
