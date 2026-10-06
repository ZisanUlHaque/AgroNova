/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Support standalone output for clean Docker container deployment
  output: "standalone",
  // Allow external API url
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_INTERNAL_URL || 'http://localhost:5000/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
