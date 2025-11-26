/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/backadmin',
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig