/// <reference types="vite/client" />

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

// Merged directly into global scope (this file is a script, not a module,
// so `declare global {}` would be ignored).
interface Window {
  /** Bridge set by EnterpriseNavContext / subsidiary shells to navigate from embedded pages. */
  enterpriseNavigate?: (page: string) => void;
}
