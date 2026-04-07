import withPWA from "next-pwa";

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // dev에서는 PWA 비활성화 → 빌드 속도 개선
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default pwa(nextConfig);
