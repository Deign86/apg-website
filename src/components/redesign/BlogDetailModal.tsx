import React from 'react';
import { BlogPost } from '../../types';
import { X, Calendar, Clock, User, Share2, Tag, ArrowLeft } from 'lucide-react';

interface BlogDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInquire: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onOpenInquire
}) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0D12] border border-[#D4AF37] w-full max-w-3xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col rounded-2xl">
        
        {/* Header Bar */}
        <div className="bg-black px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="bg-[#D4AF37] text-neutral-950 px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase rounded-md">
              {post.category}
            </span>
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#D4AF37]" />
              {post.date}
            </span>
          </div>

          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Article Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Article Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden border border-neutral-800 rounded-xl">
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
                  <p className="text-[10px] text-neutral-500">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {post.readTime}
                </span>
                <button
                  onClick={() => alert("Article link copied to clipboard.")}
                  className="flex items-center gap-1 text-[#D4AF37] hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-xs sm:text-sm text-neutral-300 space-y-4 leading-relaxed font-sans">
            {post.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm sm:text-base font-bold text-[#D4AF37] uppercase tracking-wider pt-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-black border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase">
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
