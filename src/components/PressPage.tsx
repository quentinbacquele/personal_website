import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PressCard from './PressCard';
import { commentary, featuredInterviews, interviews } from '../data/press';

export default function PressPage() {
  useEffect(() => {
    document.title = 'Press · Quentin Bacquelé';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <header className="wrap pt-8 md:pt-12">
        <h1 className="condensed text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.85] tracking-[-0.015em]">
          Press
        </h1>
        <p className="mt-6 text-[15px]">
          Press enquiries:{' '}
          <a href="mailto:qbacquele@gmail.com" className="link">
            qbacquele@gmail.com
          </a>
        </p>
      </header>

      <main className="wrap">
        <section className="pt-16 md:pt-24">
          <h2 className="h-record mb-8 border-b-[3px] border-ink pb-4 md:mb-10">Interviews</h2>
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
            {featuredInterviews.map((item) => (
              <PressCard key={item.outlet} item={item} size="feature" />
            ))}
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-10 border-t border-trace pt-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
            {interviews.map((item) => (
              <PressCard key={item.outlet} item={item} size="compact" />
            ))}
          </div>
        </section>

        <section className="pt-20 md:pt-28">
          <h2 className="h-record mb-8 border-b-[3px] border-ink pb-4 md:mb-10">Commentary and news</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {commentary.map((item) => (
              <PressCard key={item.outlet} item={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
