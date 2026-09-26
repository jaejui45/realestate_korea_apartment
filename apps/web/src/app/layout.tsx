import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "부동산 필승 - 서울·경기 아파트 실거래가", template: "%s | 부동산 필승" },
  description: "국토교통부 실거래가 공개 데이터로 보는 서울·경기 아파트 매매 실거래가, 단지별 시세 추이.",
};

export const viewport: Viewport = { themeColor: "#7c3aed", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
