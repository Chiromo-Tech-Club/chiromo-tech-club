/**
 * Feature flags — plain booleans for now. If these need to vary per
 * environment or be toggled at runtime later, swap the values for reads
 * from config/env.ts without changing any call site.
 */
export const FEATURE_FLAGS = {
  enableBlog: false,
  enableDashboard: false,
  enableAdminPortal: false,
  enableCommandPalette: true,
} as const;
