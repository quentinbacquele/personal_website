import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { name: 'Research', href: '#research' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.a 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          href="#" 
          className="text-2xl font-serif italic text-sage hover:text-acid transition-colors"
        >
          QB.
        </motion.a>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {links.map((link, i) => (
            <motion.a
              key={link.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * (i + 1), ease: [0.16, 1, 0.3, 1] }}
              href={link.href}
              className="font-mono text-sm text-sage/80 hover:text-acid transition-colors uppercase tracking-widest"
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-sage">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-charcoal/95 backdrop-blur-lg border-b border-sage/30"
        >
          <div className="flex flex-col p-6 gap-6">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-serif text-2xl text-sage hover:text-acid transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
