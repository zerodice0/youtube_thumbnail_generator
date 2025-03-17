/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버 컴포넌트에서 fs 모듈 사용 허용
  serverExternalPackages: ['fs-extra'],
};

module.exports = nextConfig; 