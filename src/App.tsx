import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Research from './components/Research';
import Publications from './components/Publications';
import PressTeaser from './components/PressTeaser';
import Blog from './components/Blog';
import Footer from './components/Footer';

function App() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = 'Quentin Bacquelé · Bioacoustics and biogeography of birdsong';
  }, []);

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
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main>
        <Profile />
        <Research />
        <Publications />
        <PressTeaser />
        <Blog />
      </main>

      <Footer />
    </div>
  );
}

export default App;
