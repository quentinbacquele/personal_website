import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const publications = [
  {
    year: '2024',
    title: 'Deep Learning in Bioacoustics: A New Era for Ecological Monitoring',
    journal: 'Journal of Ecology & Evolution',
    tags: ['AI', 'Bioacoustics'],
    link: '#'
  },
  {
    year: '2023',
    title: 'Global Patterns of Avian Vocalization Diversity',
    journal: 'Nature Communications',
    tags: ['Biogeography', 'Data Analysis'],
    link: '#'
  },
  {
    year: '2023',
    title: 'Unsupervised Clustering of Rainforest Soundscapes',
    journal: 'IEEE Transactions on Audio',
    tags: ['Machine Learning', 'Signal Processing'],
    link: '#'
  }
];

export default function Research() {
  return (
    <section id="research" className="py-24 px-6 md:px-12 border-t border-sage/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
          <h2 className="font-serif text-4xl md:text-5xl text-sand">Selected Research</h2>
          <p className="font-sans text-sage/70 max-w-md text-sm md:text-base">
            Exploring the intersection of biological complexity and computational abstraction.
          </p>
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
              className="group block border-t border-sage/25 py-8 hover:bg-terracotta/5 transition-colors relative"
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-baseline justify-between">
                <div className="font-mono text-acid text-sm w-24 shrink-0">{pub.year}</div>
                
                <div className="flex-grow max-w-3xl">
                  <h3 className="font-serif text-2xl md:text-3xl text-sand mb-2 group-hover:text-acid transition-colors">
                    {pub.title}
                  </h3>
                  <div className="font-sans text-sage/70 text-sm">{pub.journal}</div>
                </div>

                <div className="flex gap-3 items-center shrink-0">
                  {pub.tags.map(tag => (
                    <span key={tag} className="hidden md:inline-block px-3 py-1 border border-sage/30 rounded-full text-xs font-mono text-sage/80">
                      {tag}
                    </span>
                  ))}
                  <ArrowUpRight className="w-5 h-5 text-sage/60 group-hover:text-acid group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
