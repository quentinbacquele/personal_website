import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { name: 'Research', href: '/#research' },
  { name: 'About', href: '/#about' },
  { name: 'Notes', href: '/#blog' },
  { name: 'CV', href: '/cv' },
  { name: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleNavClick = (href: string) => {
    if (isHomePage && href.startsWith('/#')) {
      // On home page, scroll to section
      const element = document.querySelector(href.replace('/', ''));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto"
      >
        {/* Glass pill container */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/';
              }
            }}
            className="text-xl font-serif italic text-sage hover:text-acid transition-colors cursor-pointer"
          >
            QB.
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
              >
                {isHomePage && link.href.startsWith('/#') ? (
                  <a
                    href={link.href.replace('/', '')}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="px-4 py-2 font-mono text-sm text-sage/70 hover:text-terracotta transition-colors uppercase tracking-wider"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="px-4 py-2 font-mono text-sm text-sage/70 hover:text-terracotta transition-colors uppercase tracking-wider"
                  >
                    {link.name}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-sage/70 hover:text-sand transition-colors p-1"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 mx-4 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                isHomePage && link.href.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.href.replace('/', '')}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                      setIsOpen(false);
                    }}
                    className="px-4 py-3 font-mono text-sm text-sage/80 hover:text-terracotta transition-colors uppercase tracking-wider"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 font-mono text-sm text-sage/80 hover:text-terracotta transition-colors uppercase tracking-wider"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </nav>
  );
}
