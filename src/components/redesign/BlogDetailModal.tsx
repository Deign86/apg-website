import React, { useEffect, useState } from 'react';
import { useModalDialog } from '../../hooks/useModalDialog';
import { BlogPost } from '../../types';
import { BlogBody } from '../BlogBody';
import { X, Calendar, Clock, User, Share2, Tag, ArrowLeft, Check } from 'lucide-react';

interface BlogDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInquire: () => void;
}

// The blog list (/api/blogs.php?summary=1) sends posts without their body: the reader loads it by
// slug when an article opens, and keeps it for the session.
const loadedBodies = new Map<string, string>();

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenInquire
}) => {
  const [copied, setCopied] = useState(false);
  const dialogRef = useModalDialog<HTMLDivElement>(isOpen && !!post, onClose);
  // Settled body request of the open article; content null = it failed.
  const [fetched, setFetched] = useState<{ slug: string; content: string | null } | null>(null);
  const slug = post?.slug ?? '';
  const needsBody = isOpen && !!post && !post.content && slug !== '';
  // A closed reader forgets a failed request, so reopening the article retries without first
  // showing the old failure.
  if (!needsBody && fetched) setFetched(null);

  useEffect(() => {
    if (!needsBody || loadedBodies.has(slug)) return undefined;
    let active = true;
    fetch(`/api/blogs.php?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (result?.success !== true || !result.data) throw new Error('Post unavailable');
        const content = String(result.data.content ?? '');
        loadedBodies.set(slug, content);
        if (active) setFetched({ slug, content });
      })
      .catch(() => {
        if (active) setFetched({ slug, content: null });
      });
    return () => { active = false; };
  }, [needsBody, slug]);

  // undefined while the body is still loading
  const content = needsBody ? loadedBodies.get(slug) : post?.content;
  const bodyFailed = content === undefined && fetched?.slug === slug && fetched.content === null;

  const handleShare = () => {
    // Link straight to this article; BlogsView opens it from ?post=.
    const link = `${window.location.origin}/blogs?post=${encodeURIComponent(post?.slug || String(post?.id ?? ''))}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        tabIndex={-1}
        className="bg-[#0B0D12] border border-[#D4AF37] w-full max-w-3xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90dvh] flex flex-col rounded-2xl">
        
        {/* Header Bar */}
        <div className="bg-black px-4 sm:px-6 py-4 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="whitespace-nowrap bg-[#D4AF37] text-neutral-950 px-2 py-0.5 font-bold text-xs tracking-wider uppercase rounded-md">
              {post.category}
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#D4AF37]" />
              {post.date}
            </span>
          </div>

          <button type="button" onClick={onClose} aria-label="Close article" className="size-10 shrink-0 -mr-2 flex items-center justify-center text-neutral-400 hover:text-white">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Article Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Article Image */}
          <div className="relative h-64 sm:h-80 max-h-[45dvh] w-full overflow-hidden border border-neutral-800 rounded-xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-transparent to-transparent opacity-80" />
          </div>

          {/* Title & Author Meta */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 border-y border-neutral-800 py-3 gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-[#D4AF37] text-neutral-950 font-bold flex items-center justify-center text-xs rounded-full">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-200">{post.author.name}</p>
                  <p className="text-xs text-neutral-400">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {post.readTime}
                </span>
                <button
                  onClick={handleShare}
                  className="min-h-10 flex items-center gap-1 text-[#D4AF37] hover:underline cursor-pointer transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-xs sm:text-sm text-neutral-300 space-y-4 leading-relaxed font-sans">
            {content !== undefined ? (
              <BlogBody
                content={content}
                paragraphClassName="text-neutral-300"
                headingClassName="text-base sm:text-lg font-bold text-[#D4AF37] uppercase tracking-wider pt-2"
                strongClassName="text-white font-semibold"
                listClassName="list-disc pl-5 space-y-1 text-neutral-300"
              />
            ) : (
              <p role="status" className={`text-neutral-400 ${bodyFailed ? '' : 'animate-pulse'}`}>
                {bodyFailed ? 'This article could not be loaded. Please try again later.' : 'Loading article…'}
              </p>
            )}
          </div>

          {/* CTA Section */}
          <div className="bg-black border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase">
                Explore Business & Real Estate Solutions
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Consult with Alpha Premier Group specialists regarding Ortigas commercial space and virtual offices.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenInquire();
              }}
              className="px-5 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all whitespace-nowrap rounded-lg"
            >
              INQUIRE NOW
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
