import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GW Climbing Club Admin",
    short_name: "GWCC Admin",
    start_url: "/admin",
    display: "standalone",
    background_color: "#0f3559",
    theme_color: "#0f3559",
    icons: [
      {
        src: "/gwccsplashlogo-white.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/gwccsplashlogo-white.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
