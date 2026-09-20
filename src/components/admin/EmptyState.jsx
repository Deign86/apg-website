import { Database } from 'lucide-react';

export default function EmptyState({ icon: Icon = Database, title, subtitle, action }) {
  const IconCmp = typeof Icon === 'function' ? Icon : Database;
  return (
    <div className="admin-empty-state">
      <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
        <IconCmp className="size-5" aria-hidden="true" />
      </span>
      {title && <h3 className="text-balance">{title}</h3>}
      {subtitle && <p className="text-pretty">{typeof subtitle === 'string' ? subtitle : subtitle}</p>}
      {action}
    </div>
  );
}
