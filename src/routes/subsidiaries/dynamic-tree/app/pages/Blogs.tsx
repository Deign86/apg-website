import { Calendar, ArrowRight, Tag } from "lucide-react";
import model1 from "@/imports/model1.jpg";
import model2 from "@/imports/model2.jpg";
import model3 from "@/imports/model3.jpg";
import model4 from "@/imports/model4.jpg";
import model5 from "@/imports/model5.jpg";
import model6 from "@/imports/model6.jpg";
import model7 from "@/imports/model7.jpg";

const FEATURED_POST = {
  title: "The Future of Fashion Multimedia: Trends Shaping 2026",
  excerpt: "From AI-enhanced casting to immersive digital runways, discover the innovations transforming how brands connect with audiences through visual storytelling.",
  image: model7,
  category: "Industry Insights",
  date: "June 28, 2026",
  readTime: "8 min read",
};

const BLOG_POSTS = [
  {
    title: "Behind the Scenes: Ang Baybayin Live Production",
    excerpt: "An inside look at producing one of the year's most talked-about cultural showcases, blending heritage with modern multimedia excellence.",
    image: model7,
    category: "Case Study",
    date: "June 15, 2026",
    readTime: "6 min read",
  },
  {
    title: "Casting the Perfect Brand Ambassador: A Guide",
    excerpt: "How to match talent with brand identity for campaigns that resonate authentically with your target audience.",
    image: model1,
    category: "Talent Management",
    date: "May 30, 2026",
    readTime: "5 min read",
  },
  {
    title: "Video Production Trends: What's Working in 2026",
    excerpt: "Short-form content, vertical video, and authentic storytelling lead the charge in today's digital landscape.",
    image: model4,
    category: "Video Production",
    date: "May 12, 2026",
    readTime: "7 min read",
  },
  {
    title: "Maximizing ROI on Fashion Photography Campaigns",
    excerpt: "Strategic approaches to planning, shooting, and leveraging editorial imagery for multi-channel brand campaigns.",
    image: model3,
    category: "Photography",
    date: "April 28, 2026",
    readTime: "6 min read",
  },
  {
    title: "Social Campaign Strategies That Drive Engagement",
    excerpt: "Data-driven insights on building campaigns that don't just go viral—they convert and build lasting brand loyalty.",
    image: model2,
    category: "Social Media",
    date: "April 10, 2026",
    readTime: "5 min read",
  },
  {
    title: "Lighting Techniques for High-Fashion Editorial Shoots",
    excerpt: "Mastering the interplay of natural and studio lighting to create images that captivate and inspire.",
    image: model6,
    category: "Photography",
    date: "March 22, 2026",
    readTime: "8 min read",
  },
];

const CATEGORIES = [
  "All Posts",
  "Industry Insights",
  "Case Study",
  "Talent Management",
  "Video Production",
  "Photography",
  "Social Media",
];

export default function Blogs() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF0F5 0%, #FAF6F8 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 right-1/4 w-[500px] h-[500px] opacity-25"
            style={{
              background: "radial-gradient(circle, #F5ABBE 0%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span
            className="text-xs tracking-[0.28em] uppercase text-[#C84A72] font-semibold mb-5 inline-block"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Insights & Stories
          </span>
          <h1
            className="text-5xl lg:text-6xl font-semibold text-[#1C1814] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Creative{" "}
            <span style={{ fontStyle: "italic" }}>Journal</span>
          </h1>
          <p
            className="text-base lg:text-lg text-[#6B5D65] max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            Industry insights, behind-the-scenes stories, and expert perspectives
            from the Dynamic Tree team.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 lg:py-16 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3 relative aspect-[16/10] lg:aspect-auto">
                <img
                  src={FEATURED_POST.image}
                  alt={FEATURED_POST.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6">
                  <span
                    className="inline-block px-4 py-1.5 bg-[#C84A72] text-white text-xs font-medium rounded-full"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Featured
                  </span>
                </div>
              </div>
              <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E0EC] text-[#C84A72] text-xs font-medium rounded-full"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    <Tag size={12} />
                    {FEATURED_POST.category}
                  </span>
                </div>
                <h2
                  className="text-2xl lg:text-3xl font-semibold text-[#1C1814] mb-4 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {FEATURED_POST.title}
                </h2>
                <p
                  className="text-[#6B5D65] text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                >
                  {FEATURED_POST.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#8A7078] mb-6">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                    <Calendar size={13} />
                    {FEATURED_POST.date}
                  </span>
                  <span>•</span>
                  <span style={{ fontFamily: "Outfit, sans-serif" }}>{FEATURED_POST.readTime}</span>
                </div>
                <button
                  className="group flex items-center gap-2 text-[#C84A72] text-sm font-medium hover:gap-3 transition-all"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Read Full Article
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-[#FAF4F7] border-b border-[#E8C8D4]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  cat === "All Posts"
                    ? "bg-[#C84A72] text-white"
                    : "bg-white/60 text-[#1C1814]/70 hover:bg-white hover:text-[#C84A72]"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 lg:py-24 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, i) => (
              <article
                key={i}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F0D8E4]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E0EC] text-[#C84A72] text-xs font-medium rounded-full"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      <Tag size={11} />
                      {post.category}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-semibold text-[#1C1814] mb-3 leading-tight group-hover:text-[#C84A72] transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-sm text-[#6B5D65] leading-relaxed mb-4"
                    style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                  >
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8A7078] mb-4">
                    <span className="flex items-center gap-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                      <Calendar size={12} />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span style={{ fontFamily: "Outfit, sans-serif" }}>{post.readTime}</span>
                  </div>
                  <button
                    className="group/btn flex items-center gap-2 text-[#C84A72] text-sm font-medium hover:gap-3 transition-all"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Read More
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-12">
            <button
              className="group flex items-center gap-2 text-sm font-medium text-[#1C1814] border border-[#1C1814]/20 px-9 py-3.5 rounded-full hover:bg-[#C84A72] hover:text-white hover:border-transparent transition-all duration-300"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Load More Articles
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F5E0EC 0%, #EDE0F5 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mb-5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Never Miss{" "}
            <span style={{ fontStyle: "italic" }}>an Update</span>
          </h2>
          <p
            className="text-base text-[#6B5D65] mb-8 leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            Subscribe to our newsletter for industry insights, creative tips, and
            exclusive behind-the-scenes content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-full border border-[#E8C8D4] bg-white/90 text-sm focus:outline-none focus:border-[#C84A72] transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
            />
            <button
              className="bg-[#C84A72] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-colors shadow-md hover:shadow-lg"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}