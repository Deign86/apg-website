import React, { useState, useMemo } from 'react';
import { LISTINGS } from '../data';
import { Listing } from '../types';
import { Search, RotateCcw, Filter, ChevronDown, Check, Building2, MapPin, X, ArrowRight, CheckCircle2, Sparkles, Phone, Mail, Wifi, Tv, Users, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface ListingsSectionProps {
  onInquireClick: (propertyTitle: string, propertyId: string) => void;
}

export default function ListingsSection({ onInquireClick }: ListingsSectionProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [listingType, setListingType] = useState<string>('All'); // 'All', 'For Lease', 'For Sale'
  const [propertyType, setPropertyType] = useState<string>('All'); // Category pills
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [selectedFloorArea, setSelectedFloorArea] = useState<string>('All');
  const [selectedLotArea, setSelectedLotArea] = useState<string>('All');

  // Interactive Tabs (Rent/Lease vs Sale vs All)
  const [activeTypeTab, setActiveTypeTab] = useState<'All' | 'For Lease' | 'For Sale'>('All');

  // Sub-category filters
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Pagination page state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Listing Details Modal State
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Options lists
  const priceRangeOptions = ['All', 'Under P 50,000', 'P 50,000 - P 100,000', 'Over P 100,000', 'Under P 50M', 'Over P 50M'];
  const floorAreaOptions = ['All', 'Under 200 sqm', '200 - 500 sqm', 'Over 500 sqm'];
  const lotAreaOptions = ['All', 'N/A', 'Under 1,000 sqm', 'Over 1,000 sqm'];

  // Reset Filters function
  const handleReset = () => {
    setSearchQuery('');
    setCityQuery('');
    setListingType('All');
    setPropertyType('All');
    setSelectedCity('All');
    setSelectedPriceRange('All');
    setSelectedFloorArea('All');
    setSelectedLotArea('All');
    setActiveTypeTab('All');
    setActiveCategoryFilter('ALL');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredListings = useMemo(() => {
    return LISTINGS.filter((item) => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesDesc) return false;
      }

      // 1b. City Query (direct typing city like "Quezon City", "Pasig", "Novaliches")
      if (cityQuery.trim()) {
        const cQuery = cityQuery.trim().toLowerCase();
        const matchesCity = item.city.toLowerCase().includes(cQuery);
        const matchesLocation = item.location.toLowerCase().includes(cQuery);
        if (!matchesCity && !matchesLocation) return false;
      }

      // 2. Listing Type / Active Tab Filter
      const effectiveTypeFilter = listingType !== 'All' ? listingType : activeTypeTab;
      if (effectiveTypeFilter !== 'All') {
        if (item.type !== effectiveTypeFilter) return false;
      }

      // 3. Category Filter
      if (activeCategoryFilter && activeCategoryFilter.toUpperCase() !== 'ALL') {
        if (item.category.toUpperCase() !== activeCategoryFilter.toUpperCase()) return false;
      }

      // 4. Dropdown - Price Range
      if (selectedPriceRange !== 'All') {
        if (selectedPriceRange === 'Under P 50,000') {
          if (item.price >= 50000) return false;
        } else if (selectedPriceRange === 'P 50,000 - P 100,000') {
          if (item.price < 50000 || item.price > 100000) return false;
        } else if (selectedPriceRange === 'Over P 100,000') {
          if (item.price <= 100000) return false;
        } else if (selectedPriceRange === 'Under P 50M') {
          if (item.price >= 50000000) return false;
        } else if (selectedPriceRange === 'Over P 50M') {
          if (item.price < 50000000) return false;
        }
      }

      // 5. Dropdown - Floor Area
      if (selectedFloorArea !== 'All') {
        if (selectedFloorArea === 'Under 200 sqm') {
          if (item.floorArea >= 200) return false;
        } else if (selectedFloorArea === '200 - 500 sqm') {
          if (item.floorArea < 200 || item.floorArea > 500) return false;
        } else if (selectedFloorArea === 'Over 500 sqm') {
          if (item.floorArea <= 500) return false;
        }
      }

      // 6. Dropdown - Lot Area
      if (selectedLotArea !== 'All') {
        if (selectedLotArea === 'N/A') {
          if (item.lotArea !== 'N/A') return false;
        } else if (selectedLotArea === 'Under 1,000 sqm') {
          if (item.lotArea === 'N/A' || typeof item.lotArea === 'string' || item.lotArea >= 1000) return false;
        } else if (selectedLotArea === 'Over 1,000 sqm') {
          if (item.lotArea === 'N/A' || typeof item.lotArea === 'string' || item.lotArea <= 1000) return false;
        }
      }

      return true;
    });
  }, [searchQuery, cityQuery, activeTypeTab, activeCategoryFilter, selectedPriceRange, selectedFloorArea, selectedLotArea]);

  // Paginated listings (Mock paginating 5 per page)
  const itemsPerPage = 5;
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredListings, currentPage]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage) || 1;

  return (
    <div className="bg-transparent min-h-screen py-10 sm:py-16 px-4 sm:px-6 md:px-12" id="listings-section">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Title Section */}
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-3xl md:text-5xl font-sans font-light tracking-wide text-white uppercase">
            Property Listings
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
            <div className="h-[1.5px] w-24 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
          </div>
        </div>

        {/* Filters Panel exactly styled like Screenshot 3 */}
        <div className="bg-black/35 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-xl flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)]">
          {/* Main Search Bar & City Input Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* 1. Keyword Search Input */}
            <div className="relative md:col-span-7">
              <span className="absolute inset-y-0 left-4 flex items-center pr-2 pointer-events-none text-white/40">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search property name, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/45 text-white/90 border border-white/10 focus:border-[#c5a85c]/80 rounded-lg py-3.5 pl-12 pr-4 text-sm font-sans focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* 2. City / Location Direct Type Input */}
            <div className="relative md:col-span-5">
              <span className="absolute inset-y-0 left-4 flex items-center pr-2 pointer-events-none text-[#c5a85c]">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Type City / Location (e.g. Quezon City, Pasig, Novaliches)..."
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="w-full bg-black/45 text-white/90 border border-white/10 focus:border-[#c5a85c]/80 rounded-lg py-3.5 pl-11 pr-4 text-sm font-sans focus:outline-none transition-all shadow-inner placeholder:text-white/35"
              />
              {cityQuery && (
                <button
                  onClick={() => setCityQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* 1. Listing Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-white/50 uppercase font-bold">Listing Type</label>
              <select
                value={listingType}
                onChange={(e) => {
                  const val = e.target.value;
                  setListingType(val);
                  if (val === 'For Lease') setActiveTypeTab('For Lease');
                  else if (val === 'For Sale') setActiveTypeTab('For Sale');
                }}
                className="w-full bg-black/45 text-white/80 border border-white/10 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#c5a85c]/80 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="All" className="bg-[#0c0d12]">All Types</option>
                <option value="For Lease" className="bg-[#0c0d12]">For Lease</option>
                <option value="For Sale" className="bg-[#0c0d12]">For Sale</option>
              </select>
            </div>

            {/* 2. Property Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-white/50 uppercase font-bold">Property Type</label>
              <select
                value={activeCategoryFilter}
                onChange={(e) => {
                  setActiveCategoryFilter(e.target.value);
                  setPropertyType(e.target.value);
                }}
                className="w-full bg-black/45 text-white/80 border border-white/10 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#c5a85c]/80 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="All" className="bg-[#0c0d12]">All Categories</option>
                <option value="COMMERCIAL SPACE" className="bg-[#0c0d12]">COMMERCIAL SPACE</option>
                <option value="CONDO / HOUSE AND LOT" className="bg-[#0c0d12]">CONDO / HOUSE AND LOT</option>
                <option value="OFFICE SPACE" className="bg-[#0c0d12]">OFFICE SPACE</option>
                <option value="WAREHOUSE SPACE" className="bg-[#0c0d12]">WAREHOUSE SPACE</option>
                <option value="VIRTUAL OFFICE SPACE" className="bg-[#0c0d12]">VIRTUAL OFFICE SPACE</option>
              </select>
            </div>

            {/* 3. Price Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-white/50 uppercase font-bold">Price Range</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-black/45 text-white/80 border border-white/10 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#c5a85c]/80 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
              >
                {priceRangeOptions.map(opt => <option key={opt} value={opt} className="bg-[#0c0d12]">{opt}</option>)}
              </select>
            </div>

            {/* 4. Floor Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-white/50 uppercase font-bold">Floor Area</label>
              <select
                value={selectedFloorArea}
                onChange={(e) => setSelectedFloorArea(e.target.value)}
                className="w-full bg-black/45 text-white/80 border border-white/10 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#c5a85c]/80 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
              >
                {floorAreaOptions.map(opt => <option key={opt} value={opt} className="bg-[#0c0d12]">{opt}</option>)}
              </select>
            </div>

            {/* 5. Lot Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-white/50 uppercase font-bold">Lot Area</label>
              <select
                value={selectedLotArea}
                onChange={(e) => setSelectedLotArea(e.target.value)}
                className="w-full bg-black/45 text-white/80 border border-white/10 rounded-lg p-3 text-xs font-sans focus:outline-none focus:border-[#c5a85c]/80 transition-all appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}
              >
                {lotAreaOptions.map(opt => <option key={opt} value={opt} className="bg-[#0c0d12]">{opt}</option>)}
              </select>
            </div>

          </div>

          {/* Reset & Apply Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-2">
            <button
              onClick={handleReset}
              id="filters-reset-btn"
              className="flex items-center justify-center gap-2 border border-gray-800 hover:border-white/40 text-white/80 hover:text-white transition-all rounded-sm px-6 py-3 text-xs font-semibold tracking-wider uppercase font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
            <button
              id="filters-apply-btn"
              className="flex items-center justify-center gap-2 bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] transition-all rounded-sm px-8 py-3 text-xs font-bold tracking-widest uppercase"
            >
              <Filter className="w-4 h-4" />
              APPLY FILTERS
            </button>
          </div>

        </div>

        {/* Property Navigation & Category Filter Bar */}
        <div className="flex flex-col gap-3 w-full">
          {/* ALL TYPES / FOR RENT / LEASE / FOR SALE Primary Navigation Tab Bar */}
          <div className="grid grid-cols-3 border border-gray-900 bg-[#0a0b0f] p-1 rounded-sm w-full">
            <button
              onClick={() => { setActiveTypeTab('All'); setListingType('All'); setCurrentPage(1); }}
              className={`py-3.5 sm:py-4 text-center font-sans font-semibold text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-all rounded-sm cursor-pointer ${
                activeTypeTab === 'All'
                  ? 'bg-[#c5a85c] text-[#06070a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              ALL TYPES
            </button>
            <button
              onClick={() => { setActiveTypeTab('For Lease'); setListingType('For Lease'); setCurrentPage(1); }}
              className={`py-3.5 sm:py-4 text-center font-sans font-semibold text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-all rounded-sm cursor-pointer ${
                activeTypeTab === 'For Lease'
                  ? 'bg-[#c5a85c] text-[#06070a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              FOR RENT / LEASE
            </button>
            <button
              onClick={() => { setActiveTypeTab('For Sale'); setListingType('For Sale'); setCurrentPage(1); }}
              className={`py-3.5 sm:py-4 text-center font-sans font-semibold text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-all rounded-sm cursor-pointer ${
                activeTypeTab === 'For Sale'
                  ? 'bg-[#c5a85c] text-[#06070a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              FOR SALE
            </button>
          </div>

          {/* Sub-Category Filtering Pills */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 justify-center md:justify-start">
            {['ALL', 'COMMERCIAL SPACE', 'CONDO / HOUSE AND LOT', 'OFFICE SPACE', 'WAREHOUSE SPACE', 'VIRTUAL OFFICE SPACE'].map((cat) => {
              const isActive = activeCategoryFilter.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategoryFilter(cat);
                    setPropertyType(cat);
                    setCurrentPage(1);
                    if (cat === 'ALL') {
                      setActiveTypeTab('All');
                      setListingType('All');
                    } else if (cat === 'CONDO / HOUSE AND LOT' && listingType === 'For Lease') {
                      setActiveTypeTab('All');
                      setListingType('All');
                    }
                  }}
                  className={`border text-[10px] md:text-xs font-sans tracking-widest font-semibold px-4 sm:px-5 py-2.5 rounded-sm uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#181a24] border-[#c5a85c] text-[#c5a85c] shadow-[0_0_12px_rgba(197,168,92,0.25)]'
                      : 'bg-transparent border-gray-900 text-white/50 hover:text-white/90 hover:border-gray-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* VIRTUAL OFFICE PACKAGES SHOWCASE IN SERVICES TAB */}
        {activeCategoryFilter.toLowerCase() === 'virtual office space' && (
          <div className="bg-[#06070a]/80 border border-[#c5a85c]/30 rounded-2xl p-6 sm:p-8 flex flex-col gap-8 my-2 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a85c]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
              <span className="text-[#c5a85c] text-xs font-bold tracking-[0.3em] uppercase block">
                ORTIGAS CENTER VIRTUAL OFFICE SOLUTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-light text-white uppercase">
                Choose the Plan That Fits Your Business
              </h2>
              <div className="flex items-center justify-center gap-3 my-1">
                <div className="h-[1.5px] w-12 bg-gradient-to-l from-[#c5a85c] to-transparent" />
                <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] shrink-0" />
                <div className="h-[1.5px] w-12 bg-gradient-to-r from-[#c5a85c] to-transparent" />
              </div>
              <p className="text-white/70 text-xs sm:text-sm font-light">
                Elevate your business with Alpha Premier Realty's Virtual Office Solutions! Perfect for entrepreneurs, startups, and professionals.
              </p>
            </div>

            {/* 3 Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Package 1 */}
              <div className="bg-[#080a0f] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#c5a85c]/50 transition-all duration-300 group">
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-black border-b border-white/10">
                    <img 
                      src="/images/2,899.png" 
                      alt="Premier Access" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white bg-black/60 border border-white/20">
                      ₱2,899 / mo
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">PREMIER ACCESS</h3>
                      <p className="text-[#c5a85c] text-[11px] font-medium">Ideal for startups, freelancers & remote businesses</p>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80 font-light border-t border-white/5 pt-3">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Prestigious Business Address</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Coworking Access (1x/month)</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Mail Receiving & Handling</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Digital Signage Display</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Complimentary Internet</span></li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onInquireClick("Premier Access Virtual Office (PHP 2,899/mo)", "vo-2899")}
                    className="w-full py-2.5 bg-white/5 border border-[#c5a85c]/40 hover:bg-[#c5a85c] hover:text-[#06070a] text-[#c5a85c] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Inquire ₱2,899 Plan
                  </button>
                </div>
              </div>

              {/* Package 2 */}
              <div className="bg-[#0b0e17] border-2 border-[#c5a85c] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 group relative">
                <div className="bg-[#c5a85c] text-[#06070a] text-[9px] font-extrabold uppercase tracking-widest text-center py-0.5">
                  POPULAR CHOICE
                </div>
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-black border-b border-white/10">
                    <img 
                      src="/images/3,499.png" 
                      alt="Premier Prestige" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#06070a] bg-[#c5a85c] font-bold">
                      ₱3,499 / mo
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">PREMIER PRESTIGE</h3>
                      <p className="text-[#c5a85c] text-[11px] font-medium">Complete setup with Board Room privilege</p>
                    </div>
                    <ul className="space-y-2 text-xs text-white/90 font-light border-t border-white/5 pt-3">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Prestigious Business Address</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Coworking Space Access (1x/mo)</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Mail Handling & Reception</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Digital Signage & Free Water</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Admin Printing (10 pages)</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span className="font-semibold text-white">Board Room Access (1x/month)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onInquireClick("Premier Prestige Virtual Office (PHP 3,499/mo)", "vo-3499")}
                    className="w-full py-2.5 bg-[#c5a85c] text-[#06070a] hover:bg-[#e5cb80] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Inquire ₱3,499 Plan
                  </button>
                </div>
              </div>

              {/* Package 3 */}
              <div className="bg-[#080a0f] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#c5a85c]/50 transition-all duration-300 group">
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-black border-b border-white/10">
                    <img 
                      src="/images/4,999.png" 
                      alt="Alpha Premier" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white bg-black/60 border border-white/20">
                      ₱4,999 / mo
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">ALPHA PREMIER</h3>
                      <p className="text-[#c5a85c] text-[11px] font-medium">Top executive tier with CEO Office access</p>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80 font-light border-t border-white/5 pt-3">
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Prestigious Address & Front Desk</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Mail Receiving & Handling</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Internet & Free Drinking Water</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span>Admin Printing (10 pages/mo)</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span className="font-semibold text-white">Board Room Access (2x/month)</span></li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#c5a85c] shrink-0 mt-0.5" /><span className="font-semibold text-[#c5a85c]">CEO's Office Access for Client Signings</span></li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onInquireClick("Alpha Premier Virtual Office (PHP 4,999/mo)", "vo-4999")}
                    className="w-full py-2.5 bg-white/5 border border-[#c5a85c]/40 hover:bg-[#c5a85c] hover:text-[#06070a] text-[#c5a85c] text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Inquire ₱4,999 Plan
                  </button>
                </div>
              </div>

            </div>

            {/* Direct Contact strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <Sparkles className="w-4 h-4 text-[#c5a85c]" />
                <span>Ortigas Center Business Address • Flexible & Professional</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <a href="tel:09158889482" className="flex items-center gap-1.5 hover:text-[#c5a85c] transition-colors"><Phone className="w-3.5 h-3.5 text-[#c5a85c]" /> 0915 888 9482</a>
                <span>•</span>
                <a href="mailto:realty@alphapremiergroup.com" className="flex items-center gap-1.5 hover:text-[#c5a85c] transition-colors"><Mail className="w-3.5 h-3.5 text-[#c5a85c]" /> realty@alphapremiergroup.com</a>
              </div>
            </div>

          </div>
        )}

        {/* Listings List - Grid/Vertical Row Style matching Screenshot 3 */}
        <div className="flex flex-col gap-6 w-full">
          {paginatedListings.length > 0 ? (
            paginatedListings.map((property) => (
              <div
                key={property.id}
                onClick={() => {
                  setSelectedListing(property);
                  setActiveImageIndex(0);
                }}
                className="bg-black/35 backdrop-blur-md border border-white/10 hover:border-[#c5a85c]/50 hover:bg-black/55 hover:shadow-[0_12px_35px_rgba(197,168,92,0.06)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-500 rounded-lg overflow-hidden flex flex-col md:flex-row items-stretch cursor-pointer group relative"
              >
                
                {/* Property Image Column with Badges */}
                <div className="relative w-full md:w-[130px] lg:w-[150px] shrink-0 overflow-hidden h-[120px] md:h-auto">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-105"
                  />
                  
                  {/* Absolute badging inside image */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {property.isUpdated && (
                      <span className="bg-[#c5a85c] text-[#06070a] text-[7.5px] font-sans font-bold tracking-widest px-1.5 py-0.5 uppercase rounded-sm">
                        UPDATED
                      </span>
                    )}
                  </div>

                  {/* Multi-image indicator badge */}
                  {property.images && property.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white/90 text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-sm backdrop-blur-sm border border-white/20 flex items-center gap-1 shadow-md">
                      <Camera className="w-2.5 h-2.5 text-[#c5a85c]" /> {property.images.length}
                    </span>
                  )}
                </div>

                {/* Property Stats & Info Column */}
                <div className="p-3 flex-grow flex flex-col justify-between gap-2">
                  
                  <div>
                    {/* Header line info */}
                    <div className="flex items-center gap-2">
                      <span className="border border-[#c5a85c]/30 bg-[#c5a85c]/10 text-[#c5a85c] text-[8px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase rounded-md">
                        {property.type.toUpperCase()}
                      </span>
                      <span className="text-white/40 text-[9px] tracking-wider uppercase font-sans font-medium">
                        {property.category}
                      </span>
                    </div>

                    {/* Listing Title */}
                    <h3 className="text-white font-sans text-sm md:text-base font-semibold tracking-wide leading-snug mt-1 group-hover:text-[#c5a85c] transition-colors line-clamp-1">
                      {property.title}
                    </h3>

                    {/* Rent / Lease Price Tag */}
                    <p className="text-[#c5a85c] font-sans text-sm md:text-base font-bold tracking-wide mt-0.5">
                      ₱{property.price.toLocaleString()} {property.pricePeriod ? `/ ${property.pricePeriod}` : ''}
                    </p>

                    <div className="flex items-center gap-1 text-white/60 text-[11px] mt-0.5">
                      <MapPin className="w-3 h-3 text-[#c5a85c] shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>

                    {/* Short clean description snippet */}
                    <p className="text-white/50 text-[11px] font-light leading-relaxed line-clamp-1 mt-1">
                      {property.description}
                    </p>
                  </div>

                  {/* Specification Grid with clean background container */}
                  <div className="border-t border-white/10 pt-2 bg-black/20 rounded-md p-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-white/40 text-[8px] uppercase tracking-wider block font-sans font-semibold">Floor Area</span>
                      <span className="text-white/90 text-[10.5px] font-semibold tracking-wide block mt-0">{property.floorArea} sqm</span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[8px] uppercase tracking-wider block font-sans font-semibold">Lot Area</span>
                      <span className="text-white/90 text-[10.5px] font-semibold tracking-wide block mt-0">
                        {typeof property.lotArea === 'number' ? `${property.lotArea.toLocaleString()} sqm` : property.lotArea}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[8px] uppercase tracking-wider block font-sans font-semibold">
                        {property.floor ? 'Floor' : property.height ? 'Height' : 'Parking'}
                      </span>
                      <span className="text-white/90 text-[10.5px] font-semibold tracking-wide block mt-0">
                        {property.floor || property.height || property.parking || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[8px] uppercase tracking-wider block font-sans font-semibold">
                        {property.cusa ? 'CUSA' : property.loading ? 'Access' : 'Status'}
                      </span>
                      <span className="text-[#c5a85c] text-[10.5px] font-semibold tracking-wide block mt-0">
                        {property.cusa ? property.cusa : property.loading ? property.loading.split(' ')[0] + ' Truck' : 'Available'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            ))
          ) : (
            <div className="border border-dashed border-gray-800 p-16 text-center text-white/40 font-sans flex flex-col items-center justify-center gap-3">
              <Building2 className="w-12 h-12 text-[#c5a85c]/40" />
              <p className="text-sm font-semibold uppercase tracking-widest text-[#c5a85c]">No Properties Found</p>
              <p className="text-xs">Adjust your search filters or try resetting above.</p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination Grid matches Figma screenshot exactly `< 1 2 >` */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 border flex items-center justify-center rounded-sm transition-all text-xs font-mono ${
                currentPage === 1
                  ? 'border-gray-900 text-white/20 cursor-not-allowed'
                  : 'border-gray-800 text-white/70 hover:border-[#c5a85c] hover:text-[#c5a85c]'
              }`}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isCurrent = currentPage === p;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 border rounded-sm font-mono text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#c5a85c] border-[#c5a85c] text-[#06070a] font-bold'
                      : 'border-gray-800 text-white/70 hover:border-[#c5a85c]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 border flex items-center justify-center rounded-sm transition-all text-xs font-mono ${
                currentPage === totalPages
                  ? 'border-gray-900 text-white/20 cursor-not-allowed'
                  : 'border-gray-800 text-white/70 hover:border-[#c5a85c] hover:text-[#c5a85c]'
              }`}
            >
              &gt;
            </button>
          </div>
        )}

      </div>

      {/* Luxury Listing Detail Modal */}
      {selectedListing && (() => {
        const galleryImages = selectedListing.images && selectedListing.images.length > 0 
          ? selectedListing.images 
          : [selectedListing.image];
        
        const currentPhoto = galleryImages[activeImageIndex] || galleryImages[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0b0c10] border border-gray-800 rounded-lg max-w-5xl w-full max-h-[92vh] overflow-y-auto relative p-5 sm:p-8 flex flex-col gap-6 shadow-2xl">
              
              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 z-20 text-white/50 hover:text-white bg-black/60 p-2 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Multi-Image Interactive Gallery */}
              <div className="flex flex-col gap-3">
                <div className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-xl overflow-hidden bg-gray-950 border border-white/10 group shadow-lg">
                  <img
                    src={currentPhoto}
                    alt={`${selectedListing.title} - Image ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover filter brightness-95 contrast-105 transition-all duration-300"
                  />

                  {/* Previous / Next Arrow Controls */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white border border-white/20 hover:bg-[#c5a85c] hover:text-[#06070a] hover:border-[#c5a85c] transition-all flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm"
                        title="Previous Photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white border border-white/20 hover:bg-[#c5a85c] hover:text-[#06070a] hover:border-[#c5a85c] transition-all flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm"
                        title="Next Photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter Badge */}
                  <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-md text-white/90 text-xs font-mono font-semibold rounded-md border border-white/20 flex items-center gap-1.5 shadow-md">
                    <Camera className="w-3.5 h-3.5 text-[#c5a85c]" />
                    Photo {activeImageIndex + 1} of {galleryImages.length}
                  </span>

                  <span className="absolute top-3 left-3 px-3 py-1 bg-[#06070a]/80 backdrop-blur-md text-[#c5a85c] text-[10px] font-bold uppercase tracking-widest rounded-md border border-[#c5a85c]/40">
                    {selectedListing.category}
                  </span>
                </div>

                {/* Thumbnail Strip Selector */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx 
                            ? 'border-[#c5a85c] scale-105 shadow-[0_0_12px_rgba(197,168,92,0.6)]' 
                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Thumbnail ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Column Description */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="border border-[#c5a85c] text-[#c5a85c] text-[10px] font-sans font-bold tracking-widest px-3 py-1 uppercase rounded-sm">
                      {selectedListing.type}
                    </span>
                    <span className="text-white/40 text-xs tracking-wider uppercase font-sans">
                      {selectedListing.category}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl text-white font-sans font-semibold tracking-wide">
                    {selectedListing.title}
                  </h2>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[#c5a85c] text-2xl font-bold font-sans">
                      P {selectedListing.price.toLocaleString()}
                    </span>
                    {selectedListing.pricePeriod && (
                      <span className="text-white/60 text-sm font-medium">
                        / {selectedListing.pricePeriod}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 text-[#c5a85c] shrink-0" />
                    <span>{selectedListing.location}</span>
                  </div>

                  {/* Clean Lead Description */}
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed font-light mt-1 bg-white/5 p-4 rounded-xl border border-white/10">
                    {selectedListing.description}
                  </p>

                  {/* Features List with Checkmarks */}
                  {selectedListing.features && selectedListing.features.length > 0 && (
                    <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10 mt-1">
                      {selectedListing.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-white/90 text-xs sm:text-sm font-medium">
                          <span className="shrink-0">✅</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Perfect For Section */}
                  {selectedListing.suitableFor && selectedListing.suitableFor.length > 0 && (
                    <div className="bg-black/50 p-4 rounded-xl border border-[#c5a85c]/30 space-y-2.5 mt-1">
                      <div className="text-[#c5a85c] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="text-sm">📍</span> Perfect for:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedListing.suitableFor.map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-[#c5a85c]/15 text-white text-xs sm:text-sm font-medium rounded-lg border border-[#c5a85c]/40">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Stats & Terms Table */}
                  <div className="bg-[#07080b] p-4 sm:p-5 border border-white/10 rounded-xl space-y-4 mt-2">
                    <span className="text-[#c5a85c] text-[10px] font-bold tracking-widest uppercase block border-b border-white/10 pb-2">
                      PROPERTY SPECIFICATIONS & LEASE TERMS
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Floor Area</span>
                        <span className="text-white font-semibold text-sm block mt-0.5">{selectedListing.floorArea} sqm</span>
                      </div>
                      <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Lot Area</span>
                        <span className="text-white font-semibold text-sm block mt-0.5">
                          {typeof selectedListing.lotArea === 'number' ? `${selectedListing.lotArea.toLocaleString()} sqm` : selectedListing.lotArea}
                        </span>
                      </div>

                      {selectedListing.cusa && (
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">CUSA Rate</span>
                          <span className="text-[#c5a85c] font-semibold text-sm block mt-0.5">{selectedListing.cusa}</span>
                        </div>
                      )}

                      {selectedListing.terms && (
                        <div className="col-span-2 sm:col-span-3 bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Lease Terms</span>
                          <span className="text-white font-semibold text-xs block mt-0.5">{selectedListing.terms}</span>
                        </div>
                      )}

                      {selectedListing.floor && (
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Floor Level</span>
                          <span className="text-white font-semibold text-sm block mt-0.5">{selectedListing.floor}</span>
                        </div>
                      )}
                      {selectedListing.parking && (
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Parking</span>
                          <span className="text-white font-semibold text-sm block mt-0.5">{selectedListing.parking}</span>
                        </div>
                      )}
                      {selectedListing.height && (
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Height Clearance</span>
                          <span className="text-white font-semibold text-sm block mt-0.5">{selectedListing.height}</span>
                        </div>
                      )}
                      {selectedListing.loading && (
                        <div className="col-span-2 sm:col-span-3 bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Truck Access / Loading Docks</span>
                          <span className="text-white font-semibold text-xs block mt-0.5">{selectedListing.loading}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column Quick Inquiry */}
                <div className="md:col-span-5 bg-[#07080c] p-5 sm:p-6 border border-gray-800 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-[#c5a85c] text-xs font-bold tracking-widest uppercase text-center border-b border-gray-800 pb-3">
                      INQUIRE ABOUT THIS PROPERTY
                    </h4>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      onInquireClick(selectedListing.title, selectedListing.id);
                      setSelectedListing(null);
                    }} className="flex flex-col gap-3 mt-4">
                      <div>
                        <label className="text-[9px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Name</label>
                        <input required type="text" className="w-full bg-[#0b0c10] border border-gray-800 text-white text-xs p-2.5 rounded-md focus:outline-none focus:border-[#c5a85c]" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Company Name (Optional)</label>
                        <input type="text" className="w-full bg-[#0b0c10] border border-gray-800 text-white text-xs p-2.5 rounded-md focus:outline-none focus:border-[#c5a85c]" placeholder="Company or Business Name" />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Email Address</label>
                        <input required type="email" className="w-full bg-[#0b0c10] border border-gray-800 text-white text-xs p-2.5 rounded-md focus:outline-none focus:border-[#c5a85c]" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Viber Number</label>
                        <input required type="tel" className="w-full bg-[#0b0c10] border border-gray-800 text-white text-xs p-2.5 rounded-md focus:outline-none focus:border-[#c5a85c]" placeholder="0917 123 4567" />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Message</label>
                        <textarea rows={3} className="w-full bg-[#0b0c10] border border-gray-800 text-white text-xs p-2.5 rounded-md focus:outline-none focus:border-[#c5a85c] resize-none" defaultValue="" placeholder="Type your message here..." />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#c5a85c] hover:bg-[#e5cb80] text-[#06070a] text-xs font-bold tracking-wider uppercase py-3 mt-1 rounded-md transition-all cursor-pointer shadow-md"
                      >
                        SEND INQUIRY NOW
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* GLOBAL DIRECT VIEWING / FACEBOOK CAPTION FOOTER BANNER */}
              <div className="bg-[#06070a] border border-[#c5a85c]/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner mt-2">
                <div className="flex flex-col gap-1 text-center md:text-left">
                  <div className="text-xs font-bold text-[#c5a85c] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c5a85c]" /> 📩 Schedule your viewing today: Alpha Premier Realty
                  </div>
                  <div className="text-xs text-white/80 font-mono flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#c5a85c]" /> realty@alphapremiergroup.com</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#c5a85c]" /> 0927 555 5803 | 0915 888 9482 | 0921 217 4555</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onInquireClick(selectedListing.title, selectedListing.id);
                    setSelectedListing(null);
                  }}
                  className="px-5 py-2.5 bg-[#c5a85c] hover:bg-[#e5cb80] text-[#06070a] text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-all cursor-pointer shadow-md"
                >
                  Schedule Viewing
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
