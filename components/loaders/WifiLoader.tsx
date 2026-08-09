import "./wifi-loader.css";

export function WifiLoader({
  label = "loading",
  size = "md",
  className = "",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={`wifi-loader wifi-loader--${size} ${className}`}>
      <svg className="circle-outer" viewBox="0 0 86 86">
        <circle className="back" cx="43" cy="43" r="40" />
        <circle className="front" cx="43" cy="43" r="40" />
      </svg>
      <svg className="circle-middle" viewBox="0 0 60 60">
        <circle className="back" cx="30" cy="30" r="27" />
        <circle className="front" cx="30" cy="30" r="27" />
      </svg>
      <svg className="circle-inner" viewBox="0 0 34 34">
        <circle className="back" cx="17" cy="17" r="14" />
        <circle className="front" cx="17" cy="17" r="14" />
      </svg>
      <div className="wifi-loader-text" data-text={label} />
    </div>
  );
}