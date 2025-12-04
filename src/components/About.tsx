import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-charcoal relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-terracotta/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div>
           <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-obsidian/80 border border-sage/20 relative overflow-hidden p-8 flex items-end"
          >
             {/* Abstract representation of bioacoustics */}
             <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #f6a341 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
             }}></div>
             
             <div className="font-serif text-9xl text-sand/10 absolute -top-10 -left-10 leading-none">
               QB
             </div>

             <div className="relative z-10">
                <div className="font-mono text-xs text-acid mb-2">CURRENTLY</div>
                <div className="font-sans text-sand text-sm">
                  PhD Candidate at [University Name]<br/>
                  Based in [Location]
                </div>
             </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-sage"
          >
            Listening to the Pulse <br/> of the Planet.
          </motion.h2>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="space-y-6 text-sage/80 font-sans leading-relaxed text-lg"
          >
            <p>
              My work exists at the convergence of ecology and technology. By leveraging advanced machine learning algorithms, I decode the complex acoustic signals of ecosystems to understand biodiversity patterns on a global scale.
            </p>
            <p>
              I believe that sound is an untapped dimension of biological data—one that can reveal the hidden dynamics of our changing world more immediately than visual observation alone.
            </p>
            <p>
              When I'm not training models or deploying sensors in the field, I'm exploring the philosophy of AI and its role in future conservation efforts.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
