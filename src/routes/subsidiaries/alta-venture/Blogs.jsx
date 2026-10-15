import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, ChevronRight, Send, Sparkles, CheckCircle2
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MINT_LIGHT, MUTED } from './shared';
import { Glass, Pill } from './shared';
import { BLOG_POSTS } from '@/data/companyData';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useBlogPostParam } from '@/hooks/useBlogPostParam';
import { useContent } from '@/hooks/useContent';
import { BlogBody } from '@/components/BlogBody';
import { loadBlogList, useBlogBody } from '../blogApi';

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const TAG_COLORS = {
  Finance: ACCENT, Operations: '#d97706', Technology: '#4338ca',
  People: TEAL2, CX: '#7c3aed',
};

// Admin categories are free text ("OPERATIONS" vs "Operations"), so tags are matched
// ignoring letter case and shown with the known spelling when there is one.
const tagKey = (tag) => String(tag || '').trim().toLowerCase();
const KNOWN_TAGS = Object.fromEntries(Object.keys(TAG_COLORS).map((t) => [tagKey(t), t]));
const displayTag = (tag) => KNOWN_TAGS[tagKey(tag)] ?? String(tag || '').trim();
const tagColor = (tag) => TAG_COLORS[displayTag(tag)];

// `slug` is the ?post= value that deep-links an article; `body` is the card excerpt, `content` the article.
const FALLBACK_POSTS = BLOG_POSTS.map((p) => ({
  id: String(p.id),
  slug: String(p.id),
  tag: p.category || 'Finance',
  date: p.date || '',
  read: p.readTime || '4 min read',
  featured: p.featured === true,
  title: p.title,
  body: p.summary || p.content || '',
  content: p.content || p.summary || '',
  image: '',
}));

export default function Blogs() {
  const { postSlug, closePost, postLink } = useBlogPostParam();
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    loadBlogList('alta-venture')
      .then((rows) => {
        // Fallback posts stay only when the request fails; an empty list is shown as empty.
        if (!live) return;
        setPosts(rows.map((p) => ({
          id: String(p.id),
          slug: p.slug || String(p.id),
          tag: p.category || 'Finance',
          date: p.published_at
            ? new Date(String(p.published_at).replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
          read: p.read_time || '4 min read',
          featured: Number(p.is_featured) === 1,
          title: p.title,
          body: p.excerpt || p.content || '',
          content: p.content || p.excerpt || '',
          image: p.cover_image_url || '',
        })));
      })
      .catch(() => {})
      .finally(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, []);

  if (postSlug) {
    // Wait for the real posts before deciding a deep-linked article doesn't exist.
    if (!loaded) return <div className="min-h-screen" style={{ background: '#f6fef9' }} role="status" aria-label="Loading article" />;
    const post = posts.find((p) => p.slug === postSlug);
    return (
      <BlogArticle
        post={post}
        related={posts.filter((p) => p !== post).slice(0, 3)}
        postLink={postLink}
        onBack={closePost}
      />
    );
  }
  return <BlogList posts={posts} postLink={postLink} />;
}

function BlogList({ posts, postLink }) {
  const [activeTag, setActiveTag] = useState('All');
  const newsletter = useNewsletter('alta-venture');
  const { content } = useContent('alta-venture');

  const tags = ['All', ...Array.from(new Set(posts.map((p) => displayTag(p.tag)).filter(Boolean)))];
  const filtered = activeTag === 'All' ? posts : posts.filter((p) => tagKey(p.tag) === tagKey(activeTag));
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.4) 0%, transparent 70%)',
              filter: 'blur(72px)',
            }}
          />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp}>
            <Pill>Insights & Intelligence</Pill>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            style={{ color: TEAL }}
          >
            The Alta Venture <span style={{ color: ACCENT }}>Insights Blog</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
            style={{ color: MUTED }}
          >
            {content.blogs_intro}
          </motion.p>
        </motion.div>
      </section>

      {/* ── FILTER & ARTICLES ── */}
      <section className="relative overflow-hidden py-16 px-6 md:px-14" style={{ background: 'linear-gradient(155deg, #f0fdf8 0%, #f6fef9 45%, #f5f0ff 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          {/* Mint orb top-left */}
          <div style={{ position: 'absolute', top: -120, left: -70, width: 520, height: 460, background: 'radial-gradient(ellipse at 38% 38%, rgba(77,232,184,0.26) 0%, rgba(20,146,123,0.10) 48%, transparent 70%)', filter: 'blur(68px)' }} />
          {/* Violet orb top-right */}
          <div style={{ position: 'absolute', top: -70, right: -50, width: 440, height: 380, background: 'radial-gradient(ellipse at 62% 40%, rgba(167,139,250,0.22) 0%, rgba(124,58,237,0.09) 50%, transparent 72%)', filter: 'blur(65px)' }} />
          {/* Amber bottom-centre */}
          <div style={{ position: 'absolute', bottom: -55, left: '25%', width: 400, height: 350, background: 'radial-gradient(ellipse at 50% 62%, rgba(251,191,36,0.17) 0%, rgba(245,158,11,0.07) 52%, transparent 72%)', filter: 'blur(72px)' }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03"><defs><pattern id="blog-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#14927b" /></pattern></defs><rect width="100%" height="100%" fill="url(#blog-dots)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Tag Filter Bar */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`min-h-10 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                  activeTag === tag
                    ? 'shadow-md scale-105'
                    : 'hover:bg-white/80'
                }`}
                style={{
                  background: activeTag === tag ? TEAL : 'rgba(255,255,255,0.75)',
                  color: activeTag === tag ? '#ffffff' : TEAL,
                  borderColor: activeTag === tag ? TEAL : 'rgba(8, 38, 54, 0.1)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {posts.length === 0 && (
              <p className="text-center text-sm font-medium" style={{ color: MUTED }}>New insights are on the way. Check back soon.</p>
            )}
            {/* Featured Article Card */}
            {featured && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Glass hoverEffect className="rounded-3xl p-8 md:p-12 border shadow-xl">
                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div
                      className="w-full lg:w-72 h-48 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${tagColor(featured.tag) ?? TEAL}20, ${tagColor(featured.tag) ?? TEAL}08)`,
                        border: `1.5px solid ${tagColor(featured.tag) ?? TEAL}30`,
                      }}
                    >
                      <BookOpen size={48} style={{ color: tagColor(featured.tag) ?? TEAL, opacity: 0.6 }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                          style={{ background: `${tagColor(featured.tag) ?? TEAL}15`, color: tagColor(featured.tag) ?? TEAL }}
                        >
                          {displayTag(featured.tag)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                          <Sparkles size={12} /> Featured Article
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: TEAL }}>
                        {featured.title}
                      </h2>
                      <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: MUTED }}>
                        {featured.body}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold" style={{ color: MUTED }}>
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> {featured.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} /> {featured.read}</span>
                        <a
                          {...postLink(featured.slug)}
                          aria-label={`Read full article: ${featured.title}`}
                          className="ml-auto min-h-10 flex items-center gap-1.5 text-xs font-extrabold hover:gap-2.5 transition-all"
                          style={{ color: tagColor(featured.tag) ?? ACCENT }}
                        >
                          Read Full Article <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </Glass>
              </motion.div>
            )}

            {/* Grid of Articles */}
            <motion.div
              key={activeTag}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className={
                rest.length === 1
                  ? 'max-w-2xl mx-auto grid grid-cols-1 gap-6'
                  : rest.length === 2
                  ? 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-3 gap-6'
              }
            >
              {rest.map((post) => {
                const c = tagColor(post.tag) ?? TEAL;
                return (
                  <motion.div key={post.id} variants={fadeInUp}>
                    <Glass hoverEffect className="rounded-3xl p-6 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg">
                      <div>
                        <div
                          className="w-full h-32 rounded-2xl flex items-center justify-center mb-5"
                          style={{ background: `linear-gradient(135deg, ${c}15, ${c}05)`, border: `1px solid ${c}20` }}
                        >
                          <BookOpen size={32} style={{ color: c, opacity: 0.5 }} />
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 inline-block"
                          style={{ background: `${c}15`, color: c }}
                        >
                          {displayTag(post.tag)}
                        </span>
                        <h3 className="text-lg font-bold mb-3 leading-snug" style={{ color: TEAL }}>{post.title}</h3>
                        <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: MUTED }}>{post.body}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t text-xs font-semibold" style={{ borderColor: 'rgba(8, 38, 54, 0.08)', color: MUTED }}>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.read}</span>
                        <a {...postLink(post.slug)} aria-label={`Read article: ${post.title}`} className="min-h-10 flex items-center gap-1 font-extrabold" style={{ color: c }}>
                          Read <ChevronRight size={13} />
                        </a>
                      </div>
                    </Glass>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER SUBSCRIPTION ── */}
      <section
        className="relative overflow-hidden py-24 px-6 md:px-14"
        style={{ background: 'linear-gradient(145deg, #041824 0%, #082636 45%, #0d4e66 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', top: -60, left: '15%', width: 480, height: 400,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.30) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: MINT_LIGHT }}
          >
            <Send size={26} />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
            Subscribe to Market Insights
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
            Get strategic outsourcing tips, Virtual CFO guides, and operational intelligence delivered bi-weekly.
          </p>

          {newsletter.status === 'done' ? (
            <div
              role="status"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold"
              style={{ background: 'rgba(77, 232, 184, 0.15)', color: MINT_LIGHT, border: '1px solid rgba(77, 232, 184, 0.35)' }}
            >
              <CheckCircle2 size={18} /> You are subscribed! Check your inbox for a confirmation.
            </div>
          ) : (
            <form onSubmit={newsletter.subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                {...newsletter.inputProps}
                aria-label="Your email address"
                value={newsletter.email}
                onChange={(e) => newsletter.setEmail(e.target.value)}
                placeholder="Enter business email..."
                className="flex-1 px-5 py-4 rounded-xl text-sm outline-none font-medium text-white"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <button
                type="submit"
                disabled={newsletter.status === 'sending'}
                className="av-btn-glow px-8 py-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl disabled:opacity-60"
                style={{ background: MINT_LIGHT, color: TEAL }}
              >
                {newsletter.status === 'sending' ? 'Subscribing…' : 'Subscribe'} <ArrowRight size={15} />
              </button>
            </form>
          )}
          {newsletter.status === 'error' && (
            <p id={newsletter.errorId} role="alert" className="mt-3 text-sm font-semibold" style={{ color: '#fecaca' }}>{newsletter.error}</p>
          )}
        </motion.div>
      </section>
    </>
  );
}

/** One article (?post=<slug>): Back / Esc / "All Insights" return to the list. */
function BlogArticle({ post, related, postLink, onBack }) {
  // The list has no bodies; the article text is fetched when the post is opened.
  const body = useBlogBody(post?.slug, post?.content ?? '');
  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="min-h-10 inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ color: ACCENT, outlineColor: ACCENT }}
    >
      <ArrowLeft size={15} /> All Insights
    </button>
  );

  if (!post) {
    return (
      <section className="min-h-[70vh] py-24 px-6 md:px-14 flex flex-col items-center justify-center gap-5 text-center" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: TEAL }}>
          Article not <span style={{ color: ACCENT }}>found</span>
        </h1>
        <p className="text-base max-w-md font-medium" style={{ color: MUTED }}>
          This article is no longer available. Browse the latest insights from the Alta Venture team instead.
        </p>
        {backButton}
      </section>
    );
  }

  const c = tagColor(post.tag) ?? TEAL;
  return (
    <article>
      <Helmet><title>{`${post.title} | Alta Venture`}</title></Helmet>
      <header className="relative overflow-hidden pt-16 pb-12 md:pt-20 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          <div style={{ position: 'absolute', top: -90, right: -50, width: 480, height: 420, background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.4) 0%, transparent 70%)', filter: 'blur(72px)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-8">{backButton}</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-xs font-semibold" style={{ color: MUTED }}>
            <span className="px-3 py-1 rounded-full font-extrabold uppercase tracking-wider" style={{ background: `${c}15`, color: c }}>
              {displayTag(post.tag)}
            </span>
            {post.date && <span className="flex items-center gap-1.5"><Calendar size={13} /> {post.date}</span>}
            <span className="flex items-center gap-1.5"><Clock size={13} /> {post.read}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: TEAL }}>
            {post.title}
          </h1>
        </div>
      </header>

      <div className="px-6 md:px-14 pb-16" style={{ background: '#f6fef9' }}>
        <div className="max-w-3xl mx-auto">
          {post.image ? (
            <div className="rounded-3xl overflow-hidden shadow-lg aspect-[16/9] mb-10" style={{ background: `${c}10` }}>
              <img src={post.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
          <div className="flex flex-col gap-5 pt-2">
            <BlogBody
              content={body ?? ''}
              paragraphClassName="text-base md:text-lg leading-relaxed text-[#3b626e]"
              headingClassName="text-2xl md:text-3xl font-extrabold leading-tight pt-4 text-[#082636]"
              strongClassName="font-bold text-[#082636]"
              listClassName="list-disc pl-6 space-y-2 text-base md:text-lg leading-relaxed text-[#3b626e]"
            />
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5" style={{ borderColor: 'rgba(8, 38, 54, 0.1)' }}>
            {backButton}
            <Link
              to="/subsidiaries/alta-venture/inquire"
              className="av-btn-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-extrabold transition-all hover:scale-105 shadow-md"
              style={{ background: TEAL, color: '#ffffff' }}
            >
              Book a Consultation <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="py-16 px-6 md:px-14" style={{ background: 'linear-gradient(155deg, #f0fdf8 0%, #f6fef9 45%, #f5f0ff 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-8" style={{ color: TEAL }}>
              More <span style={{ color: ACCENT }}>Insights</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => {
                const rc = tagColor(p.tag) ?? TEAL;
                return (
                  <Glass key={p.id} hoverEffect className="rounded-3xl p-6 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 inline-block" style={{ background: `${rc}15`, color: rc }}>
                        {displayTag(p.tag)}
                      </span>
                      <h3 className="text-lg font-bold mb-3 leading-snug" style={{ color: TEAL }}>{p.title}</h3>
                      <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: MUTED }}>{p.body}</p>
                    </div>
                    <a {...postLink(p.slug)} aria-label={`Read article: ${p.title}`} className="min-h-10 flex items-center gap-1 text-xs font-extrabold self-start" style={{ color: rc }}>
                      Read <ChevronRight size={13} />
                    </a>
                  </Glass>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
