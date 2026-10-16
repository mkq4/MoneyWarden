import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyWarden",
    short_name: "MoneyWarden",
    description: "Ваши деньги под контролем: расходы, доходы и статистика",
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#f7f7f8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
