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

// Real posts go here. The first entry is featured. While empty, the section and its nav link stay hidden.
export const posts: Post[] = [];

export default function Blog() {
  const [featured, ...rest] = posts;

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="wrap pt-24 md:pt-36">
      <h2 className="h-section mb-8 md:mb-12">Notes</h2>

      {featured && (
        <Link to={`/notes/${featured.slug}`} className="group rule block pt-6">
          <p className="meta">
            {featured.category}, {featured.date}, {featured.readTime}
          </p>
          <h3 className="h-record mt-3 max-w-4xl decoration-2 underline-offset-[0.12em] group-hover:underline">
            {featured.title}
          </h3>
          <p className="prose-body mt-4 text-graphite">{featured.excerpt}</p>
          <span className="mt-5 inline-block text-[15px] font-semibold underline decoration-1 underline-offset-[0.25em] group-hover:decoration-2">
            Read note
          </span>
        </Link>
      )}

      {rest.length > 0 && (
        <>
          <h3 className="semi-condensed mb-4 mt-16 text-lg font-semibold">More notes</h3>
          <div className="rule grid gap-x-12 md:grid-cols-2">
            {rest.map((post) => (
              <Link key={post.slug} to={`/notes/${post.slug}`} className="group block border-b border-trace py-6">
                <p className="meta">
                  {post.category}, {post.date}
                </p>
                <h4 className="semi-condensed mt-2 text-xl font-semibold leading-snug decoration-1 underline-offset-[0.2em] group-hover:underline">
                  {post.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-graphite">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
