export interface Community {
  slug: string;
  number: string;
  name: string;
  description: string;
  /** Raw inner-SVG path/shape markup, rendered inside a shared 24x24 viewBox icon. */
  iconPaths: string;
}
