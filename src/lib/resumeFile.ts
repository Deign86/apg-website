// Client-side resume checks shared by the apply forms; api/applicants.php enforces the same 15 MB cap.
export const RESUME_MAX_BYTES = 15 * 1024 * 1024;
export const RESUME_TOO_LARGE = 'Resume file is too large. Please upload a smaller file (max 15MB).';
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

/** Error message for a resume the server would reject, or null when it is acceptable. */
export function resumeFileError(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!RESUME_EXTENSIONS.includes(ext)) return 'Please upload your resume as a PDF, DOC, or DOCX file.';
  if (file.size === 0) return 'The resume file is empty. Please choose another file.';
  if (file.size > RESUME_MAX_BYTES) return RESUME_TOO_LARGE;
  return null;
}
