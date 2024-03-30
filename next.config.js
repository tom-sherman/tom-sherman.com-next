/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    {
      source: "/resume",
      destination: "/CV.pdf",
      permanent: false,
    },
    {
      source: "/meet",
      destination: "https://cal.com/tom-sherman",
      permanent: false,
    },
  ],
};

module.exports = nextConfig;
