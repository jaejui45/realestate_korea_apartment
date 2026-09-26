import Link from "next/link";
import { Footer, Gnb, Page } from "@/components/Layout";

export default function NotFound() {
  return (
    <Page>
      <Gnb />
      <div className="px-4 py-24 text-center">
        <p className="text-lg font-bold">단지를 찾을 수 없어요</p>
        <Link href="/search" className="mt-4 inline-block text-primary">
          단지 검색하기
        </Link>
      </div>
      <Footer />
    </Page>
  );
}
