import React from 'react';
import { PropertyItem } from '../types';
import { X, MapPin, Tag, Check, Calendar, Phone, Mail } from 'lucide-react';

interface PropertyDetailModalProps {
  property: PropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInquire: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onOpenInquire
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0D12] border border-[#D4AF37] w-full max-w-2xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col rounded-2xl">
        
        {/* Header */}
        <div className="bg-black px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#D4AF37] uppercase block">
              ALPHA PREMIER REALTY PORTFOLIO
            </span>
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase">
              {property.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          <div className="relative h-60 w-full overflow-hidden border border-neutral-800 rounded-xl">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#D4AF37] text-neutral-950 font-extrabold text-[10px] px-3 py-1 uppercase tracking-wider rounded">
              {property.category}
            </div>
            <div className="absolute bottom-3 right-3 bg-neutral-950/90 text-[#D4AF37] border border-[#D4AF37] font-bold text-xs px-3 py-1 rounded">
              {property.price}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="font-semibold">{property.location}</span>
            </div>

            <p className="text-neutral-400 leading-relaxed">
              {property.description}
            </p>

            <div className="pt-2">
              <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                Key Features & Amenities:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-black p-2 border border-neutral-800 rounded-lg">
                    <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-neutral-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-500">
              Ref: {property.id.toUpperCase()} · Ortigas Center Desk
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenInquire();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all rounded-lg"
            >
              SCHEDULE PRIVATE VIEWING
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
