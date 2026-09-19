import { BlogPost, JobOpening } from './types';
import { BLOG_POSTS, OPEN_POSITIONS } from '@/data/companyData';

// Corporate fallback rows, shown while loading or if the API is unreachable.
// The API itself returns corporate rows when realty has none of its own
// (fallback:true), so these statics are strictly an offline safety net.
export const FALLBACK_BLOG_POSTS: BlogPost[] = BLOG_POSTS.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  date: p.date,
  readTime: p.readTime,
  summary: p.summary,
  image: p.image,
  content: p.content,
  isFeatured: p.featured,
}));

export const FALLBACK_JOB_OPENINGS: JobOpening[] = OPEN_POSITIONS.map((j) => ({
  id: j.id,
  title: j.title,
  location: j.location,
  type: j.type,
  department: j.division,
  description: j.description,
  requirements: j.requirements ?? [],
}));
