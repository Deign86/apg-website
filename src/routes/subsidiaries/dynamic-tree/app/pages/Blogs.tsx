import { useEffect, useState } from "react";
import SakuraBurst from "../components/SakuraBurst";
import { Calendar, ArrowRight, Tag } from "lucide-react";

;

;

type Post = {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  isFeatured: boolean;
};

const FALLBACK_IMAGE = "/imports/model1.jpg";

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Blogs({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featured, setFeatured] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/blogs.php?enterprise=dynamic-tree")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.data)) {
          setPosts([]);
          setFeatured(null);
          return;
        }
        const all: Post[] = data.data.map((p: any) => ({
          title: p.title,
          excerpt: p.excerpt || "",
          image: p.cover_image_url || FALLBACK_IMAGE,
          category: p.category || "Industry Insights",
          date: formatDate(p.published_at),
          readTime: p.read_time || "5 min read",
          isFeatured: Number(p.is_featured) === 1,
        }));
        const hero = all.find((p) => p.isFeatured) ?? all[0] ?? null;
        setFeatured(hero);
        setPosts(all.filter((p) => p !== hero));
      })
      .catch(() => {
        setPosts([]);
        setFeatured(null);
      });
  }, []);

  const categories = ["All Posts", ...Array.from(new Set([
    ...(featured ? [featured.category] : []),
    ...posts.map((p) => p.category),
  ].filter(Boolean)))];

  const [activeCategory, setActiveCategory] = useState("All Posts");
  const visiblePosts = activeCategory === "All Posts"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      <SakuraBurst />
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
      {featured && (
      <section className="py-12 lg:py-16 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3 relative aspect-[16/10] lg:aspect-auto">
                <img
                  src={featured.image}
                  alt={featured.title}
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
                    {featured.category}
                  </span>
                </div>
                <h2
                  className="text-2xl lg:text-3xl font-semibold text-[#1C1814] mb-4 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {featured.title}
                </h2>
                <p
                  className="text-[#6B5D65] text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                >
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#8A7078] mb-6">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                    <Calendar size={13} />
                    {featured.date}
                  </span>
                  <span>•</span>
                  <span style={{ fontFamily: "Outfit, sans-serif" }}>{featured.readTime}</span>
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
      )}

      {/* Categories */}
      <section className="py-8 bg-[#FAF4F7] border-b border-[#E8C8D4]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#C84A72] text-white"
                      : "bg-white/60 text-[#1C1814]/70 hover:bg-white hover:text-[#C84A72]"
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 lg:py-24 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post, i) => (
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

          {visiblePosts.length === 0 && (
            <p
              className="text-center py-16 text-[#6B5D65]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              No articles in this category yet.
            </p>
          )}

          {/* Load More */}
          {visiblePosts.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              className="group flex items-center gap-2 text-sm font-medium text-[#1C1814] border border-[#1C1814]/20 px-9 py-3.5 rounded-full hover:bg-[#C84A72] hover:text-white hover:border-transparent transition-all duration-300"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Load More Articles
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          )}
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