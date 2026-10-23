import { ImageResponse } from "next/og";

export const alt = "Le Saphir — modern French restaurant in Paris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "90px", background: "#0b0b0a", color: "#f3efe5" }}><div style={{ color: "#c6a45e", fontSize: 34, letterSpacing: 8 }}>LE SAPHIR · PARIS</div><div style={{ display: "flex", flexDirection: "column", fontSize: 88, marginTop: 38, lineHeight: 1.05 }}><span>Modern French cooking,</span><span>at ours or at yours.</span></div><div style={{ fontSize: 28, marginTop: 48, color: "#c9c4b9" }}>Dining · Collection · Local delivery</div></div>);
}
