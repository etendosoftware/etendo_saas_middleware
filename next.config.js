/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  // output: "standalone", // Esta línea ha sido eliminada o comentada
};

module.exports = nextConfig;