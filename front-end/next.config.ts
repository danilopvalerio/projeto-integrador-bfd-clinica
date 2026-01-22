import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite carregar imagens de qualquer domínio HTTPS (Útil se usar S3, Cloudinary, etc)
      },
      {
        protocol: "http",
        hostname: "localhost", // Permite carregar imagens locais em desenvolvimento
      },
    ],
  },
};

export default nextConfig;
