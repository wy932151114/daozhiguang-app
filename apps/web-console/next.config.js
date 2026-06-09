/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['echarts', 'echarts-for-react'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 生产模式下，前端直接访问后端API（同域名）
  // 开发模式下使用 rewrite 代理
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
