/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 파일 제공 설정
  async rewrites() {
    return [
      {
        source: '/downloads/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
  // 서버 컴포넌트에서 fs 모듈 사용 허용
  serverExternalPackages: ['fs-extra'],
};

module.exports = nextConfig; 