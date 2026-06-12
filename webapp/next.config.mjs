/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/**": ["../0*_*/**", "../90_pending/**", "../index/**"],
  },
};

export default nextConfig;
