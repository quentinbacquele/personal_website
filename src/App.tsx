import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Research from './components/Research';
import Blog from './components/Blog';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian via-charcoal/80 to-obsidian text-sand selection:bg-acid selection:text-obsidian font-sans">
      {/* Global Grain Overlay */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <Navbar />
      
      <main className="relative z-10">
        <Hero />
        <Research />
        <About />
        <Blog />
        <Contact />
      </main>
    </div>
  );
}

export default App;