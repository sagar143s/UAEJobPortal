import { ImageResponse } from "next/og";

export const alt = "UAEJobPortal — Find Your Next Job in the UAE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#172033",
          color: "#f6f1e7",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#d7b56d" }}>UAEJOBPORTAL.ONLINE</div>
        <div style={{ fontSize: 68, marginTop: 24, lineHeight: 1.1 }}>Find Your Next Job in the UAE</div>
      </div>
    ),
    size,
  );
}
