import path from "node:path";
import type { NextConfig } from "next";

// 공통 코드(packages/core)를 레포 루트에서 불러오기 위해 루트를 레포 최상위로 잡습니다.
const repoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
