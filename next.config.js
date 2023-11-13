/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    {
      source: "/resume",
      destination: "/CV.pdf",
    },
  ],
};

module.exports = nextConfig;
