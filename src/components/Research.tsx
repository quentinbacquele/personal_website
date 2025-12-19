import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const publications = [
  {
    year: '2025',
    title: 'HAC-Net: Learning Natural Units from Acoustic Change',
    journal: 'NeurIPS 2025',
    tags: ['Deep Learning', 'Bioacoustics'],
    link: 'https://openreview.net/pdf?id=VWLd8irCtH'
  },
  {
    year: 'N/A',
    title: 'A novel contour-based approach for quantifying cryptic vocal dialects in songbirds',
    journal: 'In Preparation',
    tags: ['Bioacoustics', 'Dialects'],
    link: '#'
  },
  {
    year: 'N/A',
    title: 'The global biogeography of passerine songs',
    journal: 'In Preparation',
    tags: ['Biogeography', 'Macroecology'],
    link: '#'
  }
];

export default function Research() {
  return (
    <section id="research" className="py-24 px-6 md:px-20 border-t border-sage/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
          <h2 className="font-serif text-4xl md:text-5xl text-sand">Selected Research</h2>
        </div>

        <div className="space-y-0">
          {publications.map((pub, index) => (
            <motion.a
              key={index}
              href={pub.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group block border-t border-sage/25 py-10 px-4 md:px-8 hover:bg-terracotta/5 transition-colors relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-4 md:gap-12 items-start">
                {/* Year */}
                <div className="font-mono text-acid text-sm">{pub.year}</div>

                {/* Title & Journal */}
                <div>
                  <h3 className="font-serif text-xl md:text-2xl text-sand mb-2 group-hover:text-acid transition-colors leading-relaxed tracking-wide">
                    {pub.title}
                  </h3>
                  <div className="font-sans text-sage/70 text-sm italic">{pub.journal}</div>
                  {/* Tags - mobile */}
                  <div className="flex gap-2 mt-3 md:hidden">
                    {pub.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 border border-sage/30 rounded-full text-[10px] font-mono text-sage/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags & Arrow - desktop */}
                <div className="hidden md:flex gap-3 items-start pt-1">
                  {pub.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 border border-sage/30 rounded-full text-xs font-mono text-sage/80">
                      {tag}
                    </span>
                  ))}
                  <ArrowUpRight className="w-5 h-5 text-sage/60 group-hover:text-acid group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-2" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
