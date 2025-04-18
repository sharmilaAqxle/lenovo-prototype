/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable if you need to fetch from the Perplexity API domain
    async headers() {
      return [
        {
          // matching all API routes
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date" },
          ]
        }
      ];
    }
  };
  
  module.exports = nextConfig;