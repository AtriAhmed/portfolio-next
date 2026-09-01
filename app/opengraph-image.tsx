import { ImageResponse } from "next/og";

export const alt = "Mohamed Zayani — Journalist and Content Producer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a152d",
          color: "#f8f7f2",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ background: "#e7a349", height: "12px", width: "150px" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#e7a349", fontSize: 32, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>
            Portfolio
          </div>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -3, marginTop: 20 }}>Mohamed Zayani</div>
          <div style={{ color: "#c4cddd", fontSize: 38, marginTop: 18 }}>Journalist · Content Producer</div>
        </div>
        <div style={{ color: "#c4cddd", display: "flex", fontSize: 26, justifyContent: "space-between", width: "100%" }}>
          <span>Research · Reporting · Storytelling</span>
          <span>Portfolio</span>
        </div>
      </div>
    ),
    size,
  );
}
