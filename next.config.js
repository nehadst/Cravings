/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.spoonacular.com', 'spoonacular.com'],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig; 