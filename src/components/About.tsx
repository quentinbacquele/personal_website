import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-charcoal relative overflow-hidden border-t border-sage/20">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-terracotta/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div>
           <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-obsidian/80 border border-sage/20 relative overflow-hidden p-8 flex items-end group"
          >
             {/* Profile Image */}
             <img 
               src="/images/IMG_3144_jpg.JPG" 
               alt="Quentin Bacquelé"
               className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700"
             />
             
             {/* Gradient Overlay for Text Readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />

             <div className="relative z-10">
                <div className="font-mono text-xs text-acid mb-2">CURRENTLY</div>
                <div className="font-sans text-sand text-sm">
                  PhD Candidate at EPHE Paris PSL, ENES Bioacoustics Lab & CEFE Montpellier.<br/>
                  Based in Lyon.
                </div>
             </div>
          </motion.div>
        </div>

        <div className="space-y-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-sand"
          >
            About
          </motion.h2>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="space-y-6 text-sage/80 font-sans leading-relaxed text-lg"
          >
            <p>
              I'm a PhD candidate in <span className="text-sand font-medium">acoustic biogeography</span>. I believe bioacoustics should be scaled to the biogeographic level, uncovering patterns that remain invisible at local scales. The rise of machine learning in bioacoustics, combined with vast amounts of available data and techniques from spatial, phylogenetic, and functional ecology, is opening the door to a <span className="text-acid/90 font-medium">new macroecological framework</span> for studying acoustic communication.
            </p>
            <p>
              I'm drawn to multidisciplinary science, integrating <span className="text-sand">acoustics, behavior, ecology, and machine learning</span>. I enjoy exploring new methodologies for understanding animal communication. I also appreciate creating <span className="text-sand font-medium">beautiful, interactive visualizations</span> and figures.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/cv"
              className="inline-flex items-center gap-2 px-8 py-4 bg-acid/10 border border-acid text-acid font-mono text-sm uppercase tracking-widest hover:bg-acid hover:text-obsidian transition-all duration-300"
            >
              View Full CV
              <span className="text-lg leading-none">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
