/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true,
  },
  redirects: async () => [
    {
      source: "/resume",
      destination: "/CV.pdf",
      permanent: false,
    },
  ],
};

module.exports = nextConfig;
