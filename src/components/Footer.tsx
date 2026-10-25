import { useEffect, useRef } from 'react';
import ContactIcons from './ContactIcons';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  // Rubber-band overscroll shows the page's own background. While the footer is on screen that
  // background turns ink too, so pulling past the bottom continues the footer instead of a light band.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => root.classList.toggle('bg-ink', entry.isIntersecting));
    observer.observe(footer);
    return () => {
      observer.disconnect();
      root.classList.remove('bg-ink');
    };
  }, []);

  return (
    <footer ref={footerRef} id="contact" className="mt-28 bg-ink text-paper md:mt-40">
      <div className="wrap grid gap-8 py-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-8">
        <h2 className="h-section lg:col-span-7 lg:text-[clamp(4rem,6.4vw,6rem)]">Get in touch</h2>
        <div className="lg:col-span-5">
          <p className="max-w-xl text-lg leading-relaxed md:text-xl">
            For collaborations, postdoc opportunities or press, email me at{' '}
            <a href="mailto:qbacquele@gmail.com" className="link">
              qbacquele@gmail.com
            </a>
            .
          </p>
          <ContactIcons iconsOnly className="mt-7" />
        </div>
      </div>

      <p className="wrap pb-6 text-sm text-trace">© {new Date().getFullYear()} Quentin Bacquelé</p>
    </footer>
  );
}
