import { useState, useEffect, useCallback } from 'react';

const FALLBACK_LISTINGS = [
  {
    id: 1,
    title: 'Premium Ortigas Central Logistics Warehouse',
    slug: 'premium-ortigas-central-logistics-warehouse',
    property_type: 'warehouse',
    price: 185000000.0,
    price_display: '₱ 185,000,000',
    address: 'Amang Rodriguez Ave, Pasig',
    city: 'Pasig City',
    location: 'Pasig City, Metro Manila',
    floor_area: 3200.0,
    lot_area: 4500.0,
    bedrooms: null,
    bathrooms: 6,
    status: 'FOR SALE',
    featured: 1,
    is_published: 1,
    description: 'High-ceiling industrial logistics warehouse strategically situated with direct arterial access to C-5, Ortigas Avenue, and Marcos Highway. Features 12-meter clear heights, multi-bay loading docks with hydraulic levelers, heavy-duty concrete flooring (5000 PSI), 3-phase high-voltage power substation, and 24/7 guarded security perimeter.',
    primary_image: '/assets/images/realty-warehouse.png',
    images: [
      { id: 1, image_url: '/assets/images/realty-warehouse.png', caption: 'Exterior View & Loading Bay', is_primary: 1 },
      { id: 2, image_url: '/assets/images/realty-warehouse.png', caption: 'Interior Warehouse Floor', is_primary: 0 }
    ]
  },
  {
    id: 2,
    title: 'Tektite East Tower Grade-A Commercial Office',
    slug: 'tektite-east-tower-grade-a-commercial-office',
    property_type: 'office',
    price: 420000.0,
    price_display: '₱ 420,000 / mo',
    address: 'Philippine Stock Exchange Centre, Exchange Road',
    city: 'Pasig City',
    location: 'Ortigas Center, Pasig City',
    floor_area: 450.0,
    lot_area: 450.0,
    bedrooms: null,
    bathrooms: 4,
    status: 'FOR LEASE',
    featured: 1,
    is_published: 1,
    description: 'Fully fitted corporate headquarters on a high floor overlooking the Ortigas skyline. Comes equipped with executive corner suites, 20-seat main boardroom with video conferencing infrastructure, acoustic open-plan workstations, private server room with dedicated precision cooling, and biometric access control.',
    primary_image: '/assets/images/realty-officespaces.png',
    images: [
      { id: 3, image_url: '/assets/images/realty-officespaces.png', caption: 'Executive Conference Room', is_primary: 1 },
      { id: 4, image_url: '/assets/images/realty-officespaces.png', caption: 'Open Plan Workspace', is_primary: 0 }
    ]
  },
  {
    id: 3,
    title: 'BGC High Street Retail Commercial Space',
    slug: 'bgc-high-street-retail-commercial-space',
    property_type: 'commercial',
    price: 280000.0,
    price_display: '₱ 280,000 / mo',
    address: 'Bonifacio High Street Block',
    city: 'Taguig City',
    location: 'Bonifacio Global City, Taguig',
    floor_area: 210.0,
    lot_area: 210.0,
    bedrooms: null,
    bathrooms: 2,
    status: 'FOR LEASE',
    featured: 1,
    is_published: 1,
    description: 'Prime ground-floor commercial and retail storefront boasting maximum pedestrian foot traffic along Bonifacio Global City. Double-height glass facade, grease trap provision, commercial exhaust shaft, 3-phase power, and dedicated alfresco seating entitlement.',
    primary_image: '/assets/images/realty-officespaces.png',
    images: [
      { id: 5, image_url: '/assets/images/realty-officespaces.png', caption: 'Storefront & High Foot-Traffic Corridor', is_primary: 1 },
      { id: 6, image_url: '/assets/images/realty-officespaces.png', caption: 'Commercial Interior Fit-out', is_primary: 0 }
    ]
  },
  {
    id: 4,
    title: 'The Grand Sapphire Luxury Sky Penthouse',
    slug: 'the-grand-sapphire-luxury-sky-penthouse',
    property_type: 'condominium',
    price: 68000000.0,
    price_display: '₱ 68,000,000',
    address: 'Emerald Avenue Cor. Sapphire Road',
    city: 'Pasig City',
    location: 'Ortigas Center, Pasig City',
    floor_area: 320.0,
    lot_area: 320.0,
    bedrooms: 4,
    bathrooms: 5,
    status: 'FOR SALE',
    featured: 1,
    is_published: 1,
    description: 'Ultra-luxury bi-level corner penthouse with panoramic 270-degree views of Metro Manila and the Sierra Madre mountains. Custom Italian marble finishes, gourmet chef kitchen with Gaggenau appliances, private plunge pool terrace, smart home automation, and 4 dedicated basement parking slots.',
    primary_image: '/assets/images/realty-condominium.png',
    images: [
      { id: 7, image_url: '/assets/images/realty-condominium.png', caption: 'Sky Penthouse Living Area', is_primary: 1 },
      { id: 8, image_url: '/assets/images/realty-condominium.png', caption: 'Master Suite & Skyline View', is_primary: 0 }
    ]
  },
  {
    id: 5,
    title: 'Valenzuela Industrial Park Modern Warehouse Complex',
    slug: 'valenzuela-industrial-park-modern-warehouse-complex',
    property_type: 'warehouse',
    price: 350000.0,
    price_display: '₱ 350,000 / mo',
    address: 'Paso de Blas Road',
    city: 'Valenzuela City',
    location: 'Valenzuela City, Metro Manila',
    floor_area: 2500.0,
    lot_area: 3000.0,
    bedrooms: null,
    bathrooms: 4,
    status: 'FOR LEASE',
    featured: 0,
    is_published: 1,
    description: 'Modern warehouse facility with wide container maneuverability, insulated roofing, fire sprinkler systems, dedicated administrative mezzanine office, and rapid access to NLEX Harbor Link.',
    primary_image: '/assets/images/realty-warehouse.png',
    images: [
      { id: 9, image_url: '/assets/images/realty-warehouse.png', caption: 'Warehouse Loading Bay & Gate', is_primary: 1 }
    ]
  },
  {
    id: 6,
    title: 'Makati CBD Prime Commercial Corner Space',
    slug: 'makati-cbd-prime-commercial-corner-space',
    property_type: 'commercial',
    price: 95000000.0,
    price_display: '₱ 95,000,000',
    address: 'Ayala Avenue Cor. Paseo de Roxas',
    city: 'Makati City',
    location: 'Makati CBD, Makati City',
    floor_area: 380.0,
    lot_area: 380.0,
    bedrooms: null,
    bathrooms: 3,
    status: 'FOR SALE',
    featured: 1,
    is_published: 1,
    description: 'Rare commercial property investment along the premier Ayala Avenue corridor. Suitable for private banking branches, luxury flagship showrooms, or corporate advisory firms.',
    primary_image: '/assets/images/realty-officespaces.png',
    images: [
      { id: 10, image_url: '/assets/images/realty-officespaces.png', caption: 'Makati CBD Commercial Showroom', is_primary: 1 }
    ]
  },
  {
    id: 7,
    title: 'Modern Luxury Executive Villa & Residence',
    slug: 'modern-luxury-executive-villa-residence',
    property_type: 'house',
    price: 125000000.0,
    price_display: '₱ 125,000,000',
    address: 'Valle Verde 5',
    city: 'Pasig City',
    location: 'Valle Verde, Pasig City',
    floor_area: 650.0,
    lot_area: 800.0,
    bedrooms: 5,
    bathrooms: 6,
    status: 'FOR SALE',
    featured: 1,
    is_published: 1,
    description: 'Exclusive gated community luxury home with private lap pool, smart security automation, landscaped courtyard, solar power array, and 6-car garage.',
    primary_image: '/assets/images/realty-condominium.png',
    images: [
      { id: 11, image_url: '/assets/images/realty-condominium.png', caption: 'Villa Facade & Poolside', is_primary: 1 }
    ]
  },
  {
    id: 8,
    title: 'One Corporate Centre Virtual Office & Boardroom Membership',
    slug: 'one-corporate-centre-virtual-office-boardroom-membership',
    property_type: 'virtual_office',
    price: 4500.0,
    price_display: '₱ 4,500 / mo',
    address: 'One Corporate Centre, Dona Julia Vargas Ave',
    city: 'Pasig City',
    location: 'Ortigas Center, Pasig City',
    floor_area: null,
    lot_area: null,
    bedrooms: null,
    bathrooms: null,
    status: 'FOR LEASE',
    featured: 1,
    is_published: 1,
    description: 'Prestigious Ortigas Center corporate business registration address, mail handling, call answering, and monthly high-tech boardroom access entitlements.',
    primary_image: '/assets/images/realty-officespaces.png',
    images: [
      { id: 12, image_url: '/assets/images/realty-officespaces.png', caption: 'Corporate Boardroom Access', is_primary: 1 }
    ]
  }
];

function filterFallbackListings({ type, search, city, status, featured, page, limit }) {
  const filtered = FALLBACK_LISTINGS.filter(item => {
    if (type && type !== 'all' && item.property_type.toLowerCase() !== type.toLowerCase()) return false;
    if (city && item.city.toLowerCase() !== city.toLowerCase()) return false;
    if (status && status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) return false;
    if (featured !== null && Number(item.featured) !== Number(featured)) return false;
    if (search) {
      const text = `${item.title} ${item.location} ${item.address} ${item.description}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const total = filtered.length;
  const offset = ((page || 1) - 1) * (limit || 24);
  const data = filtered.slice(offset, offset + (limit || 24));

  return {
    data,
    pagination: {
      page: page || 1,
      limit: limit || 24,
      total,
      total_pages: Math.ceil(total / (limit || 24))
    }
  };
}

/**
 * Hook to fetch property listings with filtering, search, and pagination.
 * @param {Object} options - Filter options { type, search, city, status, featured, page, limit }
 */
export function useListings(options = {}) {
  const {
    type = '',
    search = '',
    city = '',
    status = '',
    featured = null,
    page = 1,
    limit = 24
  } = options;

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (type && type !== 'all') params.set('type', type);
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (status && status !== 'all') params.set('status', status);
      if (featured !== null && featured !== undefined) params.set('featured', String(featured));
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));

      const queryString = params.toString();
      const url = queryString ? `/api/listings.php?${queryString}` : '/api/listings.php';

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (isMounted) {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setListings(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          // If live database returned empty, check fallback
          const fallback = filterFallbackListings({ type, search, city, status, featured, page, limit });
          setListings(fallback.data);
          setPagination(fallback.pagination);
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        // Resilient fallback on network/backend error
        const fallback = filterFallbackListings({ type, search, city, status, featured, page, limit });
        setListings(fallback.data);
        setPagination(fallback.pagination);
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [type, search, city, status, featured, page, limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, pagination, refetch: fetchListings };
}
