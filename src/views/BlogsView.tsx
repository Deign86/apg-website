import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/companyData';
import { fetchList, peekList } from '../lib/listCache';
import { Calendar, Clock, ArrowRight, Search, User, BookOpen, Sparkles } from 'lucide-react';

interface BlogsViewProps {
  onSelectPost: (post: BlogPost) => void;
}

// List fields only: the reader (BlogDetailModal) loads an article's body when it opens.
const BLOGS_URL = '/api/blogs.php?summary=1';
// Cards rendered up front; older posts follow on "Load more" (the archive runs to hundreds of posts).
const PAGE_SIZE = 12;
// One formatter for every post (toLocaleDateString with options builds a new one per call).
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(date) : DATE_FORMAT.format(date);
};

const toBlogPost = (p: any): BlogPost => ({
  id: String(p.id),
  title: p.title,
  slug: p.slug || String(p.id),
  summary: p.excerpt || p.summary || '',
  content: p.content || '',
  image: p.cover_image_url || p.cover_image || '/assets/images/blogs-recent-img.webp',
  category: p.category ? p.category.toUpperCase() : 'CORPORATE',
  date: p.published_at ? formatDate(p.published_at) : 'Recent',
  readTime: p.read_time || '5 min read',
  author: {
    name: 'APG Editorial Board',
    role: 'Executive Contributor',
  },
  featured: Number(p.is_featured) === 1,
});

export const BlogsView: React.FC<BlogsViewProps> = ({ onSelectPost }) => {
  // Live posts, kept for the session (src/lib/listCache); BLOG_POSTS renders while the first request
  // loads and only replaces them if it fails.
  const [postsList, setPostsList] = useState<BlogPost[]>(() => peekList(BLOGS_URL)?.map(toBlogPost) ?? BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchList(BLOGS_URL)
      .then((rows) => {
        const mapped = rows.map(toBlogPost);
        setPostsList(mapped);
        return mapped;
      })
      .catch(() => {
        setPostsList(BLOG_POSTS);
        return BLOG_POSTS;
      })
      .then((posts) => {
        // Shared article links (/blogs?post=<slug>, from the reader's Share button) open that article.
        const wanted = new URLSearchParams(window.location.search).get('post');
        const match = wanted ? posts.find((p) => (p.slug || String(p.id)) === wanted) : undefined;
        if (match) onSelectPost(match);
      });
    // Runs once on mount: a shared link should open its article only on arrival.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        
        {/* Featured Article Card */}
        {featuredPost && selectedCategory === 'ALL' && !searchTerm && (
          <div
            onClick={() => onSelectPost(featuredPost)}
            className="bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 sm:p-8 cursor-pointer transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group rounded-2xl shadow-xl"
          >
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
                {featuredPost.title}
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

              <div className="pt-2">
                <button className="px-6 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 group-hover:bg-[#FFF3D1] transition-all rounded-lg">
                  <span>READ FULL ARTICLE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
            {shownPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 group rounded-xl shadow-xl"
              >
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
                    {post.title}
                  </h3>

                  <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>

                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-[#D4AF37] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>READ ARTICLE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

              </div>
            ))}
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
