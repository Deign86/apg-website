import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LiquidGlass } from 'quick-liquid/react';
import { ArrowRight, BookOpen, ImageOff, Search } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { loadBlogList, type BlogRow } from '../../../blogApi';
import { FALLBACK_BLOG_POSTS } from '../data';
import { ArticleView, articleMeta, type Article } from './ArticleView';
import { Reveal, rise, SectionHeading } from './reveal';
import { ARROW, BUTTON_SECONDARY, CAPTION, FOCUS, GLASS_BADGE } from './ui';

const PAGE_X = 'mx-auto max-w-7xl px-5 sm:px-8 lg:px-12';
/** Articles shown before "Show more", and how many each click adds. */
const PAGE = 6;
const ALL = 'All';
/** The admin's "no cover" image: shown as the branded placeholder instead. */
const NO_COVER = /\/placeholder\.svg$/;
const SLIDE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 } as const;

/** "REAL ESTATE" (admin categories are free text) reads as "Real Estate"; mixed case is kept. */
const labelCase = (s: string): string =>
  s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s;

const formatDate = (iso: string | null): string => {
  const t = iso ? Date.parse(iso.replace(' ', 'T')) : NaN;
  return Number.isNaN(t) ? '' : new Date(t).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

function fromRow(row: BlogRow): Article {
  const cover = row.cover_image_url ?? '';
  return {
    key: String(row.id),
    slug: row.slug,
    title: row.title,
    category: labelCase((row.category ?? '').trim()) || 'Insights',
    date: formatDate(row.published_at),
    readTime: row.read_time ?? '',
    summary: row.excerpt ?? '',
    image: NO_COVER.test(cover) ? '' : cover,
    content: row.content ?? '',
    featured: Number(row.is_featured) === 1,
  };
}

// The built-in sample posts, shown only when the blog cannot be loaded.
const SAMPLE_ARTICLES: Article[] = FALLBACK_BLOG_POSTS.map((p) => ({
  key: String(p.id),
  slug: undefined,
  title: p.title,
  category: labelCase(p.category),
  date: p.date ?? '',
  readTime: p.readTime ?? '',
  summary: p.summary ?? '',
  image: p.image ?? '',
  content: p.content,
  featured: Boolean(p.isFeatured),
}));

interface CoverProps {
  article: Article;
  className: string;
  eager?: boolean;
}

/** The cover photo with its category on glass, or the branded placeholder when the post has none. */
function Cover({ article, className, eager = false }: CoverProps) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#0d0d10] ${className}`}>
      {article.image && !broken ? (
        <img
          src={article.image}
          alt=""
          loading={eager ? undefined : 'lazy'}
          decoding="async"
          onError={() => setBroken(true)}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,rgba(197,168,92,0.14),transparent_65%)]">
          <span className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
            <ImageOff className="size-6 text-[#c5a85c]/60" aria-hidden="true" />
            Alpha Premier Insights
          </span>
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
      <div className="absolute left-4 top-4">
        <LiquidGlass config={GLASS_BADGE}>
          <span className="block px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f0dfae]">{article.category}</span>
        </LiquidGlass>
      </div>
    </div>
  );
}

const CARD =
  'group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01)_60%)] text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 hover:shadow-[0_24px_50px_-24px_rgba(197,168,92,0.35)] motion-reduce:hover:translate-y-0';
const CARD_LINE = 'absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/80 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100';

interface CardProps {
  article: Article;
  onOpen: (article: Article) => void;
}

function FeaturedCard({ article, onOpen }: CardProps) {
  const meta = articleMeta(article);
  return (
    <button type="button" onClick={() => onOpen(article)} className={`${CARD} lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] ${FOCUS}`}>
      <span aria-hidden="true" className={CARD_LINE} />
      <Cover article={article} eager className="aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[20rem]" />
      <span className="flex flex-col justify-center gap-3 p-6 sm:p-8 lg:p-10">
        <span className={`${CAPTION} text-[#c5a85c]`}>Featured{meta && ` · ${meta}`}</span>
        <span className="text-balance text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-semibold leading-snug text-white">{article.title}</span>
        {article.summary && <span className="line-clamp-3 text-pretty text-[15px] leading-relaxed text-white/70">{article.summary}</span>}
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#c5a85c] transition-colors group-hover:text-[#dfc47b]">
          Read article
          <ArrowRight className={ARROW} aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

function ArticleCard({ article, onOpen }: CardProps) {
  const meta = articleMeta(article);
  return (
    <button type="button" onClick={() => onOpen(article)} className={`${CARD} ${FOCUS}`}>
      <span aria-hidden="true" className={CARD_LINE} />
      <Cover article={article} className="aspect-[16/10] w-full short:aspect-[2/1]" />
      <span className="flex flex-1 flex-col gap-2 p-6">
        {meta && <span className={CAPTION}>{meta}</span>}
        <span className="text-pretty text-lg font-semibold leading-snug text-white">{article.title}</span>
        {article.summary && <span className="line-clamp-3 text-pretty text-[15px] leading-relaxed text-white/65">{article.summary}</span>}
        <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-[#c5a85c] transition-colors group-hover:text-[#dfc47b]">
          Read article
          <ArrowRight className={ARROW} aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

function CardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] ${wide ? 'lg:grid lg:grid-cols-2' : ''}`}>
      <div className={`animate-pulse bg-white/[0.04] motion-reduce:animate-none ${wide ? 'aspect-[16/9] lg:aspect-auto lg:min-h-[20rem]' : 'aspect-[16/10]'}`} />
      <div className="space-y-3 p-7">
        <div className="h-3 w-1/3 rounded-full bg-white/[0.05]" />
        <div className="h-5 w-3/4 rounded-full bg-white/[0.07]" />
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

interface BlogsSectionProps {
  /** Opens Realty's inquiry popup (from an article's closing call to action). */
  onInquire: () => void;
}

/**
 * Realty's blog: the admin's Realty posts (/api/blogs.php; corporate posts when Realty has none, the built-in
 * samples only if the blog cannot be loaded). The featured post leads, then category pills (a gold highlight
 * glides between them), a search that also matches article text (bodies load on the first search), and a grid
 * of PAGE cards with "Show more". A post opens in ArticleView, full screen.
 */
export default function BlogsSection({ onInquire }: BlogsSectionProps) {
  const { content } = useContent('realty');
  const reduce = useReducedMotion();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<Article | null>(null);
  const [bodies, setBodies] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    let live = true;
    loadBlogList('realty').then(
      (rows) => live && setArticles(rows.length > 0 ? rows.map(fromRow) : SAMPLE_ARTICLES),
      () => live && setArticles(SAMPLE_ARTICLES),
    );
    return () => {
      live = false;
    };
  }, []);

  // The list carries no article text, but search also matches it: the first search loads the bodies once.
  useEffect(() => {
    if (!query || bodies) return;
    loadBlogList('realty', true).then(
      (rows) => setBodies(new Map(rows.map((r) => [String(r.id), r.content ?? '']))),
      () => setBodies(new Map()),
    );
  }, [query, bodies]);

  const list = articles ?? [];
  // One pill per category, ignoring letter case (admin categories are free text).
  const seen = new Map<string, string>();
  for (const a of list) if (!seen.has(a.category.toLowerCase())) seen.set(a.category.toLowerCase(), a.category);
  const categories = [ALL, ...seen.values()];

  const browsing = category === ALL && query.trim() === '';
  const featured = browsing ? (list.find((a) => a.featured) ?? list[0] ?? null) : null;
  const q = query.trim().toLowerCase();
  const matches = list.filter((a) => {
    if (featured && a.key === featured.key) return false;
    if (category !== ALL && a.category.toLowerCase() !== category.toLowerCase()) return false;
    if (!q) return true;
    const text = `${a.title} ${a.summary} ${bodies?.get(a.key) ?? a.content}`.toLowerCase();
    return text.includes(q);
  });
  const total = matches.length + (featured ? 1 : 0);

  const related = open
    ? [...list.filter((a) => a.key !== open.key && a.category === open.category), ...list.filter((a) => a.key !== open.key && a.category !== open.category)].slice(0, 3)
    : [];

  return (
    <div id="realty-blogs" className={`${PAGE_X} pb-16 pt-28 sm:pb-24 sm:pt-32`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <SectionHeading id="realty-blogs-title" page align="left" eyebrow="Insights & news" title={String(content.blogs_heading ?? '')} />
        </Reveal>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c5a85c]" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search articles"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search articles"
            className="h-12 w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-5 text-sm text-white outline-none transition-colors placeholder:text-white/55 focus:border-[#c5a85c]/70 focus:bg-white/[0.05]"
          />
        </div>
      </div>

      {articles === null ? (
        <div className="mt-10 space-y-8">
          <CardSkeleton wide />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {featured && (
            <Reveal className="mt-10" amount={0.1}>
              <motion.div variants={rise}>
                <FeaturedCard article={featured} onOpen={setOpen} />
              </motion.div>
            </Reveal>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              <div role="group" aria-label="Article category" className="flex w-max gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                {categories.map((c) => {
                  const on = c.toLowerCase() === category.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setCategory(c);
                        setShown(PAGE);
                      }}
                      className={`relative h-10 cursor-pointer whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${FOCUS} ${on ? 'text-[#0a0a0c]' : 'text-white/65 hover:text-white'}`}
                    >
                      {on && (
                        <motion.span
                          layoutId="realty-blog-category"
                          transition={reduce ? { duration: 0 } : SLIDE}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#e6cd86,#c5a85c)] shadow-[0_6px_18px_-8px_rgba(197,168,92,0.75)]"
                        />
                      )}
                      <span className="relative">{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p role="status" className="shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 tabular-nums">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[#c5a85c] shadow-[0_0_6px_rgba(197,168,92,0.8)]" />
                {total} {total === 1 ? 'article' : 'articles'}
              </span>
            </p>
          </div>

          {matches.length > 0 ? (
            <Reveal amount={0.05} className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matches.slice(0, shown).map((a) => (
                <motion.div key={a.key} variants={rise}>
                  <ArticleCard article={a} onOpen={setOpen} />
                </motion.div>
              ))}
            </Reveal>
          ) : (
            !featured && (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center">
                <BookOpen className="size-8 text-[#c5a85c]/60" aria-hidden="true" />
                <p className="text-base font-semibold text-white">No articles found</p>
                <p className="text-sm text-white/55">Try another word or category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory(ALL);
                  }}
                  className={`${BUTTON_SECONDARY} mt-2`}
                >
                  Show all articles
                </button>
              </div>
            )
          )}

          {matches.length > shown && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className={BUTTON_SECONDARY}>
                Show {Math.min(PAGE, matches.length - shown)} more
              </button>
            </div>
          )}
        </>
      )}

      {open && (
        <ArticleView
          key={open.key}
          article={open}
          related={related}
          onClose={() => setOpen(null)}
          onOpen={setOpen}
          onInquire={() => {
            setOpen(null);
            onInquire();
          }}
        />
      )}
    </div>
  );
}
