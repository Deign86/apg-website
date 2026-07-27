import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { BlogDetailModal } from '../components/BlogDetailModal';
import AOS from 'aos';

const fallback = [
  { id: '1', category: 'REAL ESTATE', date: 'OCTOBER 24, 2023', title: 'The Future of Commercial Real Estate in 2024', summary: 'Discover the emerging trends that are shaping the commercial property market, from sustainable office designs to smart warehouses.', content: 'Negotiating in a seller\'s market requires surgical planning. Relying purely on lowball offers will isolate you from prospective listing brokers.\n\n### The Rise of Eco-Friendly Offices\nInstead, leverage terms. Offer standard, expedited closing dates, secure a pre-qualification letter from primary banks, and minimize contingency requests. Show the seller that you represent a guaranteed, friction-free closing. This emotional security is often worth a 3-5% price discount, even in high-demand luxury markets.', image: '/assets/images/blogs-featured-img.png', author: { name: 'Mark Anthony Santos', role: 'CEO, Alpha Premier' }, readTime: '6 min read', featured: true },
  { id: '2', category: 'LOGISTICS', date: 'OCTOBER 15, 2023', title: 'Why Logistics Warehouses are the Best Investment', summary: 'With the boom of e-commerce, industrial spaces are becoming the most sought-after assets for serious real estate investors.', content: 'Industrial warehouse logistics hubs represent the most stable cash-flow generation vehicles in commercial real estate today. The rapid proliferation of e-commerce delivery networks across regional municipalities has triggered a massive demand-supply gap.', image: '/assets/images/blogs-recent-img.png', author: { name: 'Maria Dela Cruz', role: 'Investment Advisory' }, readTime: '5 min read' },
  { id: '3', category: 'BUSINESS HUB', date: 'SEPTEMBER 30, 2023', title: 'Maximizing Productivity in Your Virtual Office', summary: 'Learn how to leverage virtual office services to boost your business image and output without the traditional overhead costs.', content: 'Operating from a virtual business address yields significant bottom-line advantages. Startups can establish corporate footprints in Grade A buildings without signing long-term lease covenants or paying commercial utilities.', image: '/assets/images/blogs-recent-img.png', author: { name: 'John Doe', role: 'Corporate Solutions' }, readTime: '4 min read' },
];

export default function Blogs() {
  const { onOpenInquire } = useOutletContext();
  const [posts, setPosts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const categories = ['ALL', 'REAL ESTATE', 'CONSTRUCTION', 'BUSINESS HUB', 'LEADERSHIP', 'LOGISTICS', 'MARKET UPDATE'];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setPosts(data.map(p => ({
            id: String(p.id),
            category: (p.category || 'MARKET UPDATE').toUpperCase(),
            date: new Date(p.published_at || p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(),
            title: p.title,
            summary: p.excerpt || p.summary || '',
            content: p.content || p.excerpt || '',
            image: p.cover_image || p.image || '/assets/images/blogs-recent-img.png',
            author: p.author ? { name: p.author, role: 'Executive Advisory' } : { name: 'Alpha Premier Desk', role: 'Corporate Relations' },
            readTime: p.read_time || '5 min read',
            featured: p.featured || false,
          })));
        }
      })
      .catch(() => { /* Query failed — fallback renders */ });
  }, []);

  const display = posts || fallback;

  const featuredPost = display.find((p) => p.featured) || display[0];
  const regularPosts = display.filter((p) => p.id !== featuredPost.id);

  const filteredPosts = regularPosts.filter((post) => {
    const matchesCat = selectedCategory === 'ALL' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setBlogModalOpen(true);
  };

  return (
    <>
      <Helmet><title>Blogs | Alpha Premier</title></Helmet>
      
      <div className="bg-black text-neutral-100 font-sans min-h-screen pb-20 pt-24">
        
        {/* Header Banner */}
        <section className="bg-[#08080A] border-b border-[#1C1C22] py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-display">
              INSIGHTS & NEWSROOM
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-display">
              Alpha Premier Blog
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Industry insights, property market updates, construction trends, and corporate news from Alpha Premier Group of Companies.
            </p>
          </div>
        </section>

        {/* Category Pills & Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4" data-aos="fade-up">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#E2B857] text-neutral-950 font-extrabold'
                      : 'bg-[#121622] text-neutral-400 border border-[#232938] hover:text-white hover:border-[#E2B857]'
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
                className="w-full bg-[#121622] border border-[#232938] focus:border-[#E2B857] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>

          </div>

        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" data-aos="fade-up">
          
          {/* Featured Article Card */}
          {selectedCategory === 'ALL' && !searchTerm && featuredPost && (
            <div
              onClick={() => handleSelectPost(featuredPost)}
              className="bg-[#10141E] border border-[#232938] hover:border-[#E2B857] p-6 sm:p-8 cursor-pointer transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group"
            >
              <div className="lg:col-span-7 space-y-4">
                
                <div className="flex items-center space-x-3">
                  <span className="bg-[#E2B857] text-neutral-950 px-2.5 py-0.5 font-bold text-[10px] tracking-wider uppercase font-display">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E2B857]" />
                    {featuredPost.date}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#E2B857] transition-colors leading-tight font-display">
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {featuredPost.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-[#1F2533] pt-4">
                  <span className="font-semibold text-neutral-300">{featuredPost.author.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E2B857]" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <div className="pt-2">
                  <button className="px-6 py-2.5 bg-[#E2B857] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 group-hover:bg-[#cfa543] cursor-pointer font-display">
                    <span>READ FULL ARTICLE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              <div className="lg:col-span-5 h-64 sm:h-80 border border-[#2B3142] overflow-hidden">
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
            <h3 className="text-sm font-bold text-[#E2B857] uppercase tracking-wider font-display">
              Latest Articles & Market News
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className="bg-[#10141E] border border-[#232938] hover:border-[#E2B857] p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    
                    {post.image && (
                      <div className="relative h-44 w-full border border-[#2B3142] overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-[#E2B857] tracking-widest uppercase block font-display">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {post.date}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#E2B857] transition-colors leading-snug font-display">
                      {post.title}
                    </h4>

                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>

                  </div>

                  <div className="pt-3 border-t border-[#1F2533] flex items-center justify-between text-[11px] text-neutral-500 font-sans">
                    <span>{post.author.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E2B857]" />
                      {post.readTime}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12 bg-[#10141E] border border-[#232938]">
                <p className="text-xs text-neutral-400">No articles found matching the criteria.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      <BlogDetailModal
        post={selectedPost}
        isOpen={blogModalOpen}
        onClose={() => setBlogModalOpen(false)}
        onOpenInquire={() => onOpenInquire()}
      />
    </>
  );
}
