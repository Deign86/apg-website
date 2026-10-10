interface AlphaPremierLogoProps {
  className?: string;
}

export default function AlphaPremierLogo({ className = "h-16" }: AlphaPremierLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} id="alpha-premier-logo">
      <img 
        src="/images/realty-banner-logo.webp" 
        alt="Alpha Premier Realty" 
        className="w-full h-full object-contain filter drop-shadow-[0_4px_25px_rgba(197,168,92,0.3)]" 
      />
    </div>
  );
}
