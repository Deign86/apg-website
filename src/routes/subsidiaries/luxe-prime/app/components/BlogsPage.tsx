import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { BlogBody } from '@/components/BlogBody';
import { useModalDialog } from '@/hooks/useModalDialog';
import { loadBlogList, useBlogBody, type BlogRow } from '../../../blogApi';
import ClosingPanel from './ClosingPanel';
import { motion } from 'motion/react';
import { Reveal, rise, SectionHeading, settle } from './headings';
import { sized } from './services';
import {
  BODY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CAPS,
  CONTAINER,
  DIAMOND,
  DISPLAY,
  DOUBLE_FRAME,
  FOCUS,
  GOLD_ACCENT,
  IVORY,
  LINK_RULE,
  OPENING,
  PHOTO_ZOOM,
  PRINT_FRAME,
  SCREEN,
} from './ui';

interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  image: string;
  /** The body when the list carries it (sample posts); otherwise it is fetched when the article opens. */
  content: string;
}

// Shown only when the blog cannot be loaded or has no posts yet (the same three posts the database was seeded with).
const SAMPLE_ARTICLES: Article[] = [
  { slug: 'curating-luxury', title: "Curating Luxury: Inside Luxe Prime's Private Portfolio", summary: 'A rare look at the exclusive off-market listings that define our approach to high-prestige property curation — where discretion meets distinction.', content: 'At Luxe Prime Realty, every property in our private portfolio represents more than square footage — it embodies a philosophy. We seek assets that offer architectural distinction, exceptional location, and investment resilience. Our curators work directly with developers and legacy owners to surface properties before they ever reach the open market, giving our clients a decisive advantage in a landscape where timing is everything.', image: 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&w=1200&q=85', date: 'Jun 28, 2026', category: 'Portfolio', readTime: '5 min read' },
  { slug: 'market-intelligence', title: 'Market Intelligence: Strategies for Distressed and Legacy Assets', summary: 'How data-driven insight and strategic partnerships unlock value in overlooked markets, turning legacy assets into high-yield opportunities.', content: 'Distressed and legacy assets often carry the highest upside for informed investors — yet they demand a level of insight and patience that most overlook. Our analysts at Luxe Prime combine macroeconomic indicators, localized vacancy data, and developer pipeline intelligence to identify these windows before they close. The result: high-conviction moves in markets others have yet to discover.', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&w=1200&q=85', date: 'Jun 14, 2026', category: 'Strategy', readTime: '6 min read' },
  { slug: 'prestige-practicality', title: 'Prestige & Practicality: Redefining High-End Lease Management', summary: "Explore how Luxe Prime's co-managed subleasing model bridges the gap between luxury property ownership and modern rental flexibility.", content: "The modern property owner faces a paradox: the desire for premium passive income and the demand for hands-off management. Luxe Prime's co-managed subleasing model resolves this tension entirely. By acting as a true operational partner — not just a listing agent — we maximize yield while ensuring the property is maintained to standards that protect long-term asset value. Prestige and practicality, finally in one place.", image: 'https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?auto=format&w=1200&q=85', date: 'May 30, 2026', category: 'Insights', readTime: '4 min read' },
];

/** Admin categories typed in capitals ("PORTFOLIO") read as title case. */
const labelCase = (s: string): string => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s);
const formatDate = (iso: string | null): string => {
  const t = iso ? Date.parse(iso.replace(' ', 'T')) : NaN;
  return Number.isNaN(t) ? '' : new Date(t).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};
/** The admin's placeholder cover counts as no cover. */
const NO_COVER = /placeholder\.svg$/;

function fromRow(row: BlogRow): Article {
  const cover = row.cover_image_url ?? '';
  return {
    slug: row.slug,
    title: row.title,
    category: labelCase((row.category ?? '').trim()) || 'Insights',
    date: formatDate(row.published_at),
    readTime: row.read_time ?? '',
    summary: row.excerpt ?? '',
    image: NO_COVER.test(cover) ? '' : cover,
    content: row.content ?? '',
  };
}

/**
 * Category · date · read time, in small gold caps (the parts a post has). `compact` (inside a small card, or a button,
 * where a <p> may not go): category and date on one line.
 */
function Meta({ article, compact = false }: { article: Article; compact?: boolean }) {
  const parts = (compact ? [article.date] : [article.date, article.readTime]).filter(Boolean);
  const Line = compact ? 'span' : 'p';
  return (
    <Line className={`${CAPS} flex items-center gap-x-3 gap-y-1 text-xs tracking-[0.12em] text-[#C49A2A] ${compact ? 'whitespace-nowrap' : 'flex-wrap'}`}>
      {article.category}
      {parts.map((part) => (
        <span key={part} className="flex items-center gap-3 text-[#F5F0E8]/60">
          <span aria-hidden="true" className={`${DIAMOND} size-1`} />
          {part}
        </span>
      ))}
    </Line>
  );
}

/** A post's cover framed like a print, or a quiet framed panel when it has none. */
function Cover({ article, className = '' }: { article: Article; className?: string }) {
  return (
    <div className={`relative overflow-hidden border border-[#C49A2A]/20 bg-[radial-gradient(circle_at_50%_40%,rgba(196,154,42,0.14),transparent_60%),#0b0906] ${className}`}>
      {article.image ? (
        <motion.img variants={settle} src={sized(article.image, 900)} alt="" loading="lazy" decoding="async" className={`size-full object-cover ${PHOTO_ZOOM}`} />
      ) : (
        <span aria-hidden="true" className={`${DIAMOND} absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2`} />
      )}
    </div>
  );
}

const ALL = 'All';
/** The featured cover's height: a band on phones and tablets, about two fifths of the screen from lg. */
const FEATURE_H = 'h-56 sm:h-72 lg:h-[clamp(14rem,40svh,26rem)]';
/** Category tabs only once there is something to filter. */
const MIN_POSTS_FOR_TABS = 4;
const PAGE = 6;

interface BlogsPageProps {
  onInquire: () => void;
}

/** Luxe Prime insights: a featured post, the rest as framed cards, and a full-screen reader. */
export default function BlogsPage({ onInquire }: BlogsPageProps) {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [category, setCategory] = useState(ALL);
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<Article | null>(null);

  useEffect(() => {
    let live = true;
    loadBlogList('luxe-prime').then(
      (rows) => { if (live) setArticles(rows.length > 0 ? rows.map(fromRow) : SAMPLE_ARTICLES); },
      () => { if (live) setArticles(SAMPLE_ARTICLES); },
    );
    return () => { live = false; };
  }, []);

  const all = articles ?? [];
  const categories = [ALL, ...new Set(all.map((a) => a.category))];
  const showTabs = all.length >= MIN_POSTS_FOR_TABS && categories.length > 2;
  const list = category === ALL ? all : all.filter((a) => a.category === category);
  const [featured, ...rest] = list;

  return (
    <div id="luxe-blogs">
      {open && (
        <Reader
          article={open}
          related={all.filter((a) => a.slug !== open.slug).slice(0, 3)}
          onOpen={setOpen}
          onClose={() => setOpen(null)}
          onInquire={() => { setOpen(null); onInquire(); }}
        />
      )}

      {/* Opening screen: the title, then the newest post as a spread. Enters once, on load. */}
      <header className={OPENING} aria-busy={articles === null}>
        <Reveal className={`${CONTAINER} flex flex-col gap-8`}>
          <div className="flex flex-col items-center gap-4 text-center">
            <SectionHeading id="luxe-blogs-title" eyebrow="Knowledge & perspective" title="Luxe **Insights**" page />
            <motion.p variants={rise} className={`${BODY} max-w-2xl text-pretty`}>
              Expert perspectives on the luxury property market, investment strategies and the future of real estate.
            </motion.p>
          </div>
          {showTabs && (
            <motion.div variants={rise} role="group" aria-label="Category" className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => { setCategory(c); setShown(PAGE); }}
                  className={`h-10 cursor-pointer border px-4 text-sm font-medium transition-colors duration-200 ${category === c ? 'border-[#C49A2A] bg-[#C49A2A] text-[#0a0703]' : 'border-[#C49A2A]/35 text-[#F0D080] hover:border-[#C49A2A]'} ${FOCUS}`}
                >
                  {c}
                </button>
              ))}
            </motion.div>
          )}

          {articles === null ? (
            <div aria-hidden="true" className="grid items-center gap-6 border border-[#C49A2A]/20 p-2 sm:p-3 lg:grid-cols-12 lg:gap-10">
              <div className={`${FEATURE_H} animate-pulse bg-white/[0.03] lg:col-span-7 motion-reduce:animate-none`} />
              <div className="space-y-4 lg:col-span-5">
                <div className="h-3 w-40 animate-pulse bg-[#C49A2A]/20 motion-reduce:animate-none" />
                <div className="h-8 w-full animate-pulse bg-white/10 motion-reduce:animate-none" />
                <div className="h-4 w-5/6 animate-pulse bg-white/5 motion-reduce:animate-none" />
              </div>
            </div>
          ) : !featured ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className={`${BODY} text-pretty`}>No articles in this category yet.</p>
              <button type="button" onClick={() => setCategory(ALL)} className={BUTTON_SECONDARY}>Show All Articles</button>
            </div>
          ) : (
            // The newest post as a spread, the cover framed like a print beside its title and summary. Posts load after the opening screen has revealed: the featured post reveals on its own.
            <Reveal key={featured.slug}>
              <motion.article variants={rise} className="group relative grid items-center gap-6 border border-[#C49A2A]/25 bg-[#080705]/85 p-2 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#C49A2A]/70 motion-reduce:hover:translate-y-0 sm:p-3 lg:grid-cols-12 lg:gap-10">
                <Cover article={featured} className={`${FEATURE_H} lg:col-span-7`} />
                <div className="flex flex-col items-start gap-4 px-3 pb-4 lg:col-span-5 lg:px-0 lg:pb-0 lg:pr-8">
                  <Meta article={featured} />
                  <h2 className={`${DISPLAY} ${IVORY} text-balance text-[clamp(1.8rem,1.3rem+1.3vw,2.5rem)] leading-[1.1]`}>{featured.title}</h2>
                  {featured.summary && <p className={`${BODY} line-clamp-4 text-pretty`}>{featured.summary}</p>}
                  <ReadButton article={featured} onOpen={setOpen} />
                </div>
              </motion.article>
            </Reveal>
          )}
        </Reveal>
      </header>

      {/* Second screen: the other posts, then the call to inquire. */}
      <section aria-labelledby="luxe-more-heading" className={SCREEN}>
        <Reveal key={articles === null ? 'loading' : 'ready'} amount={0.1} className={CONTAINER}>
          {rest.length > 0 && (
            <>
              <SectionHeading id="luxe-more-heading" eyebrow="The journal" title="More **Insights**" className="mb-6" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(0, shown).map((article) => (
                  <motion.article variants={rise} key={article.slug} className="group relative flex flex-col border border-[#C49A2A]/25 bg-[#080705]/85 p-2 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#C49A2A]/70 motion-reduce:hover:translate-y-0">
                    <Cover article={article} className="aspect-[21/9]" />
                    <div className="flex flex-1 flex-col items-start gap-2.5 px-3 pb-3 pt-4">
                      <Meta article={article} />
                      <h3 className={`${DISPLAY} ${IVORY} text-balance text-xl leading-snug`}>{article.title}</h3>
                      {article.summary && <p className="line-clamp-2 text-pretty text-sm leading-relaxed text-[#F5F0E8]/65">{article.summary}</p>}
                      <ReadButton article={article} onOpen={setOpen} />
                    </div>
                  </motion.article>
                ))}
              </div>
              {rest.length > shown && (
                <motion.div variants={rise} className="mt-10 flex justify-center">
                  <button type="button" onClick={() => setShown((n) => n + PAGE)} className={BUTTON_SECONDARY}>
                    Show {Math.min(PAGE, rest.length - shown)} More
                  </button>
                </motion.div>
              )}
            </>
          )}
          {rest.length === 0 && <h2 id="luxe-more-heading" className="sr-only">Talk to us</h2>}
          <ClosingPanel
            className={rest.length > 0 ? 'mt-8' : ''}
            title="Looking for a **Private** Advisor?"
            text="Talk to our team about acquiring, leasing or managing a luxury property."
            primary={{ label: 'Inquire Now', onClick: onInquire }}
          />
        </Reveal>
      </section>
    </div>
  );
}

/** "Read the article", stretched over its whole card so the card is the click target. */
function ReadButton({ article, onOpen }: { article: Article; onOpen: (a: Article) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(article)}
      className={`mt-auto inline-flex cursor-pointer items-center gap-3 self-start pt-1 text-sm font-medium text-[#C49A2A] transition-colors group-hover:text-[#F0D080] after:absolute after:inset-0 after:content-[''] ${FOCUS}`}
    >
      Read the article
      <span className="sr-only">: {article.title}</span>
      <span aria-hidden="true" className={LINK_RULE} />
    </button>
  );
}

interface ReaderProps {
  article: Article;
  related: Article[];
  onOpen: (a: Article) => void;
  onClose: () => void;
  onInquire: () => void;
}

/** The full-screen article reader: category, title, cover, the formatted body, then related posts. Esc closes. */
function Reader({ article, related, onOpen, onClose, onInquire }: ReaderProps) {
  const dialogRef = useModalDialog<HTMLDivElement>(true, onClose);
  const body = useBlogBody(article.slug, article.content || article.summary);
  // Opening a related post reuses the reader: start it at the top.
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
  }, [article.slug, dialogRef]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="luxe-article-title"
      tabIndex={-1}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-[#030302] outline-none animate-in fade-in-0 duration-300 motion-reduce:animate-none"
    >
      <div className="sticky top-0 z-10 flex justify-end p-4 md:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the article"
          className={`grid size-11 cursor-pointer place-items-center border border-[#C49A2A]/60 bg-black/80 text-[#F0D080] transition-colors duration-200 hover:bg-[#C49A2A] hover:text-[#0a0703] ${FOCUS}`}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      {/* Wide on desktop: the title and the cover across the page, then the text in a reading column beside a
          side column (the call to inquire) that stays in view while reading. */}
      <article className="mx-auto -mt-8 max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <header className="max-w-4xl">
          <Meta article={article} />
          <h1 id="luxe-article-title" tabIndex={-1} data-autofocus className={`${DISPLAY} ${IVORY} mt-4 text-balance text-[clamp(2.1rem,1.4rem+2.4vw,3.4rem)] leading-[1.08] outline-none`}>
            {article.title}
          </h1>
          {article.summary && <p className={`${DISPLAY} mt-5 max-w-3xl text-pretty text-xl italic leading-snug text-[#F5F0E8]/80 sm:text-2xl`}>{article.summary}</p>}
        </header>
        {article.image && (
          <div className={`${PRINT_FRAME} mt-10`}>
            <span aria-hidden="true" className={`${DIAMOND} absolute -left-[3px] -top-[3px] size-2`} />
            <span aria-hidden="true" className={`${DIAMOND} absolute -bottom-[3px] -right-[3px] size-2`} />
            <img src={sized(article.image, 1800)} alt="" decoding="async" className="aspect-[16/9] w-full object-cover lg:aspect-[21/9]" />
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-5 text-pretty text-[17px] leading-[1.85] text-[#F5F0E8]/80 lg:col-span-8">
            {body === null ? (
              <p className="text-[#F5F0E8]/60">Loading the article…</p>
            ) : (
              <BlogBody
                content={body}
                headingClassName={`${DISPLAY} ${IVORY} pt-3 text-balance text-2xl leading-tight sm:text-3xl`}
                strongClassName="font-semibold text-[#F0D080]"
                listClassName="space-y-2 pl-5"
                listItemClassName="list-[square] marker:text-[#C49A2A]"
              />
            )}
          </div>

          <aside aria-label="Talk to an advisor" className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className={`${DOUBLE_FRAME} flex flex-col items-start gap-3 p-6`}>
                <p className={`${DISPLAY} ${IVORY} text-balance text-2xl leading-tight`}>
                  Looking for a <span className={GOLD_ACCENT}>Private</span> Advisor?
                </p>
                <p className="text-pretty text-sm leading-relaxed text-[#F5F0E8]/65">Talk to our team about acquiring, leasing or managing a luxury property.</p>
                <button type="button" onClick={onInquire} className={`${BUTTON_PRIMARY} mt-2 w-full`}>Inquire Now</button>
              </div>
            </div>
          </aside>
        </div>

        {/* Keep reading: the other posts as framed cover cards, one column per post (up to three), rising in as the
            reader scrolls down to them. */}
        {related.length > 0 && (
          <Reveal amount={0.2} className="mt-20">
            <section aria-labelledby="luxe-related-heading">
              <SectionHeading id="luxe-related-heading" eyebrow="Keep reading" title="More **Insights**" className="mb-8" />
              <ul className="flex flex-wrap justify-center gap-5">
                {related.map((a) => (
                  <motion.li key={a.slug} variants={rise} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
                    <button
                      type="button"
                      onClick={() => onOpen(a)}
                      className={`group flex h-full w-full cursor-pointer flex-col border border-[#C49A2A]/25 bg-[#080705]/85 p-2 text-left transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#C49A2A]/70 motion-reduce:hover:translate-y-0 ${FOCUS}`}
                    >
                      <span className="relative block aspect-[2/1] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(196,154,42,0.14),transparent_60%),#0b0906]">
                        {a.image ? (
                          <img src={sized(a.image, 700)} alt="" loading="lazy" decoding="async" className={`size-full object-cover ${PHOTO_ZOOM}`} />
                        ) : (
                          <span aria-hidden="true" className={`${DIAMOND} absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2`} />
                        )}
                      </span>
                      <span className="flex flex-1 flex-col items-start gap-2.5 px-2 pb-2 pt-4">
                        <Meta article={a} compact />
                        <span className={`${DISPLAY} ${IVORY} line-clamp-3 text-balance text-xl leading-snug`}>{a.title}</span>
                        <span className={`${CAPS} mt-auto inline-flex items-center gap-3 pt-1 text-xs tracking-[0.12em] text-[#C49A2A] transition-colors duration-200 group-hover:text-[#F0D080]`}>
                          Read the article
                          <span aria-hidden="true" className={LINK_RULE} />
                        </span>
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}
      </article>
    </div>,
    document.body,
  );
}

