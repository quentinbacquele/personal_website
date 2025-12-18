import { motion } from 'framer-motion';

export const posts: Array<{
  date: string;
  title: string;
  excerpt: string;
  readTime: string;
  slug: string;
  category: string;
}> = [];

export default function Blog() {
  return (
    <section id="blog" className="py-24 px-6 md:px-12 border-t border-sage/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-16">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs text-acid tracking-[0.3em] uppercase block mb-3"
          >
            Journal
          </motion.span>
          <div className="relative inline-block">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-5xl md:text-6xl text-sand"
            >
              Notes
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-3 left-0 w-24 h-[2px] bg-terracotta origin-left"
            />
          </div>
        </div>

        {/* Featured Post Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="block relative">
            <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
              {/* Left: Large number */}
              <div className="hidden md:flex md:col-span-1 items-start justify-center pt-2">
                <span className="font-serif text-[8rem] leading-none text-charcoal select-none">
                  01
                </span>
              </div>

              {/* Right: Content */}
              <div className="md:col-span-4 border-l-2 border-sage/20 pl-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-[10px] text-obsidian bg-sage/30 px-3 py-1 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <h3 className="font-serif text-3xl md:text-4xl text-sage/40 mb-4 leading-tight">
                  Notes from the field
                </h3>

                <p className="font-sans text-sage/40 text-base leading-relaxed max-w-2xl mb-6">
                  Field research notes, technical deep-dives, and expedition journals will be shared here.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="flex-1 h-px bg-sage/15"/>
          <span className="font-mono text-[10px] text-sage/40 tracking-widest">MORE NOTES</span>
          <div className="flex-1 h-px bg-sage/15"/>
        </div>

        {/* Other Posts Placeholder - Staggered Layout */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {[0, 1].map((index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={index === 0 ? 'md:translate-y-8' : ''}
            >
              <div className="block py-6 border-b border-sage/10">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[10px] text-sage/30 uppercase tracking-wider">
                        Pending
                      </span>
                    </div>

                    <div className="h-5 w-48 bg-sage/10 rounded mb-2" />

                    <div className="h-4 w-full bg-sage/5 rounded mb-1" />
                    <div className="h-4 w-3/4 bg-sage/5 rounded" />
                  </div>

                  <div className="shrink-0 w-10 h-10 rounded-full border border-sage/10 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-sage/10" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
