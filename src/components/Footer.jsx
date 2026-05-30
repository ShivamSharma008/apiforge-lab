import React from 'react';
import { Globe, ExternalLink, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { label: 'API Playground', href: '/api-playground' },
        { label: 'DB Sandbox', href: '/db-sandbox' },
        { label: 'Workflows', href: '/workflows' },
        { label: 'Events', href: '/events' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Architecture', href: '#' },
        { label: 'API Reference', href: '#' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'GitHub', href: '#', icon: Globe },
        { label: 'LinkedIn', href: '#', icon: ExternalLink },
        { label: 'Email', href: '#', icon: Mail },
      ],
    },
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12"
        >
          {footerSections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="text-primary font-semibold text-lg tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <motion.li
                    key={link.label}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2 group"
                    >
                      {link.icon && (
                        <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{link.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
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
