import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { posts } from './Blog';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug);

  // Find prev/next posts for navigation
  const currentIndex = posts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <h1 className="condensed mb-4 text-5xl font-semibold">Post not found</h1>
          <Link to="/" className="link">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-paper text-ink">
      {/* Navigation Header */}
      <nav className="wrap flex h-16 items-center justify-between">
        <Link
          to="/#blog"
          className="inline-flex items-center gap-2 text-[15px] decoration-1 underline-offset-[0.3em] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Notes
        </Link>
        <Link to="/" className="condensed text-2xl font-semibold">
          QB.
        </Link>
      </nav>

      {/* Article Header */}
      <header className="wrap pt-12 md:pt-20">
        <div className="max-w-4xl">
          <p className="meta">
            {post.category}, {post.date}, {post.readTime}
          </p>
          <h1 className="h-section mt-4">{post.title}</h1>
        </div>
      </header>

      {/* Article Content */}
      <div className="wrap pb-24 pt-10">
        <div className="rule max-w-3xl pt-10">
          <div
            className="prose prose-lg max-w-none text-ink
              prose-headings:font-semibold prose-headings:text-ink prose-headings:[font-stretch:88%]
              prose-h2:mb-5 prose-h2:mt-14
              prose-p:leading-relaxed prose-p:text-ink
              prose-a:text-ink prose-a:decoration-1 prose-a:underline-offset-[0.2em] hover:prose-a:decoration-2
              prose-blockquote:border-l-[3px] prose-blockquote:border-ink prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:text-ink
              prose-strong:text-ink
              prose-code:rounded-none prose-code:bg-paper-deep prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-ink prose-code:before:content-none prose-code:after:content-none
              [&_.lead]:text-xl [&_.lead]:leading-relaxed [&_.lead]:text-graphite md:[&_.lead]:text-2xl
            "
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />

          {/* References Section */}
          {post.references && post.references.length > 0 && (
            <div className="rule mt-20 pt-8">
              <h2 className="semi-condensed mb-6 text-lg font-semibold">References</h2>
              <ul className="space-y-3">
                {post.references.map((ref, i) => (
                  <li key={i} className="text-sm leading-relaxed text-graphite">
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Post Navigation */}
      <nav className="wrap pb-16" aria-label="More notes">
        <div className="grid gap-6 border-t border-trace pt-10 md:grid-cols-2">
          {/* Previous Post */}
          <div>
            {prevPost ? (
              <Link to={`/notes/${prevPost.slug}`} className="group block bg-plate p-6">
                <span className="mb-3 flex items-center gap-2 text-sm text-graphite">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Previous
                </span>
                <h4 className="semi-condensed text-lg font-semibold decoration-1 underline-offset-[0.2em] group-hover:underline">
                  {prevPost.title}
                </h4>
              </Link>
            ) : (
              <div className="bg-paper-deep p-6">
                <span className="text-sm text-graphite">No previous post</span>
              </div>
            )}
          </div>

          {/* Next Post */}
          <div>
            {nextPost ? (
              <Link to={`/notes/${nextPost.slug}`} className="group block bg-plate p-6 text-right">
                <span className="mb-3 flex items-center justify-end gap-2 text-sm text-graphite">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h4 className="semi-condensed text-lg font-semibold decoration-1 underline-offset-[0.2em] group-hover:underline">
                  {nextPost.title}
                </h4>
              </Link>
            ) : (
              <div className="bg-paper-deep p-6 text-right">
                <span className="text-sm text-graphite">No next post</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-ink text-paper">
        <div className="wrap flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <Link to="/" className="condensed text-2xl font-semibold">
            QB.
          </Link>
          <span className="text-sm text-trace">Quentin Bacquelé — PhD Candidate in Bioacoustics</span>
        </div>
      </footer>
    </article>
  );
}
