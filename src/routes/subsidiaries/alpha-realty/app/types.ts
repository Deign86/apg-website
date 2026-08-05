export interface Listing {
  id: string;
  title: string;
  type: 'For Lease' | 'For Sale';
  category: 'COMMERCIAL SPACE' | 'CONDO / HOUSE AND LOT' | 'OFFICE SPACE' | 'WAREHOUSE SPACE' | 'VIRTUAL OFFICE SPACE';
  price: number;
  pricePeriod?: string; // e.g. "mo" or "SQM"
  cusa?: string | number;
  terms?: string;
  location: string;
  city: string;
  floorArea: number; // in sqm
  lotArea?: number | 'N/A'; // in sqm
  floor?: string;
  parking?: string;
  height?: string;
  loading?: string;
  image: string;
  images?: string[];
  features?: string[];
  suitableFor?: string[];
  isUpdated?: boolean;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: 'Market Trends' | 'Property Tips' | 'Investment Guides' | 'Company News';
  image: string;
  summary: string;
  content: string;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string; // e.g. "Full-Time" or "Part-Time"
  department: string;
  description: string;
  requirements: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
}
