import React from 'react';
import { X, Calendar, Clock, Share2 } from 'lucide-react';

export const BlogDetailModal = ({
  post,
  isOpen,
  onClose,
  onOpenInquire
}) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0E121B] border border-[#E2B857] w-full max-w-3xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-[#151A26] px-6 py-4 border-b border-[#2A303F] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="bg-[#E2B857] text-neutral-950 px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase">
              {post.category}
            </span>
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#E2B857]" />
              {post.date || new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Article Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Article Image */}
          {(post.image || post.img_url) && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden border border-[#2B3142]">
              <img
                src={post.image || post.img_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-transparent opacity-80" />
            </div>
          )}

          {/* Title & Author Meta */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 border-y border-[#202636] py-3 gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-[#E2B857] text-neutral-950 font-bold flex items-center justify-center text-xs">
                  {(post.author?.name || post.author || 'A').charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-200">{post.author?.name || post.author || 'Alpha Premier'}</p>
                  <p className="text-[10px] text-neutral-500">{post.author?.role || 'Corporate Advisory'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#E2B857]" />
                  {post.readTime || post.read_time || '5 min read'}
                </span>
                <button
                  onClick={() => alert("Article link copied to clipboard.")}
                  className="flex items-center gap-1 text-[#E2B857] hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-xs sm:text-sm text-neutral-300 space-y-4 leading-relaxed font-sans">
            {(post.content || post.description || '').split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm sm:text-base font-bold text-[#E2B857] uppercase tracking-wider pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-[#151A26] border border-[#E2B857]/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-[#E2B857] uppercase">
                Explore Business & Real Estate Solutions
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                Consult with Alpha Premier Group specialists regarding Ortigas commercial space and virtual offices.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenInquire();
              }}
              className="px-5 py-2.5 bg-[#E2B857] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#cfa543] whitespace-nowrap"
            >
              INQUIRE NOW
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
