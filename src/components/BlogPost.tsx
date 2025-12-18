import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { posts } from './Blog';

// Sample content for the template post
const sampleContent = {
  'sound-of-the-canopy': {
    content: `
      <p class="lead">The Amazon rainforest speaks in frequencies we're only beginning to understand. During my recent expedition to the Madre de Dios region in Peru, I spent three weeks positioning recording equipment at various heights throughout the forest canopy, from the undergrowth to the emergent layer 50 meters above ground.</p>

      <h2>Vertical Stratification of Sound</h2>
      <p>What emerged from hundreds of hours of recordings was a revelation: the rainforest isn't a cacophony—it's a symphony organized by height. Each layer of the forest has evolved its own acoustic signature, a phenomenon ecologists call "acoustic niche partitioning."</p>

      <p>At ground level, the low-frequency rumbles of ground-dwelling birds like the Tinamou dominate. Their calls, ranging from 300-800 Hz, carry effectively through the dense undergrowth where higher frequencies would be rapidly absorbed.</p>

      <blockquote>
        <p>"The forest doesn't just stratify light—it stratifies sound. Each elevation is its own broadcast channel."</p>
      </blockquote>

      <h2>Frequency Modulation and Height</h2>
      <p>As you ascend through the canopy layers, something remarkable happens: the average frequency of vocalizations increases. Mid-canopy species like antbirds and wrens operate in the 1-4 kHz range, while canopy specialists such as tanagers and cotingas push into the 4-8 kHz territory.</p>

      <p>This isn't coincidence—it's evolution in action. Higher frequencies attenuate less in open air, making them ideal for species that vocalize above the foliage barrier. Meanwhile, lower frequencies penetrate vegetation more effectively, serving the needs of understory species.</p>

      <h2>Implications for Monitoring</h2>
      <p>Understanding this vertical acoustic structure has profound implications for passive acoustic monitoring. Traditional single-height deployments may be missing entire communities. Our data suggests that comprehensive biodiversity assessment requires a multi-height approach.</p>

      <p>The next phase of this research will deploy a vertical array of autonomous recording units, creating a 3D acoustic map of the forest. Early results suggest we may discover species interactions that have never been documented—conversations happening in frequency bands and at heights we've simply never listened to before.</p>
    `,
    references: [
      'Sueur, J., & Farina, A. (2015). Ecoacoustics: the ecological investigation and interpretation of environmental sound.',
      'Pieretti, N., Farina, A., & Morri, D. (2011). A new methodology to infer the singing activity of an avian community.'
    ]
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug);

  // Find prev/next posts for navigation
  const currentIndex = posts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-sand mb-4">Post not found</h1>
          <Link to="/" className="text-acid hover:text-terracotta transition-colors">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  const content = sampleContent[slug as keyof typeof sampleContent] || sampleContent['sound-of-the-canopy'];

  return (
    <article className="min-h-screen bg-gradient-to-b from-obsidian via-charcoal/80 to-obsidian text-sand">
      {/* Grain Overlay */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-40 px-6 py-6 md:px-12">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/#blog"
              className="group inline-flex items-center gap-3 font-mono text-sm text-sage/70 hover:text-acid transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
              <span className="tracking-widest uppercase">Back to Notes</span>
            </Link>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            href="/"
            className="text-2xl font-serif italic text-sage hover:text-acid transition-colors"
          >
            QB.
          </motion.a>
        </div>
      </nav>

      {/* Article Header */}
      <header className="pt-32 pb-16 px-6 md:px-12 relative">
        {/* Decorative element */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-acid/40 to-transparent"/>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <span className="inline-block font-mono text-[10px] text-obsidian bg-acid px-4 py-1.5 uppercase tracking-widest mb-6">
              {post.category}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-sand text-center leading-tight mb-8"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-6 text-sage/60 font-mono text-xs"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5"/>
              <span>{post.date}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-sage/40"/>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5"/>
              <span>{post.readTime}</span>
            </div>
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            <div className="w-8 h-px bg-terracotta"/>
            <div className="w-2 h-2 rotate-45 border border-terracotta"/>
            <div className="w-8 h-px bg-terracotta"/>
          </motion.div>
        </div>
      </header>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="px-6 md:px-12 pb-24"
      >
        <div className="max-w-3xl mx-auto">
          {/* Lead paragraph styling and article content */}
          <div
            className="prose prose-lg prose-invert max-w-none
              prose-headings:font-serif prose-headings:text-sand prose-headings:font-normal
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-l-2 prose-h2:border-acid prose-h2:pl-6
              prose-p:font-sans prose-p:text-sage/80 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-acid prose-a:no-underline hover:prose-a:text-terracotta prose-a:transition-colors
              prose-blockquote:border-l-2 prose-blockquote:border-terracotta prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-12
              prose-blockquote:text-sand/90 prose-blockquote:font-serif prose-blockquote:text-xl
              prose-strong:text-sand prose-strong:font-medium
              prose-code:text-acid prose-code:bg-charcoal/50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
              [&_.lead]:font-serif [&_.lead]:text-xl [&_.lead]:md:text-2xl [&_.lead]:text-sage [&_.lead]:leading-relaxed [&_.lead]:mb-12
            "
            dangerouslySetInnerHTML={{ __html: content.content }}
          />

          {/* References Section */}
          {content.references && (
            <div className="mt-20 pt-12 border-t border-sage/15">
              <h3 className="font-mono text-xs text-acid tracking-widest uppercase mb-6">References</h3>
              <ul className="space-y-3">
                {content.references.map((ref, i) => (
                  <li key={i} className="font-sans text-sm text-sage/60 leading-relaxed pl-4 border-l border-sage/20">
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Post Navigation */}
      <nav className="border-t border-sage/15 px-6 md:px-12">
        <div className="max-w-4xl mx-auto py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Previous Post */}
            <div>
              {prevPost ? (
                <Link
                  to={`/notes/${prevPost.slug}`}
                  className="group block p-6 border border-sage/15 hover:border-sage/30 transition-colors"
                >
                  <span className="font-mono text-[10px] text-sage/50 tracking-widest uppercase flex items-center gap-2 mb-3">
                    <ArrowLeft className="w-3 h-3"/>
                    Previous
                  </span>
                  <h4 className="font-serif text-lg text-sand group-hover:text-acid transition-colors">
                    {prevPost.title}
                  </h4>
                </Link>
              ) : (
                <div className="p-6 border border-sage/10 opacity-50">
                  <span className="font-mono text-[10px] text-sage/40 tracking-widest uppercase">No previous post</span>
                </div>
              )}
            </div>

            {/* Next Post */}
            <div>
              {nextPost ? (
                <Link
                  to={`/notes/${nextPost.slug}`}
                  className="group block p-6 border border-sage/15 hover:border-sage/30 transition-colors text-right"
                >
                  <span className="font-mono text-[10px] text-sage/50 tracking-widest uppercase flex items-center justify-end gap-2 mb-3">
                    Next
                    <ArrowRight className="w-3 h-3"/>
                  </span>
                  <h4 className="font-serif text-lg text-sand group-hover:text-acid transition-colors">
                    {nextPost.title}
                  </h4>
                </Link>
              ) : (
                <div className="p-6 border border-sage/10 opacity-50 text-right">
                  <span className="font-mono text-[10px] text-sage/40 tracking-widest uppercase">No next post</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-sage/15 px-6 md:px-12 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link
            to="/"
            className="font-serif italic text-xl text-sage/60 hover:text-acid transition-colors"
          >
            QB.
          </Link>
          <span className="font-mono text-xs text-sage/40">
            Quentin Bacquelé — PhD Candidate in Bioacoustics
          </span>
        </div>
      </footer>
    </article>
  );
}
