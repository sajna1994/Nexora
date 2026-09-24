import { useNavigate } from "react-router-dom";

type Props = {
  /** show the full NEXORA wordmark + tagline under the mark */
  full?: boolean;
  /** height in px for the logo mark */
  size?: number;
  /** clickable? defaults to true and navigates to / */
  clickable?: boolean;
  /** text color — set to "#fff" on dark backgrounds */
  color?: string;
  /** show the tagline "SHOP MORE · LIVE BETTER" */
  showTagline?: boolean;
};

export default function Logo({
  full = false,
  size = 40,
  clickable = true,
  color = "#171717",
  showTagline = false,
}: Props) {
  const nav = useNavigate();

  const handleClick = () => {
    if (clickable) nav("/");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: full ? "column" : "row",
        alignItems: "center",
        gap: full ? 12 : 10,
        cursor: clickable ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <img
        src="/logo.png"
        alt="NEXORA"
        style={{
          height: size,
          width: "auto",
          objectFit: "contain",
          // If using the full dark logo on light backgrounds, uncomment:
          // mixBlendMode: "multiply",
        }}
      />

      {full && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: size,
              fontWeight: 800,
              letterSpacing: size * 0.22,
              color,
              lineHeight: 1,
            }}
          >
            NEXORA
          </div>
          {showTagline && (
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                letterSpacing: 4,
                color: color === "#fff" ? "#c9a45c" : "#b8892d",
              }}
            >
              SHOP MORE · LIVE BETTER
            </div>
          )}
        </div>
      )}
    </div>
  );
}