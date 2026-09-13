/**
 * Client-side mirror of the server capability map in api/config.php
 * (adminCapabilities()).
 *
 * IMPORTANT: This MUST stay in sync with adminCapabilities(). The server is
 * the enforcement point — this file is only for hiding UI controls that
 * would always 403. Never rely on it for security.
 */
export const CAPABILITIES = {
  blogs: ['superadmin', 'admin', 'editor'],
  content: ['superadmin', 'admin', 'editor'],
  services: ['superadmin', 'admin', 'editor'],
  listings: ['superadmin', 'admin'],
  careers: ['superadmin', 'admin', 'recruiter'],
  applicants: ['superadmin', 'admin', 'recruiter'],
  chat: ['superadmin', 'admin', 'recruiter'],
  delete: ['superadmin', 'admin'],
  users: ['superadmin'],
};

/** Returns true when `role` holds `capability`; false for unknown roles/capabilities. */
export function roleCan(role, capability) {
  const allowed = CAPABILITIES[capability];
  if (!Array.isArray(allowed)) return false;
  return allowed.includes(role);
}
