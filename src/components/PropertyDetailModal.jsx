import React from 'react';
import { X, MapPin, Check } from 'lucide-react';

export const PropertyDetailModal = ({
  property,
  isOpen,
  onClose,
  onOpenInquire
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0E121B] border border-[#E2B857] w-full max-w-2xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#151A26] px-6 py-4 border-b border-[#2A303F] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#E2B857] uppercase block">
              ALPHA PREMIER REALTY PORTFOLIO
            </span>
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase">
              {property.title || property.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {(property.image || property.img_url || property.img) && (
            <div className="relative h-60 w-full overflow-hidden border border-[#2B3142]">
              <img
                src={property.image || property.img_url || property.img}
                alt={property.title || property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#E2B857] text-neutral-950 font-extrabold text-[10px] px-3 py-1 uppercase tracking-wider">
                {property.category || property.type || 'REALTY'}
              </div>
              <div className="absolute bottom-3 right-3 bg-neutral-950/90 text-[#E2B857] border border-[#E2B857] font-bold text-xs px-3 py-1">
                {typeof property.price === 'number' ? `₱${property.price.toLocaleString()}` : property.price}
                {property.pricePeriod ? ` / ${property.pricePeriod}` : ''}
              </div>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <MapPin className="w-4 h-4 text-[#E2B857] shrink-0" />
              <span className="font-semibold">{property.location}</span>
            </div>

            <p className="text-neutral-400 leading-relaxed">
              {property.description}
            </p>

            {property.features && property.features.length > 0 && (
              <div className="pt-2">
                <h4 className="font-bold text-[#E2B857] uppercase tracking-wider mb-2">
                  Key Features & Amenities:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#151A26] p-2 border border-[#232938]">
                      <Check className="w-3.5 h-3.5 text-[#E2B857]" />
                      <span className="text-neutral-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#232938] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-500">
              Ref: {(property.id || '').toUpperCase()} · Ortigas Center Desk
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenInquire(property.title || property.name);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#E2B857] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#cfa543]"
            >
              SCHEDULE PRIVATE VIEWING
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
