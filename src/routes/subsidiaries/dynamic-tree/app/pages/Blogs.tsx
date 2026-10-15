import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SakuraBurst from "../components/SakuraBurst";
import { useNewsletter } from "@/hooks/useNewsletter";
import { useBlogPostParam } from "@/hooks/useBlogPostParam";
import { BlogBody } from "@/components/BlogBody";
import { Calendar, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { loadBlogList, useBlogBody } from "../../../blogApi";

// Public URLs shared with the home page photos (one download per visitor).
const model1 = "/imports/model1.jpg";
const model2 = "/imports/model2.jpg";
const model3 = "/imports/model3.jpg";
const model4 = "/imports/model4.jpg";
const model6 = "/imports/model6.jpg";
const model7 = "/imports/model7.jpg";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  isFeatured: boolean;
};

type PostLink = ReturnType<typeof useBlogPostParam>["postLink"];

const FALLBACK_IMAGE = "/imports/model1.webp";
const PAGE_SIZE = 6;

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Shown until the API answers with posts (or when it has none); body = excerpt. */
const FALLBACK_ALL: Post[] = [
  { title: "The Future of Fashion Multimedia: Trends Shaping 2026", excerpt: "From AI-enhanced casting to immersive digital runways, discover the innovations transforming how brands connect with audiences through visual storytelling.", image: model7, category: "Industry Insights", date: "June 28, 2026", readTime: "8 min read", isFeatured: true },
  { title: "Behind the Scenes: Ang Baybayin Live Production", excerpt: "An inside look at producing one of the year's most talked-about cultural showcases, blending heritage with modern multimedia excellence.", image: model7, category: "Case Study", date: "June 15, 2026", readTime: "6 min read", isFeatured: false },
  { title: "Casting the Perfect Brand Ambassador: A Guide", excerpt: "How to match talent with brand identity for campaigns that resonate authentically with your target audience.", image: model1, category: "Talent Management", date: "May 30, 2026", readTime: "5 min read", isFeatured: false },
  { title: "Video Production Trends: What's Working in 2026", excerpt: "Short-form content, vertical video, and authentic storytelling lead the charge in today's digital landscape.", image: model4, category: "Video Production", date: "May 12, 2026", readTime: "7 min read", isFeatured: false },
  { title: "Maximizing ROI on Fashion Photography Campaigns", excerpt: "Strategic approaches to planning, shooting, and leveraging editorial imagery for multi-channel brand campaigns.", image: model3, category: "Photography", date: "April 28, 2026", readTime: "6 min read", isFeatured: false },
  { title: "Social Campaign Strategies That Drive Engagement", excerpt: "Data-driven insights on building campaigns that don't just go viral — they convert and build lasting brand loyalty.", image: model2, category: "Social Media", date: "April 10, 2026", readTime: "5 min read", isFeatured: false },
  { title: "Lighting Techniques for High-Fashion Editorial Shoots", excerpt: "Mastering the interplay of natural and studio lighting to create images that captivate and inspire.", image: model6, category: "Photography", date: "March 22, 2026", readTime: "8 min read", isFeatured: false },
].map((p) => ({ ...p, slug: slugify(p.title), content: p.excerpt }));

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function toPost(p: any): Post {
  return {
    slug: p.slug || String(p.id),
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.content || p.excerpt || "",
    image: p.cover_image_url || FALLBACK_IMAGE,
    category: p.category || "Industry Insights",
    date: formatDate(p.published_at),
    readTime: p.read_time || "5 min read",
    isFeatured: Number(p.is_featured) === 1,
  };
}

export default function Blogs({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { postSlug, closePost, postLink } = useBlogPostParam();
  const [all, setAll] = useState<Post[]>(FALLBACK_ALL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    loadBlogList("dynamic-tree")
      .then((rows) => { if (live && rows.length > 0) setAll(rows.map(toPost)); })
      .catch(() => {})
      .finally(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, []);

  if (postSlug) {
    // Wait for the real posts before deciding a deep-linked post doesn't exist.
    if (!loaded) return <div className="min-h-screen bg-[#FAF4F7]" role="status" aria-label="Loading article" />;
    const post = all.find((p) => p.slug === postSlug);
    return (
      <BlogArticle
        post={post}
        related={all.filter((p) => p !== post).slice(0, 3)}
        postLink={postLink}
        onBack={closePost}
        onNavigate={onNavigate}
      />
    );
  }
  return <BlogList all={all} postLink={postLink} />;
}

function BlogList({ all, postLink }: { all: Post[]; postLink: PostLink }) {
  const newsletter = useNewsletter("dynamic-tree");
  const featured = all.find((p) => p.isFeatured) ?? all[0] ?? null;
  const posts = all.filter((p) => p !== featured);

  const categories = ["All Posts", ...Array.from(new Set([
    ...(featured ? [featured.category] : []),
    ...posts.map((p) => p.category),
  ].filter(Boolean)))];

  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [shown, setShown] = useState(PAGE_SIZE);
  const filteredPosts = activeCategory === "All Posts"
    ? posts
    : posts.filter((p) => p.category === activeCategory);
  const visiblePosts = filteredPosts.slice(0, shown);

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
                <a
                  {...postLink(featured.slug)}
                  className="group self-start min-h-10 flex items-center gap-2 text-[#C84A72] text-sm font-medium hover:gap-3 transition-all rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C84A72]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Read Full Article
                  <span className="sr-only">: {featured.title}</span>
                  <ArrowRight size={14} />
                </a>
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
                  onClick={() => { setActiveCategory(cat); setShown(PAGE_SIZE); }}
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
            {visiblePosts.map((post) => <PostCard key={post.slug} post={post} postLink={postLink} />)}
          </div>

          {filteredPosts.length === 0 && (
            <p
              className="text-center py-16 text-[#6B5D65]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              No articles in this category yet.
            </p>
          )}

          {/* Load More: only while more articles are hidden */}
          {filteredPosts.length > shown && (
          <div className="flex justify-center mt-12">
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
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
          {newsletter.status === "done" ? (
            <p role="status" className="text-sm font-semibold text-[#C84A72]" style={{ fontFamily: "Outfit, sans-serif" }}>
              ✓ You're subscribed! Check your inbox for a confirmation.
            </p>
          ) : (
            <form onSubmit={newsletter.subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                {...newsletter.inputProps}
                aria-label="Your email address"
                placeholder="Enter your email"
                value={newsletter.email}
                onChange={(e) => newsletter.setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full border border-[#E8C8D4] bg-white/90 text-sm focus:outline-none focus:border-[#C84A72] transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              />
              <button
                type="submit"
                disabled={newsletter.status === "sending"}
                className="bg-[#C84A72] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-colors shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {newsletter.status === "sending" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          {newsletter.status === "error" && (
            <p id={newsletter.errorId} role="alert" className="mt-3 text-sm font-semibold text-red-700">{newsletter.error}</p>
          )}
        </div>
      </section>
    </>
  );
}

/** Whole card is one link; the title is its accessible name. */
function PostCard({ post, postLink }: { post: Post; postLink: PostLink }) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[#C84A72] transition-all">
      <a {...postLink(post.slug)} className="block h-full focus:outline-none">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F0D8E4]">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            decoding="async"
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
          <span
            aria-hidden="true"
            className="min-h-10 flex items-center gap-2 text-[#C84A72] text-sm font-medium group-hover:gap-3 transition-all"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Read More
            <ArrowRight size={13} />
          </span>
        </div>
      </a>
    </article>
  );
}

function BlogArticle({ post, related, postLink, onBack, onNavigate }: {
  post: Post | undefined;
  related: Post[];
  postLink: PostLink;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}) {
  // The list has no bodies; the article text is fetched when the post is opened.
  const body = useBlogBody(post?.slug, post?.content ?? "");
  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="min-h-10 inline-flex items-center gap-2 text-sm font-medium text-[#C84A72] hover:gap-3 transition-all rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C84A72]"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <ArrowLeft size={14} />
      All Articles
    </button>
  );

  if (!post) {
    return (
      <section className="min-h-screen pt-40 pb-24 px-6 bg-[#FAF4F7] text-center flex flex-col items-center gap-5">
        <h1 className="text-4xl font-semibold text-[#1C1814]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Article not <span style={{ fontStyle: "italic" }}>found</span>
        </h1>
        <p className="text-[#6B5D65] max-w-md" style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}>
          This article is no longer available. Browse the latest stories from the Dynamic Tree team instead.
        </p>
        {backButton}
      </section>
    );
  }

  return (
    <article className="bg-[#FAF4F7]">
      <Helmet><title>{`${post.title} | Dynamic Tree`}</title></Helmet>
      <header
        className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF0F5 0%, #FAF6F8 100%)" }}
      >
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12">
          <div className="mb-8">{backButton}</div>
          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-[#8A7078]" style={{ fontFamily: "Outfit, sans-serif" }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E0EC] text-[#C84A72] font-medium rounded-full">
              <Tag size={12} />
              {post.category}
            </span>
            {post.date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {post.date}
              </span>
            )}
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
          </div>
          <h1
            className="text-4xl lg:text-5xl font-semibold text-[#1C1814] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {post.title}
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-lg bg-[#F0D8E4]">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12 lg:py-16 flex flex-col gap-5" style={{ fontFamily: "Outfit, sans-serif" }}>
        <BlogBody
          content={body ?? ""}
          paragraphClassName="text-base lg:text-lg text-[#3D3040] leading-relaxed"
          headingClassName="text-2xl lg:text-3xl font-semibold text-[#1C1814] leading-tight pt-4 font-['Playfair_Display',serif]"
          strongClassName="font-semibold text-[#1C1814]"
        />
        <div className="mt-6 pt-8 border-t border-[#E8C8D4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {backButton}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("inquire")}
              className="bg-[#C84A72] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-colors shadow-md hover:shadow-lg"
            >
              Work With Us
            </button>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="pb-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2
              className="text-3xl lg:text-4xl font-semibold text-[#1C1814] mb-10 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              More from the <span style={{ fontStyle: "italic" }}>Journal</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => <PostCard key={p.slug} post={p} postLink={postLink} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
