export type NavTab = 'home' | 'enterprises' | 'careers' | 'blogs';

export interface Enterprise {
  id: string;
  tag: string;
  name: string;
  subTitle?: string;
  description: string;
  iconName: string;
  image?: string;
  gallery?: string[];
  ctaText: string;
  ctaAction?: string;
  highlights?: string[];
  badges?: string[];
  themeColor?: string;
  category: 'real-estate' | 'construction' | 'facility' | 'creative' | 'outsource' | 'business';
}

export interface JobPosition {
  id: string | number;
  title: string;
  division?: string;
  tag?: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  status?: 'active' | 'closed';
  sort_order?: number;
}

export interface BlogPost {
  id: string | number;
  slug?: string;
  category: string;
  date?: string;
  published_at?: string;
  title: string;
  summary?: string;
  excerpt?: string;
  content: string;
  readTime?: string;
  author?: {
    name: string;
    role: string;
  };
  image?: string;
  cover_image_url?: string;
  featured?: boolean;
  status?: 'draft' | 'published';
}

export interface ServiceItem {
  id: number | string;
  category: 'virtual-office' | '88prime' | 'construction' | 'swiftclear' | 'altaventure' | 'realty';
  title: string;
  description: string;
  price?: string;
  image_url?: string;
  sort_order?: number;
  is_published?: number | boolean;
}

export interface ContentBlock {
  id?: number | string;
  page_slug: string;
  section_key: string;
  type: 'text' | 'richtext' | 'image' | 'card';
  value: string;
  sort_order?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface InquireFormData {
  fullName: string;
  email: string;
  phone?: string;
  enterprise?: string;
  inquiryType: 'virtual-office' | 'partnership' | 'career' | 'general';
  message: string;
  preferredDate?: string;
}
