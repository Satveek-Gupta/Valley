import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cabinet Valley 2026 — Official Student Fest",
    short_name: "Cabinet Valley",
    description:
      "Official event website for Cabinet Valley 2026: 3 days of high-stakes startup battles, 50+ Bay Area stalls, real-time trading simulations, and founder mentorship.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
