import { useState } from 'react';
import { getPublicUrl, getTransformedUrl } from '@/lib/assetUrls';

export function PropertyImage({ asset, fallback = '/assets/images/placeholder.jpg', className, transform, alt }) {
  const [failed, setFailed] = useState(false);
  const src = !failed && asset ? getTransformedUrl(asset, transform) : fallback;
  return (
    <img
      src={src}
      alt={asset?.alt_text || alt || ''}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
