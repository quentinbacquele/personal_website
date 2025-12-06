import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const posts = [
  {
    date: 'Nov 2025',
    title: 'The Sound of the Canopy',
    excerpt: 'Reflecting on the vertical stratification of acoustic communities in the Amazon rainforest. How height correlates with frequency modulation in avian vocalizations.',
    readTime: '5 min read',
    slug: '#'
  },
  {
    date: 'Oct 2025',
    title: 'Training Transformers on Spectrograms',
    excerpt: 'A deep dive into the challenges of adapting Vision Transformers (ViT) for bioacoustic classification. Why standard image augmentation fails for audio data.',
    readTime: '8 min read',
    slug: '#'
  },
  {
    date: 'Aug 2025',
    title: 'From the Field: Amazonia Expedition',
    excerpt: 'Field notes from a month in the Madre de Dios region. deploying autonomous recording units and dodging bullet ants.',
    readTime: '6 min read',
    slug: '#'
  }
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 px-6 md:px-12 border-t border-sage/20 bg-obsidian/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
             <h2 className="font-serif text-4xl md:text-5xl text-sand mb-4">Field Notes</h2>
             <p className="font-sans text-sage/70 max-w-md text-sm md:text-base">
              Musings on nature, code, and the spaces in between.
            </p>
          </div>
          
          <a href="#" className="group flex items-center gap-2 font-mono text-sm text-acid hover:text-terracotta transition-colors">
            VIEW ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col h-full bg-charcoal/30 border border-sage/10 p-6 hover:border-acid/30 transition-all duration-500 hover:bg-charcoal/50"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-xs text-acid border border-acid/20 px-2 py-1 rounded-sm">
                  {post.date}
                </span>
                <span className="font-mono text-xs text-sage/50">
                  {post.readTime}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-sand mb-4 group-hover:text-acid transition-colors">
                {post.title}
              </h3>
              
              <p className="font-sans text-sage/70 text-sm leading-relaxed flex-grow mb-8">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-2 text-surf group-hover:text-sand transition-colors font-mono text-xs tracking-widest uppercase pt-6 border-t border-sage/10">
                Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
