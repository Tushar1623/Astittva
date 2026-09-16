import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { blogPosts } from '../data/project';

export default function Blog() {
  return (
    <>
      <SEO title="Property Insights" description="Property buying guides, Kolkata real estate insights and plot investment tips." path="/blog" />
      <div className="section-padding pb-24">
        <div className="container-main max-w-3xl">
          <h1 className="font-display text-4xl font-bold">Property Insights</h1>
          <p className="mt-2 text-brand-muted">Guides for plot buyers near New Town</p>
          <div className="mt-10 space-y-6">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="card block transition hover:shadow-md">
                <span className="text-xs font-medium text-brand-green">{post.category}</span>
                <h2 className="mt-2 font-display text-xl font-semibold">{post.title}</h2>
                <p className="mt-2 text-sm text-brand-muted">{post.excerpt}</p>
                <p className="mt-3 text-xs text-brand-muted">{post.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <div className="section-padding text-center">Article not found</div>;
  }

  return (
    <>
      <SEO title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} />
      <div className="section-padding pb-24">
        <div className="container-main max-w-2xl">
          <Link to="/blog" className="text-sm text-brand-green hover:underline">← Back to Blog</Link>
          <span className="mt-4 block text-xs font-medium text-brand-green">{post.category}</span>
          <h1 className="mt-2 font-display text-4xl font-bold">{post.title}</h1>
          <div className="mt-8 card text-sm text-stone-600 bg-white border border-stone-200 p-6 rounded-2xl space-y-3">
            <p>
              Looking to explore available plots, examine master plan blueprints, or discuss tenure financing options for Ridhi Bhoomi? Our dedicated team is available to assist you.
            </p>
            <Link to="/contact" className="btn-gold py-2.5 px-6 text-xs uppercase tracking-wider inline-block">
              Enquire About Plots
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
