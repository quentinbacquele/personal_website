import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative pt-20">
      <div className="max-w-7xl mx-auto w-full">
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-mono text-surf text-sm md:text-base mb-6 tracking-[0.2em] uppercase"
        >
          PhD Candidate • Bioacoustics • AI
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl text-sand leading-[0.9] mb-2"
          >
            Quentin
          </motion.h1>
        </div>
        
        <div className="overflow-hidden mb-8 md:mb-12">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl text-sand italic leading-[0.9]"
          >
            Bacquelé
          </motion.h1>
        </div>

        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-lg md:text-xl text-sage/80 leading-relaxed"
          >
            Decoding the language of nature through computational intelligence. 
            Bridging the gap between <span className="text-acid">biogeography</span> and <span className="text-acid">machine learning</span> to understand ecological patterns.
          </motion.p>
        </div>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-mono text-xs text-sage/70 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-4 h-4 text-acid" />
        </motion.div>
      </motion.div>
    </section>
  );
}
