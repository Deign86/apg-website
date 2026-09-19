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

/**
 * Corporate fallback rows, rendered while loading or if the request fails.
 * Authoritative copy lives in the admin portal (service_items, category
 * 'dynamic-tree', falling back to 'corporate'); these only cover DB outages.
 */
export const FALLBACK_SERVICES = [
  { id: 'model-casting', title: 'Model & Influencer Casting', description: "We curate and connect brands with the right faces — models, influencers, and personalities who embody your brand's vision and voice." },
  { id: 'tv-digital', title: 'TV, Digital & Online Advertising', description: 'From broadcast commercials to targeted digital campaigns, we craft media that performs across every screen and digital platform.' },
  { id: 'product-launches', title: 'Product Launches & Social Campaigns', description: 'Launch your product with strategic campaigns and buzz-building content that drives real engagement and lasting brand recall.' },
  { id: 'photography', title: 'Fashion & Product Photography', description: "We produce studio-grade visual assets that elevate your brand's identity with editorial precision and creative vision." },
  { id: 'video-production', title: 'Video Direction & Production', description: 'From concept to final cut, we craft compelling video stories that captivate, convert, and endure beyond the campaign.' },
  { id: 'campaign-dev', title: 'Creative Campaign Development', description: 'End-to-end campaign design that connects your brand to your audience with clarity, emotion, and commercial power.' },
];
