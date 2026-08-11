import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/companyData';
import { Calendar, Clock, ArrowRight, Search, User, BookOpen, Sparkles } from 'lucide-react';

interface BlogsViewProps {
  onSelectPost: (post: BlogPost) => void;
}

export const BlogsView: React.FC<BlogsViewProps> = ({ onSelectPost }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['ALL', 'REAL ESTATE', 'CONSTRUCTION', 'BUSINESS HUB', 'LEADERSHIP', 'LOGISTICS', 'MARKET UPDATE'];

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.filter((p) => p.id !== featuredPost.id);

  const filteredPosts = regularPosts.filter((post) => {
    const matchesCat = selectedCategory === 'ALL' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-transparent text-neutral-100 font-sans min-h-screen pb-20">
      
      {/* Header Banner */}
      <section className="bg-[#140F06]/80 border-b border-[#D4AF37]/30 py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden backdrop-blur-md">
        <div className="relative max-w-4xl mx-auto space-y-4 z-10 flex flex-col items-center">
          {/* Ambient Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

          {/* Rotated Diamond Crest Icon */}
          <div className="w-10 h-10 rotate-45 bg-[#1C1508] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center z-10">
            <BookOpen className="w-5 h-5 -rotate-45 text-[#D4AF37]" />
          </div>

          {/* Badge flanked by side golden filigree wing bars */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
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

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light z-10">
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
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-lg ${
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
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-[#0B0D12] border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none rounded-lg"
            />
          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Featured Article Card */}
        {selectedCategory === 'ALL' && !searchTerm && (
          <div
            onClick={() => onSelectPost(featuredPost)}
            className="bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 sm:p-8 cursor-pointer transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group rounded-2xl backdrop-blur-md shadow-xl"
          >
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center space-x-3">
                <span className="bg-[#D4AF37] text-neutral-950 px-2.5 py-0.5 font-bold text-[10px] tracking-wider uppercase rounded-md">
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

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
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
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="bg-[#120E05]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 group rounded-xl backdrop-blur-md shadow-xl"
              >
                <div className="space-y-3">
                  
                  <div className="relative h-44 w-full border border-neutral-800 overflow-hidden rounded-lg">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-[#D4AF37] text-neutral-950 font-bold text-[9px] px-2 py-0.5 uppercase rounded">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
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

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
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
