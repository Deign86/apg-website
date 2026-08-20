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
  id: string;
  title: string;
  division: string;
  location: string;
  type: 'FULL-TIME' | 'PART-TIME' | 'HYBRID' | 'CONTRACT';
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface BlogPost {
  id: string;
  category: 'REAL ESTATE' | 'CONSTRUCTION' | 'BUSINESS HUB' | 'LEADERSHIP' | 'LOGISTICS' | 'MARKET UPDATE';
  date: string;
  title: string;
  summary: string;
  content: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  image: string;
  featured?: boolean;
}

export interface PropertyItem {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  specs: string;
  image: string;
  description: string;
  features: string[];
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
  phone: string;
  enterprise: string;
  inquiryType: 'property' | 'virtual-office' | 'partnership' | 'career' | 'general';
  message: string;
  preferredDate?: string;
}
