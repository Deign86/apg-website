import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * The open blog post of a company blog page, kept in the URL (?post=<slug>) so a post can be
 * shared and survives a refresh; the browser's Back button and Esc close it.
 */
export function useBlogPostParam() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  // True while the open post was opened from this page's list (its history entry is ours to pop).
  const openedHere = useRef(false);
  const postSlug = params.get('post');

  const openPost = useCallback((slug: string) => {
    // Post-to-post (related articles) replaces, so closing always returns to the list.
    setParams({ post: slug }, { replace: postSlug !== null });
    if (postSlug === null) openedHere.current = true;
    window.scrollTo(0, 0);
  }, [setParams, postSlug]);

  const closePost = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      navigate(-1);
    } else {
      setParams({}, { replace: true });
    }
  }, [navigate, setParams]);

  /** Props for a real link to a post: shareable href, modified/middle clicks open a tab, a plain click opens in place. */
  const postLink = useCallback((slug: string) => ({
    href: `?post=${encodeURIComponent(slug)}`,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      openPost(slug);
    },
  }), [openPost]);

  useEffect(() => {
    if (postSlug === null) return undefined;
    const onKey = (e: KeyboardEvent) => {
      // A dialog over the article (lightbox, chat, consent) handles its own Esc.
      if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('[aria-modal="true"]')) return;
      closePost();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [postSlug, closePost]);

  return { postSlug, openPost, closePost, postLink };
}
