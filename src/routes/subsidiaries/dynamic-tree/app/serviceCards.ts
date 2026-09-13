import { Users, Monitor, Megaphone, Camera, Film, Lightbulb, Sparkles } from 'lucide-react';

/**
 * Icons are presentation, so they stay in code rather than in the database.
 * Keyed by service title, which is the stable identifier authored in the admin
 * portal. Unknown titles fall back to a neutral icon.
 */
const ICON_BY_TITLE = {
  'Model & Influencer Casting': Users,
  'TV, Digital & Online Advertising': Monitor,
  'Product Launches & Social Campaigns': Megaphone,
  'Fashion & Product Photography': Camera,
  'Video Direction & Production': Film,
  'Creative Campaign Development': Lightbulb,
};

export type ServiceCard = {
  id: string;
  icon: typeof Users;
  title: string;
  description: string;
  features: string[];
  image?: string;
};

/** Maps an API service row onto the card shape the Dynamic Tree pages render. */
export function toServiceCard(item: {
  id: number | string;
  title: string;
  description?: string;
  summary?: string;
  features?: string[];
  image_url?: string;
}): ServiceCard {
  return {
    id: String(item.id),
    icon: ICON_BY_TITLE[item.title] ?? Sparkles,
    title: item.title,
    description: item.description || item.summary || '',
    features: Array.isArray(item.features) ? item.features : [],
    image: item.image_url,
  };
}
