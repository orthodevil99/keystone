import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0A0B0D",
          backgroundImage:
            "radial-gradient(700px 340px at 50% 0%, rgba(223,175,94,0.14), transparent 65%)",
          fontFamily: "serif",
        }}
      >
        {/* arch mark */}
        <svg width="120" height="140" viewBox="0 0 400 460" fill="none">
          <path
            d="M60 430V230C60 140 120 70 200 70s140 70 140 160v200"
            stroke="#2A2E33"
            strokeWidth="44"
          />
          <path
            d="M178 52h44l-8 52a14 14 0 0 1-14 12 14 14 0 0 1-14-12l-8-52Z"
            fill="#DFAF5E"
          />
        </svg>
        <div
          style={{
            marginTop: 32,
            fontSize: 84,
            color: "#F4F1E8",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
          }}
        >
          Keystone
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "rgba(244,241,232,0.55)",
            fontFamily: "sans-serif",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Milestone escrow on Arc · zero fees
        </div>
      </div>
    ),
    { ...size }
  );
}
