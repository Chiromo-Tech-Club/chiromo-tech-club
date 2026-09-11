/** Canonical sizes for user-cropped uploads. */
export const IMAGE_CROP = {
  /** Event posters — Instagram portrait / 4:5 */
  eventPoster: {
    width: 1080,
    height: 1350,
    aspect: 1080 / 1350,
    label: "1080 × 1350 px",
    mime: "image/jpeg" as const,
    quality: 0.92,
  },
  /** Profile / membership photos — square */
  avatar: {
    width: 800,
    height: 800,
    aspect: 1,
    label: "800 × 800 px",
    mime: "image/jpeg" as const,
    quality: 0.92,
  },
} as const;

export type ImageCropPreset = keyof typeof IMAGE_CROP;
