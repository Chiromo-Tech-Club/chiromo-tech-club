import { WifiLoader } from "./WifiLoader";

export function PageLoader({ label = "loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-cream/90 backdrop-blur-sm"
    >
      <WifiLoader label={label} size="lg" />
    </div>
  );
}