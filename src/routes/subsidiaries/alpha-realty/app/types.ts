export interface BlogPost {
  id: string | number;
  title: string;
  date?: string;
  published_at?: string;
  category: string;
  image?: string;
  cover_image_url?: string;
  summary?: string;
  excerpt?: string;
  content: string;
}

export interface JobOpening {
  id: string | number;
  title: string;
  location: string;
  type: string;
  department?: string;
  description: string;
  requirements: string[];
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  serviceCategory?: string;
}
