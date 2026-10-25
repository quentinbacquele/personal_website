import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { posts } from './Blog';

const links = [
  { name: 'Research', href: '/#research' },
  { name: 'Publications', href: '/#publications' },
  // Notes appears once the first post is published.
  ...(posts.length > 0 ? [{ name: 'Notes', href: '/#blog' }] : []),
  { name: 'Press', href: '/press' },
  { name: 'CV', href: '/cv' },
  // Every page ends with the contact footer.
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // The bar only draws its edge once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (href: string) =>
    `decoration-1 underline-offset-[0.3em] hover:underline ${
      location.pathname === href ? 'underline decoration-2' : ''
    }`;

  const renderLink = (link: { name: string; href: string }, extra = '') => {
    const inPage = link.href.startsWith('#') || (isHomePage && link.href.startsWith('/#'));
    return inPage ? (
      <a
        key={link.name}
        href={link.href.replace(/^\//, '')}
        onClick={(e) => {
          e.preventDefault();
          document.querySelector(link.href.replace(/^\//, ''))?.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }}
        className={`${linkClass(link.href)} ${extra}`}
      >
        {link.name}
      </a>
    ) : (
      <Link
        key={link.name}
        to={link.href}
        onClick={() => setIsOpen(false)}
        aria-current={location.pathname === link.href ? 'page' : undefined}
        className={`${linkClass(link.href)} ${extra}`}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-paper transition-colors ${
        scrolled || isOpen ? 'border-ink/15' : 'border-transparent'
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <Link
          to="/"
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-[15px] font-semibold"
        >
          Quentin Bacquelé
        </Link>

        <div className="hidden items-center gap-7 text-[15px] md:flex">{links.map((link) => renderLink(link))}</div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="-mr-1 p-1 md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="wrap flex flex-col pb-4 pt-1 text-lg">{links.map((link) => renderLink(link, 'py-2.5'))}</div>
        </div>
      )}
    </nav>
  );
}
