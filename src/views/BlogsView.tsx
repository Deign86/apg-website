import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link, Navigate, useLocation, useMatch } from 'react-router-dom';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/companyData';
import { fetchList, peekList } from '../lib/listCache';
import { blogCompany, blogSeo, type BlogArticle } from '../lib/blogSeo';
import Seo from '../components/Seo';
import { BlogBody } from '../components/BlogBody';
import { Calendar, Clock, ArrowLeft, ArrowRight, Search, BookOpen, Sparkles } from 'lucide-react';

// List fields only: an article's own page (/blogs/:slug) loads its body by slug.
const BLOGS_URL = '/api/blogs.php?summary=1';
// Cards rendered up front; older posts follow on "Load more" (the archive runs to hundreds of posts).
const PAGE_SIZE = 12;
const FALLBACK_IMAGE = '/assets/images/blogs-recent-img.webp';
const DEFAULT_READ_TIME = '5 min read';
// One formatter for every post (toLocaleDateString with options builds a new one per call).
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/** "2026-10-09 19:06:03" as "October 9, 2026" (the 'T' form parses as local time in every browser). */
const formatDate = (value: string) => {
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
};

/** A list card: the post plus its slug and company (enterprise slug). */
type ListPost = BlogPost & { slug: string; enterprise: string };
/** A row as /api/blogs.php writes it: any field may be missing or null. */
type Row = Partial<Record<keyof BlogArticle | 'id' | 'is_featured', string | number | null>>;

const text = (value: string | number | null | undefined): string => (value == null ? '' : String(value));

const toBlogPost = (r: Row): ListPost => ({
  id: text(r.id),
  title: text(r.title),
  slug: text(r.slug) || text(r.id),
  summary: text(r.excerpt),
  content: text(r.content),
  image: text(r.cover_image_url) || FALLBACK_IMAGE,
  category: text(r.category).toUpperCase() || 'CORPORATE',
  date: r.published_at ? formatDate(text(r.published_at)) : 'Recent',
  readTime: text(r.read_time) || DEFAULT_READ_TIME,
  author: {
    name: 'APG Editorial Board',
    role: 'Executive Contributor',
  },
  featured: Number(r.is_featured) === 1,
  enterprise: text(r.enterprise_slug),
});

const toBlogArticle = (r: Row): BlogArticle | null => {
  const a: BlogArticle = {
    slug: text(r.slug),
    title: text(r.title),
    excerpt: text(r.excerpt),
    content: text(r.content),
    category: text(r.category),
    enterprise_slug: text(r.enterprise_slug),
    published_at: text(r.published_at),
    updated_at: text(r.updated_at),
    cover_image_url: text(r.cover_image_url),
    read_time: text(r.read_time),
  };
  return a.slug && a.title ? a : null;
};

const FALLBACK_POSTS: ListPost[] = BLOG_POSTS.map((p) => ({ ...p, slug: p.slug || String(p.id), enterprise: 'corporate' }));

// Articles opened this session; null = no published post has that slug.
const articles = new Map<string, BlogArticle | null>();

/** The article at /blogs/:slug: undefined while loading, null when it isn't published, 'error' when the request failed. */
function useBlogArticle(slug: string | undefined): BlogArticle | null | 'error' | undefined {
  const [settled, setSettled] = useState<{ slug: string; result: BlogArticle | null | 'error' } | null>(null);
  // Back on the list, a failed request is forgotten, so reopening the article retries without first showing it.
  if (!slug && settled) setSettled(null);

  useEffect(() => {
    if (!slug || articles.has(slug)) return undefined;
    let live = true;
    fetch(`/api/blogs.php?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (res.status === 404) return null;
        // SAFETY: same-origin endpoint with a fixed row shape; every field is re-normalised by toBlogArticle.
        const json = (await res.json()) as { success?: boolean; data?: Row | null };
        const post = json.success === true && json.data ? toBlogArticle(json.data) : null;
        if (!res.ok || !post) throw new Error(`Blog post ${slug}: HTTP ${res.status}`);
        return post;
      })
      .then(
        (post) => {
          articles.set(slug, post);
          if (live) setSettled({ slug, result: post });
        },
        () => { if (live) setSettled({ slug, result: 'error' }); },
      );
    return () => { live = false; };
  }, [slug]);

  if (!slug) return undefined;
  if (articles.has(slug)) return articles.get(slug);
  return settled?.slug === slug ? settled.result : undefined;
}

/** A grid card; its title is the link, stretched over the whole card. */
const PostCard: React.FC<{ post: ListPost }> = ({ post }) => (
  <div className="relative bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 flex flex-col justify-between space-y-4 transition-all duration-200 group rounded-xl shadow-xl">
    <div className="space-y-3">

      <div className="relative h-44 w-full border border-neutral-800 overflow-hidden rounded-lg">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 bg-[#D4AF37] text-neutral-950 font-bold text-xs px-2 py-0.5 uppercase rounded">
          {post.category}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[#D4AF37]" />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#D4AF37]" />
          {post.readTime}
        </span>
      </div>

      <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
        <Link
          to={`/blogs/${post.slug}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#D4AF37]"
        >
          {post.title}
        </Link>
      </h3>

      <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
        {post.summary}
      </p>

    </div>

    <div aria-hidden="true" className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-[#D4AF37] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
      <span>READ ARTICLE</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </div>

  </div>
);

interface BlogArticlePageProps {
  slug: string;
  /** undefined while loading, 'error' when it could not be loaded. */
  article: BlogArticle | 'error' | undefined;
  posts: ListPost[];
}

function BlogArticlePage({ slug, article, posts }: BlogArticlePageProps) {
  // An article opens at the top (a card or related-post link would otherwise keep the scroll position).
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const post = article === 'error' ? undefined : article;
  const enterprise = post?.enterprise_slug ?? posts.find((p) => p.slug === slug)?.enterprise;
  // More reading: the same company's latest posts first, then everyone else's.
  const others = posts.filter((p) => p.slug !== slug);
  const related = [...others.filter((p) => p.enterprise === enterprise), ...others.filter((p) => p.enterprise !== enterprise)].slice(0, 3);

  return (
    <div className="bg-transparent text-neutral-100 font-sans min-h-screen pb-20">
      {post && <Seo {...blogSeo(post)} />}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <Link to="/blogs" className="inline-flex items-center gap-2 min-h-10 text-xs font-bold tracking-widest uppercase text-[#D4AF37] hover:text-[#FFF3D1] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          All articles
        </Link>

        {post ? (
          <>
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
                {post.category && (
                  <span className="bg-[#D4AF37] text-neutral-950 px-2 py-0.5 font-bold tracking-wider uppercase rounded-md">
                    {post.category}
                  </span>
                )}
                <span className="font-semibold text-neutral-200">{blogCompany(post.enterprise_slug).name}</span>
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
                  {post.read_time || DEFAULT_READ_TIME}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {post.title}
              </h1>
            </header>

            <div className="h-64 sm:h-96 max-h-[50dvh] w-full overflow-hidden border border-neutral-800 rounded-xl">
              <img src={post.cover_image_url || FALLBACK_IMAGE} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <div className="text-sm sm:text-base text-neutral-300 space-y-4 leading-relaxed">
              <BlogBody
                content={post.content}
                paragraphClassName="text-neutral-300"
                headingClassName="text-base sm:text-lg font-bold text-[#D4AF37] uppercase tracking-wider pt-2"
                strongClassName="text-white font-semibold"
                listClassName="list-disc pl-5 space-y-1 text-neutral-300"
              />
            </div>

            <div className="bg-black border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase">
                  Explore Business & Real Estate Solutions
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Consult with Alpha Premier Group specialists regarding Ortigas commercial space and virtual offices.
                </p>
              </div>
              <Link
                to="/inquire"
                className="px-5 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all whitespace-nowrap rounded-lg"
              >
                INQUIRE NOW
              </Link>
            </div>
          </>
        ) : article === 'error' ? (
          <div className="py-12 space-y-3">
            <h1 className="text-2xl font-extrabold text-white">This article could not be loaded</h1>
            <p className="text-sm text-neutral-400">Please try again later.</p>
          </div>
        ) : (
          <p role="status" className="py-12 text-sm text-neutral-400 animate-pulse">Loading article…</p>
        )}
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-articles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-4">
          <h2 id="related-articles" className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
            More articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export const BlogsView: React.FC = () => {
  const slug = useMatch('/blogs/:slug')?.params.slug;
  const sharedPost = new URLSearchParams(useLocation().search).get('post');
  // Live posts, kept for the session (src/lib/listCache); BLOG_POSTS renders while the first request
  // loads and only replaces them if it fails.
  // SAFETY: the list rows of /api/blogs.php have a fixed shape; every field is re-normalised by toBlogPost.
  const [postsList, setPostsList] = useState<ListPost[]>(() => (peekList(BLOGS_URL) as Row[] | undefined)?.map(toBlogPost) ?? FALLBACK_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const article = useBlogArticle(slug);

  useEffect(() => {
    fetchList(BLOGS_URL)
      .then((rows) => {
        // SAFETY: as above, a fixed row shape re-normalised by toBlogPost.
        setPostsList((rows as Row[]).map(toBlogPost));
      })
      .catch(() => setPostsList(FALLBACK_POSTS));
  }, []);

  // Links shared from the former article reader (/blogs?post=<slug>) land on the article's own page.
  if (!slug && sharedPost) return <Navigate to={`/blogs/${encodeURIComponent(sharedPost)}`} replace />;
  // The list stays mounted under an article, so Back finds its filters and "Load more" as they were.
  if (slug && article !== null) return <BlogArticlePage slug={slug} article={article} posts={postsList} />;

  // Pills come from the posts themselves (categories are uppercased above, so the match is
  // case-insensitive): the most used categories first, capped to keep the row short.
  const categoryCounts = postsList.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const categories = ['ALL', ...Object.keys(categoryCounts)
    .sort((a, b) => categoryCounts[b] - categoryCounts[a] || a.localeCompare(b))
    .slice(0, 8)];

  const featuredPost = postsList.find((p) => p.featured) || postsList[0];
  const regularPosts = postsList.filter((p) => p.id !== featuredPost?.id);

  const filteredPosts = (selectedCategory === 'ALL' && !searchTerm ? regularPosts : postsList).filter((post) => {
    const matchesCat = selectedCategory === 'ALL' || post.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });
  const shownPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="bg-transparent text-neutral-100 font-sans min-h-screen pb-20">

      {/* /blogs/<slug> of a post that isn't published: the list, with a notice, kept out of search results. */}
      {slug && (
        <>
          <Seo
            noindex
            title="Article not available | Alpha Premier Group"
            description="This article isn't available. Browse news and insights from Alpha Premier Group and its companies."
          />
          <div role="status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="bg-[#0B0D12] border border-[#D4AF37]/40 rounded-xl px-5 py-4 text-sm text-neutral-300">
              <p className="font-bold text-white">This article isn't available</p>
              <p className="text-neutral-400">It may have been moved or unpublished. Browse all our articles below.</p>
            </div>
          </div>
        </>
      )}

      {/* Header Banner */}
      <section className="bg-[#140F06]/80 border-b border-[#D4AF37]/30 py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-4 z-10 flex flex-col items-center">
          {/* Ambient Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_70%)] pointer-events-none" />

          {/* Rotated Diamond Crest Icon */}
          <div className="w-10 h-10 rotate-45 bg-[#1C1508] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center z-10">
            <BookOpen className="w-5 h-5 -rotate-45 text-[#D4AF37]" />
          </div>

          {/* Badge flanked by side golden filigree wing bars */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>INSIGHTS &amp; NEWSROOM</span>
            </div>
            <span className="text-[#D4AF37] text-xs">✦</span>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight z-10">
            Alpha Premier{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              Blog
            </span>
          </h1>

          <p className="text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal z-10">
            Industry insights, property market updates, construction trends, and corporate news from Alpha Premier Group of Companies.
          </p>
        </div>
      </section>

      {/* Category Pills & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-3 py-2.5 md:py-1.5 text-xs font-bold tracking-widest uppercase transition-all rounded-lg ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-neutral-950 font-extrabold'
                    : 'bg-[#0B0D12] text-neutral-400 border border-neutral-800 hover:text-white hover:border-[#D4AF37]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="blog-search"
              name="search"
              aria-label="Search articles"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search articles..."
              className="w-full bg-[#0B0D12] border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-400 outline-none rounded-lg"
            />
          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Featured Article Card; its title is the link, stretched over the whole card */}
        {featuredPost && selectedCategory === 'ALL' && !searchTerm && (
          <div className="relative bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 sm:p-8 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group rounded-2xl shadow-xl">
            <div className="lg:col-span-7 space-y-4">

              <div className="flex items-center space-x-3">
                <span className="bg-[#D4AF37] text-neutral-950 px-2.5 py-0.5 font-bold text-xs tracking-wider uppercase rounded-md">
                  {featuredPost.category}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {featuredPost.date}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                <Link
                  to={`/blogs/${featuredPost.slug}`}
                  className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#D4AF37]"
                >
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {featuredPost.summary}
              </p>

              <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800 pt-4">
                <span className="font-semibold text-neutral-300">{featuredPost.author.name}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {featuredPost.readTime}
                </span>
              </div>

              <div className="pt-2" aria-hidden="true">
                <span className="inline-flex px-6 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase items-center gap-2 group-hover:bg-[#FFF3D1] transition-all rounded-lg">
                  <span>READ FULL ARTICLE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>

            <div className="lg:col-span-5 h-64 sm:h-80 border border-neutral-800 overflow-hidden rounded-xl">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
            Latest Articles & Market News
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shownPosts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {filteredPosts.length > shownPosts.length && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all rounded-lg cursor-pointer"
              >
                <span>LOAD MORE ARTICLES ({filteredPosts.length - shownPosts.length})</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-90" aria-hidden="true" />
              </button>
            </div>
          )}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-[#0B0D12] border border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-400">No blog posts found matching your category selection.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
