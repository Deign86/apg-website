import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { BlogBody } from '@/components/BlogBody';
import { RichText } from '@/components/RichText';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useBlogBody } from '../../../blogApi';
import { realtyHref } from './ListingCard';
import { ARROW, BUTTON_PRIMARY, BUTTON_SECONDARY, CAPTION, CTA_PANEL, EYEBROW, FOCUS, GOLD_ACCENT } from './ui';

/** A blog post as the Realty blog shows it (from /api/blogs.php, or the offline sample posts). */
export interface Article {
  key: string;
  /** Database posts: the body is fetched by slug when the article opens. */
  slug: string | undefined;
  title: string;
  category: string;
  /** "Oct 9, 2026"; '' when the post has no publish date. */
  date: string;
  /** '' when the post has none. */
  readTime: string;
  summary: string;
  /** '' when the post has no cover (the card shows a placeholder). */
  image: string;
  /** The body when already loaded (sample posts, or a list with bodies). */
  content: string;
  featured: boolean;
}

/** "Oct 9, 2026 · 4 min read", skipping what the post lacks. */
export const articleMeta = (a: Article): string => [a.date, a.readTime].filter(Boolean).join(' · ');

/** A small pill naming the article's category (not over a photo, so no glass). */
export function CategoryTag({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#c5a85c]/40 bg-[#c5a85c]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6cd86]">
      {label}
    </span>
  );
}

interface ArticleViewProps {
  article: Article;
  /** Up to three other articles, same category first. */
  related: Article[];
  onClose: () => void;
  onOpen: (article: Article) => void;
  /** Closes the article and opens the inquiry popup. */
  onInquire: () => void;
}

/**
 * The full-screen reader for one blog post, over the blog list (which stays mounted): category, title, date and
 * read time, the cover, the body (BlogBody: paragraphs, ## headings, - lists, **bold**) in a reading column, then
 * a call to inquire and related articles. Like the listing view: a floating X, Esc and focus handling come from
 * useModalDialog; focus starts on the title. Keyed by article, so opening a related one starts at its top.
 */
export function ArticleView({ article, related, onClose, onOpen, onInquire }: ArticleViewProps) {
  const ref = useModalDialog<HTMLDivElement>(true, onClose);
  const body = useBlogBody(article.slug, article.content || article.summary);
  const meta = articleMeta(article);

  return createPortal(
    <div
      ref={ref}
      id="realty-article"
      role="dialog"
      aria-modal="true"
      aria-labelledby="realty-article-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#060608] outline-none animate-in fade-in-0 duration-300 motion-reduce:animate-none"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_50%_0%,rgba(197,168,92,0.12),transparent_70%)]" />

      <div className="pointer-events-none sticky top-0 z-30 h-0">
        <div className="mx-auto flex w-full max-w-[88rem] justify-end px-5 pt-5 sm:px-8 lg:px-12 lg:pt-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className={`pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#0b0b0d]/60 text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors hover:border-[#c5a85c]/60 hover:text-[#f0dfae] ${FOCUS}`}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <article className="relative mx-auto w-full max-w-3xl px-5 pb-16 pt-14 animate-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none sm:px-8 lg:pt-20">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryTag label={article.category} />
          {meta && <span className={CAPTION}>{meta}</span>}
        </div>
        <h2
          id="realty-article-title"
          tabIndex={-1}
          data-autofocus
          className="mt-4 text-balance font-display text-[clamp(1.9rem,1.3rem+2vw,3rem)] leading-[1.12] text-white outline-none"
        >
          {article.title}
        </h2>
        {article.summary && <p className="mt-4 text-pretty text-lg leading-relaxed text-white/70">{article.summary}</p>}
        <p className={`${CAPTION} mt-5`}>By Alpha Premier Realty</p>

        {article.image && (
          <img
            src={article.image}
            alt=""
            decoding="async"
            className="mt-8 aspect-[16/9] w-full rounded-3xl border border-white/10 object-cover"
          />
        )}

        <div className="mt-10 space-y-6">
          {body === null ? (
            <div aria-hidden="true" className="space-y-3">
              {[100, 96, 90, 98, 70].map((w, i) => (
                <div key={i} className="h-3.5 animate-pulse rounded-full bg-white/[0.06] motion-reduce:animate-none" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <BlogBody
              content={body}
              paragraphClassName="text-pretty text-[17px] leading-[1.8] text-white/80"
              headingClassName="pt-4 font-display text-[1.6rem] leading-snug text-white"
              strongClassName="font-semibold text-white"
              listClassName="space-y-2 pl-1 text-[17px] leading-[1.7] text-white/80"
              listItemClassName="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-[#c5a85c]"
            />
          )}
        </div>

        <div className={`${CTA_PANEL} mt-14`}>
          <div>
            <p className="font-display text-xl text-white sm:text-2xl">
              <RichText text="Looking for a **Space**?" strongClassName={GOLD_ACCENT} />
            </p>
            <p className="mt-1 text-sm text-white/65">Our brokers answer within one business day.</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <button type="button" onClick={onInquire} className={`${BUTTON_PRIMARY} px-4 sm:px-7`}>
              Inquire
            </button>
            <Link to={realtyHref('/properties')} className={`${BUTTON_SECONDARY} px-4 sm:px-7`}>
              Properties
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="realty-article-more" className="mx-auto w-full max-w-7xl border-t border-white/[0.06] px-5 pb-20 pt-12 sm:px-8 lg:px-12">
          <p className={EYEBROW}>
            <span aria-hidden="true" className="h-px w-8 bg-[#c5a85c]" />
            Keep reading
          </p>
          <h3 id="realty-article-more" className="mt-3 font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.25rem)] leading-tight text-white">
            More <span className={GOLD_ACCENT}>Articles</span>
          </h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => onOpen(a)}
                className={`group flex cursor-pointer flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 motion-reduce:hover:translate-y-0 ${FOCUS}`}
              >
                <span className={CAPTION}>{[a.category, a.date].filter(Boolean).join(' · ')}</span>
                <span className="text-pretty text-base font-semibold leading-snug text-white">{a.title}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#c5a85c]">
                  Read article
                  <ArrowRight className={ARROW} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>,
    document.body,
  );
}
