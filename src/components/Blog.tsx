import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Post = {
  date: string;
  title: string;
  excerpt: string;
  readTime: string;
  slug: string;
  category: string;
  /** Article body as HTML. Rendered on the /notes/:slug page. */
  content?: string;
  references?: string[];
};

// Real posts go here. The first entry is featured. Empty = tasteful "coming soon" state.
export const posts: Post[] = [];

export default function Blog() {
  const [featured, ...rest] = posts;

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

        {posts.length === 0 ? (
          /* Empty state — honest, minimal, no fake content */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-sage/15 rounded-2xl px-8 py-16 md:py-20 text-center"
          >
            <span className="inline-block font-mono text-[10px] text-obsidian bg-sage/40 px-3 py-1 uppercase tracking-wider mb-6">
              Coming Soon
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-sand mb-3">
              The first note is on its way
            </h3>
            <p className="font-sans text-sage/60 text-base leading-relaxed max-w-xl mx-auto">
              Plain-language write-ups of the research, technical deep-dives, and field notes will
              appear here. First up: the story behind the work.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <Link to={`/notes/${featured.slug}`} className="group block relative">
                  <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
                    <div className="hidden md:flex md:col-span-1 items-start justify-center pt-2">
                      <span className="font-serif text-[8rem] leading-none text-charcoal select-none">
                        01
                      </span>
                    </div>

                    <div className="md:col-span-4 border-l-2 border-sage/20 group-hover:border-acid transition-colors pl-6 md:pl-8">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-sage/50">
                        <span className="text-obsidian bg-acid px-3 py-1">{featured.category}</span>
                        <span>{featured.date}</span>
                        <span className="w-1 h-1 rounded-full bg-sage/40" />
                        <span>{featured.readTime}</span>
                      </div>

                      <h3 className="font-serif text-3xl md:text-4xl text-sand group-hover:text-acid transition-colors mb-4 leading-tight">
                        {featured.title}
                      </h3>

                      <p className="font-sans text-sage/70 text-base leading-relaxed max-w-2xl mb-6">
                        {featured.excerpt}
                      </p>

                      <span className="inline-flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest">
                        Read note
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Remaining posts */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4 my-12">
                  <div className="flex-1 h-px bg-sage/15" />
                  <span className="font-mono text-[10px] text-sage/40 tracking-widest">MORE NOTES</span>
                  <div className="flex-1 h-px bg-sage/15" />
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                  {rest.map((post, index) => (
                    <motion.article
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={`/notes/${post.slug}`}
                        className="group block py-6 border-b border-sage/10"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3 font-mono text-[10px] uppercase tracking-wider text-sage/40">
                              <span>{post.category}</span>
                              <span>{post.date}</span>
                            </div>
                            <h4 className="font-serif text-xl text-sand group-hover:text-acid transition-colors mb-2 leading-snug">
                              {post.title}
                            </h4>
                            <p className="font-sans text-sm text-sage/60 leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                          <div className="shrink-0 w-10 h-10 rounded-full border border-sage/15 group-hover:border-acid/60 flex items-center justify-center transition-colors">
                            <ArrowUpRight className="w-4 h-4 text-sage/50 group-hover:text-acid transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
