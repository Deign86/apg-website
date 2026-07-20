import { useState } from 'react';
import {
  ArrowRight, BookOpen, Calendar, Clock, ChevronRight, Send,
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const TAG_COLORS = {
  Finance: ACCENT, Operations: '#c07a3a', Technology: '#6b6bcc',
  People: TEAL2, CX: '#9b59b6',
};

const BLOG_POSTS = [
  { tag: 'Finance', date: 'Jun 28, 2025', read: '5 min read', featured: true,
    title: 'Why Every Growing Business Needs a Virtual CFO in 2025',
    body: 'The days of waiting until Series B to hire a CFO are over. We break down how fractional financial leadership is levelling the playing field for startups worldwide. Financial leadership is no longer a luxury — it\'s the backbone of every high-growth company.' },
  { tag: 'Operations', date: 'Jun 14, 2025', read: '4 min read',
    title: 'The Hidden Cost of In-House Hiring (And What to Do About It)',
    body: "When you factor in benefits, training, and overhead, the true cost of a full-time employee can be 1.5–2× their salary. Here's how outsourcing changes the equation." },
  { tag: 'Technology', date: 'May 30, 2025', read: '6 min read',
    title: 'Automating Your Back-Office: Where to Start in 2025',
    body: 'From invoice processing to data entry, automation is reshaping back-office functions. We share a practical roadmap for businesses at every stage.' },
  { tag: 'People', date: 'May 18, 2025', read: '3 min read',
    title: 'Building a Remote Team That Actually Feels Like a Team',
    body: "Culture doesn't stop at the office door. Our HR specialists share proven frameworks for onboarding, engagement, and retention across distributed teams." },
  { tag: 'CX', date: 'May 05, 2025', read: '5 min read',
    title: 'Customer Support in the Age of AI: Balancing Speed and Humanity',
    body: 'AI tools are transforming support — but customers still crave human connection. How to deploy both for a best-in-class CX without losing the personal touch.' },
  { tag: 'Finance', date: 'Apr 22, 2025', read: '4 min read',
    title: 'Cash Flow Forecasting: The Metric That Saves Startups',
    body: "Most startup failures trace back to cash flow surprises. Our Virtual CFO team shares the forecasting models that give founders 90-day visibility into their runway." },
];

export default function Blogs() {
  const [activeTag, setActiveTag] = useState('All');
  const tags = ['All', 'Finance', 'Operations', 'Technology', 'People', 'CX'];
  const filtered = activeTag === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.tag === activeTag);
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);

  return (
    <>
      <section className="relative overflow-hidden py-20 px-8 md:px-14" style={{ background: '#e2f8f0' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, #74e87a 0%, #c8f5b0 52%, transparent 76%)',
              filter: 'blur(72px)', opacity: 0.65,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -60, right: '20%', width: 380, height: 320,
              background: 'radial-gradient(ellipse at 50% 50%, #b8c8f8 0%, transparent 70%)',
              filter: 'blur(72px)', opacity: 0.45,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Pill>Insights & Ideas</Pill>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
            The Alta Venture Blog
          </h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: MUTED }}>
            Expert perspectives on outsourcing, finance, operations, and building businesses that scale.
          </p>
        </div>
      </section>

      <section className="px-8 md:px-14 pb-20" style={{ background: '#f6fef9' }}>
        <div className="max-w-5xl mx-auto pt-8 pb-8 flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTag === tag ? TEAL : 'rgba(255,255,255,0.75)',
                color: activeTag === tag ? '#fff' : TEAL,
                border: '1px solid rgba(255,255,255,1)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                boxShadow: activeTag === tag ? `0 4px 14px ${TEAL}28` : '0 2px 8px rgba(13,61,82,0.05)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {featured && (
            <Glass className="rounded-3xl p-7 md:p-8 flex flex-col md:flex-row gap-7 cursor-pointer hover:-translate-y-1 transition-all duration-300">
              <div
                className="w-full md:w-56 h-40 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${TAG_COLORS[featured.tag] ?? TEAL}18, ${TAG_COLORS[featured.tag] ?? TEAL}06)`,
                  border: `1px solid ${TAG_COLORS[featured.tag] ?? TEAL}18`,
                }}
              >
                <BookOpen size={36} style={{ color: TAG_COLORS[featured.tag] ?? TEAL, opacity: 0.45 }} />
              </div>
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${TAG_COLORS[featured.tag] ?? TEAL}14`, color: TAG_COLORS[featured.tag] ?? TEAL }}
                  >
                    {featured.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${ACCENT}14`, color: ACCENT }}>
                    ✦ Featured
                  </span>
                </div>
                <h2 className="text-xl font-extrabold leading-snug" style={{ color: TEAL }}>{featured.title}</h2>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{featured.body}</p>
                <div className="flex items-center gap-4 mt-auto pt-2">
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                    <Calendar size={10} /> {featured.date}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                    <Clock size={10} /> {featured.read}
                  </span>
                  <button className="ml-auto flex items-center gap-1 text-[11px] font-bold" style={{ color: TAG_COLORS[featured.tag] ?? ACCENT }}>
                    Read more <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            </Glass>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rest.map((post) => {
              const c = TAG_COLORS[post.tag] ?? TEAL;
              return (
                <div
                  key={post.title}
                  className="rounded-3xl p-5 flex flex-col gap-3 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,1)',
                    boxShadow: '0 4px 20px rgba(13,61,82,0.05)',
                  }}
                >
                  <div
                    className="w-full h-24 rounded-xl flex items-center justify-center mb-1"
                    style={{ background: `linear-gradient(135deg, ${c}16, ${c}05)`, border: `1px solid ${c}14` }}
                  >
                    <BookOpen size={24} style={{ color: c, opacity: 0.40 }} />
                  </div>
                  <span
                    className="px-2.5 py-0.5 self-start rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${c}12`, color: c }}
                  >
                    {post.tag}
                  </span>
                  <h3 className="text-sm font-bold leading-snug" style={{ color: TEAL }}>{post.title}</h3>
                  <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: MUTED }}>{post.body}</p>
                  <div className="flex items-center gap-3 mt-auto pt-2 border-t" style={{ borderColor: `${TEAL}07` }}>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: MUTED }}>
                      <Calendar size={9} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: MUTED }}>
                      <Clock size={9} /> {post.read}
                    </span>
                    <button className="ml-auto text-[10px] font-bold flex items-center gap-1" style={{ color: c }}>
                      Read <ChevronRight size={9} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden py-20 px-8 md:px-14"
        style={{ background: 'linear-gradient(145deg, #082636 0%, #0d3d52 45%, #0c4236 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -60, left: '15%', width: 480, height: 400,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(25,164,138,0.28) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center gap-5">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center p-3.5"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <Send size={22} style={{ color: 'rgba(255,255,255,0.85)' }} />
          </div>
          <h2 className="text-3xl font-extrabold" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Stay in the loop
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Get our latest insights delivered straight to your inbox. No spam — just practical advice for growing
            businesses.
          </p>
          <div className="flex w-full max-w-sm gap-2">
            <input
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              }}
            />
            <button
              className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
              style={{ background: '#4de8b8', color: TEAL }}
            >
              Subscribe <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
