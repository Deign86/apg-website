import React, { useEffect, useId, useState } from 'react';
import {
  ExtrasJob,
  jobAsksPortfolio,
  jobRequiresPhoto,
  parsePortfolioLinks,
  photoFileError,
  portfolioLinksError,
} from '@/lib/applicantExtras';

/**
 * State for the per-opening extras (2x2 photo, portfolio links). Pass the selected job; when the job
 * changes the extras reset. `validate()` returns the first error (and marks the fields), `append()`
 * adds the values to the application FormData.
 */
export function useApplicantExtras(job?: ExtrasJob | null) {
  const requirePhoto = jobRequiresPhoto(job);
  const askPortfolio = jobAsksPortfolio(job);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [links, setLinks] = useState('');
  const [linksError, setLinksError] = useState<string | null>(null);

  useEffect(() => {
    setPhoto(null);
    setPhotoError(null);
    setLinks('');
    setLinksError(null);
  }, [requirePhoto, askPortfolio]);

  const choosePhoto = async (file: File | null) => {
    if (!file) {
      setPhoto(null);
      setPhotoError(requirePhoto ? 'A 2x2 photo is required for this position.' : null);
      return;
    }
    const problem = await photoFileError(file);
    setPhoto(problem ? null : file);
    setPhotoError(problem);
  };

  const changeLinks = (value: string) => {
    setLinks(value);
    if (linksError) setLinksError(portfolioLinksError(value));
  };

  /** First problem with the extras, or null. Also shows each field's error. */
  const validate = (): string | null => {
    let first: string | null = null;
    if (requirePhoto) {
      const problem = photoError ?? (photo ? null : 'A 2x2 photo is required for this position.');
      setPhotoError(problem);
      first = problem;
    }
    if (askPortfolio) {
      const problem = portfolioLinksError(links);
      setLinksError(problem);
      first ??= problem;
    }
    return first;
  };

  const append = (formData: FormData) => {
    if (requirePhoto && photo) formData.append('photo', photo);
    if (askPortfolio) formData.append('portfolioLinks', parsePortfolioLinks(links).join('\n'));
  };

  return { requirePhoto, askPortfolio, photo, photoError, choosePhoto, links, linksError, changeLinks, validate, append };
}

export type ApplicantExtras = ReturnType<typeof useApplicantExtras>;

interface FieldsProps {
  extras: ApplicantExtras;
  /** The host form's own classes, so the fields match its design. */
  labelClassName?: string;
  inputClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
}

/** Renders nothing unless the selected opening asks for a photo or portfolio links. */
export function ApplicantExtrasFields({ extras, labelClassName, inputClassName, hintClassName, errorClassName }: FieldsProps) {
  const id = useId();
  const photoId = `${id}-photo`;
  const linksId = `${id}-links`;
  if (!extras.requirePhoto && !extras.askPortfolio) return null;
  const errorCls = errorClassName ?? 'mt-1 text-xs text-red-400';
  const hintCls = hintClassName ?? 'mt-1 text-xs opacity-70';

  return (
    <>
      {extras.requirePhoto && (
        <div>
          <label htmlFor={photoId} className={labelClassName}>2x2 Photo *</label>
          <input
            id={photoId}
            name="photo"
            type="file"
            accept="image/jpeg,image/png"
            required
            aria-invalid={extras.photoError ? true : undefined}
            aria-describedby={`${photoId}-hint${extras.photoError ? ` ${photoId}-error` : ''}`}
            onChange={(e) => void extras.choosePhoto(e.target.files?.[0] ?? null)}
            className={inputClassName}
          />
          <p id={`${photoId}-hint`} className={hintCls}>
            A recent square 2x2 ID photo: JPG or PNG, at least 600×600 pixels, under 5MB.
          </p>
          {extras.photoError && <p id={`${photoId}-error`} role="alert" className={errorCls}>{extras.photoError}</p>}
        </div>
      )}
      {extras.askPortfolio && (
        <div>
          <label htmlFor={linksId} className={labelClassName}>Portfolio Links (optional)</label>
          <textarea
            id={linksId}
            name="portfolioLinks"
            rows={3}
            maxLength={2600}
            value={extras.links}
            placeholder={'https://github.com/yourname\nhttps://yourportfolio.com'}
            aria-invalid={extras.linksError ? true : undefined}
            aria-describedby={`${linksId}-hint${extras.linksError ? ` ${linksId}-error` : ''}`}
            onChange={(e) => extras.changeLinks(e.target.value)}
            className={inputClassName}
          />
          <p id={`${linksId}-hint`} className={hintCls}>Up to 5 links (GitHub, Behance, a personal site…), one per line.</p>
          {extras.linksError && <p id={`${linksId}-error`} role="alert" className={errorCls}>{extras.linksError}</p>}
        </div>
      )}
    </>
  );
}
