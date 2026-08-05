import React, { useState, useMemo } from 'react';
import { BLOG_POSTS } from '../data';
import { BlogPost } from '../types';
import { Search, Calendar, Tag, ArrowRight, X, BookOpen } from 'lucide-react';

export default function BlogsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Articles shown limit
  const [displayCount, setDisplayCount] = useState(6);

  // Categories list
  const categories = ['All', 'Market Trends', 'Property Tips', 'Investment Guides', 'Company News'];

  // Filter blog posts dynamically
  const filteredPosts = useMemo(() => {
    // Exclude featured post from general grid list to prevent duplication if requested, 
    // but keep it in the search list. Let's make it intuitive: if category is 'All', 
    // the grid shows all posts (including featured or excluding featured). 
    // Looking at the screenshots, the featured post is "The Future of Commercial Real Estate in the Philippines" (Market Trends).
    // The grid below has:
    // 1. "How to Evaluate Pre-Selling Condo Investments" (Investment Guides)
    // 2. "5 Red Flags to Watch for" (Property Tips)
    // 3. "Alpha Premier Opens Its 18th Office" (Company News)
    // 4. "Warehouse and Logistics Properties" (Market Trends)
    // 5. "REITs vs. Direct Property" (Investment Guides)
    // 6. "Negotiating Price" (Property Tips)
    // So the grid has 6 articles, which are distinct from the featured post!
    // Let's filter out the featured post ('blog-featured') from the grid view, keeping it exclusively as the big banner! 
    // This fits the visual screenshot exactly.
    
    return BLOG_POSTS.filter((post) => {
      // Exclude the featured article from the grid
      if (post.id === 'blog-featured') return false;

      // 1. Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesSummary = post.summary.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesContent) return false;
      }

      // 2. Category selection
      if (activeCategory !== 'All') {
        if (post.category.toLowerCase() !== activeCategory.toLowerCase()) return false;
      }

      return true;
    });
  }, [searchQuery, activeCategory]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, displayCount);
  }, [filteredPosts, displayCount]);

  const featuredPost = BLOG_POSTS.find(p => p.id === 'blog-featured') || BLOG_POSTS[0];

  return (
    <div className="bg-transparent min-h-screen py-10 sm:py-16 px-4 sm:px-6 md:px-12" id="blogs-section">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Title & Search Row exactly like Screenshot 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-900 pb-6">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl md:text-5xl font-sans font-light tracking-wide text-white uppercase">
              Real Estate Insights & News
            </h1>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-24 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
            </div>
          </div>

          {/* Search bar on the right */}
          <div className="relative w-full lg:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center pl-1 text-white/40">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0c10] text-white/95 border border-gray-800 focus:border-[#c5a85c] rounded-full py-2.5 pl-10 pr-4 text-xs font-sans focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* FEATURED ARTICLE HERO CARD */}
        {featuredPost && (
          <div 
            onClick={() => setSelectedPost(featuredPost)}
            className="bg-[#0b0c10] border border-gray-900/60 hover:border-[#c5a85c]/40 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(197,168,92,0.2)] transition-all duration-500 rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch cursor-pointer group"
          >
            {/* Featured Image */}
            <div className="lg:col-span-6 relative overflow-hidden min-h-[300px]">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-105"
              />
            </div>

            {/* Featured Text content */}
            <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center items-start gap-4">
              <span className="bg-[#c5a85c]/10 text-[#c5a85c] text-[9px] font-sans font-bold tracking-[0.25em] px-3.5 py-1.5 uppercase rounded-sm border border-[#c5a85c]/20">
                {featuredPost.category.toUpperCase()}
              </span>
              
              <p className="text-white/40 text-xs font-mono">{featuredPost.date}</p>

              <h2 className="text-white font-sans text-2xl md:text-3xl font-semibold tracking-wide leading-snug group-hover:text-[#c5a85c] transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-white/60 text-sm leading-relaxed font-light font-sans">
                {featuredPost.summary}
              </p>

              <button className="flex items-center gap-2 text-white/80 group-hover:text-[#c5a85c] text-xs font-bold tracking-widest uppercase transition-colors mt-2">
                READ FULL ARTICLE
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* CATEGORY FILTERS ROW exactly like Screenshot 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-950 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setDisplayCount(6); }}
                  className={`text-[10px] md:text-xs font-sans tracking-widest font-bold px-4 py-2.5 rounded-full uppercase transition-all duration-300 ${
                    isActive
                      ? 'bg-[#c5a85c] text-[#06070a]'
                      : 'bg-transparent text-white/50 hover:text-white hover:bg-[#0b0c10]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Showing Counts */}
          <p className="text-white/40 text-xs font-sans font-medium">
            Showing {filteredPosts.length} articles
          </p>
        </div>

        {/* GRID OF BLOG POSTS */}
        {displayedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-[#0b0c10] border border-gray-900/60 hover:border-gray-800/80 transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full cursor-pointer group"
              >
                {/* Blog Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-105"
                  />
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                  
                  <div className="flex flex-col gap-2.5">
                    {/* Date and Category line matches screenshot */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#c5a85c]/60" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1 uppercase tracking-wider text-[#c5a85c]/80">
                        <Tag className="w-3 h-3 text-[#c5a85c]/40" />
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-white font-sans text-lg font-semibold tracking-wide leading-snug group-hover:text-[#c5a85c] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-white/50 text-xs leading-relaxed font-sans font-light line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <button className="flex items-center gap-1.5 text-white/80 group-hover:text-[#c5a85c] text-[10px] font-bold tracking-widest uppercase transition-colors mt-2 self-start">
                    READ MORE
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </button>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-800 p-16 text-center text-white/40 font-sans flex flex-col items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-[#c5a85c]/40" />
            <p className="text-sm font-semibold uppercase tracking-widest text-[#c5a85c]">No Articles Found</p>
            <p className="text-xs">Adjust your search terms or try resetting filters.</p>
          </div>
        )}

        {/* LOAD MORE ARTICLES BUTTON */}
        {filteredPosts.length > displayCount && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setDisplayCount(prev => prev + 3)}
              id="blogs-load-more"
              className="border border-[#c5a85c]/50 hover:border-[#c5a85c] text-white hover:text-[#c5a85c] font-sans font-semibold text-xs tracking-[0.25em] uppercase py-4 px-10 text-center transition-all duration-300 rounded-sm bg-transparent"
            >
              LOAD MORE ARTICLES &or;
            </button>
          </div>
        )}

      </div>

      {/* FULL ARTICLE MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8 flex flex-col gap-6">
            
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header info */}
            <div className="flex flex-col gap-3 mt-4">
              <span className="bg-[#c5a85c]/15 text-[#c5a85c] text-[9px] font-sans font-bold tracking-widest px-3 py-1 uppercase rounded-sm border border-[#c5a85c]/30 self-start">
                {selectedPost.category.toUpperCase()}
              </span>
              
              <h2 className="text-white font-sans text-2xl md:text-3xl font-semibold tracking-wide leading-snug">
                {selectedPost.title}
              </h2>
              
              <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                <span>Published on</span>
                <span>{selectedPost.date}</span>
                <span>&bull;</span>
                <span>By Alpha Premier Advisory</span>
              </div>
            </div>

            {/* Article Image */}
            <div className="w-full h-72 rounded-sm overflow-hidden">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover filter brightness-95 contrast-105"
              />
            </div>

            {/* Article Content */}
            <div className="text-white/80 text-sm leading-relaxed font-sans font-light space-y-4 whitespace-pre-line">
              {selectedPost.content}
            </div>

            {/* Footer modal line */}
            <div className="border-t border-gray-900 pt-6 flex items-center justify-between text-xs text-white/40">
              <span>ALPHA PREMIER INSIGHTS GROUP</span>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-[#c5a85c] hover:underline"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
