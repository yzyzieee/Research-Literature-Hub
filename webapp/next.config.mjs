/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/**": ["../official/**", "../pending/**", "../index/**"],
  },
};

export default nextConfig;
