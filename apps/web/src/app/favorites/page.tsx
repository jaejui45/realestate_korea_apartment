import type { Metadata } from "next";
import { Footer, Gnb, Page } from "@/components/Layout";
import { FavoriteList } from "./FavoriteList";

export const metadata: Metadata = { title: "관심 단지" };

export default function FavoritesPage() {
  return (
    <Page>
      <Gnb />
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-[22px] font-bold">관심 단지</h1>
        <p className="mt-1 text-[13px] text-sub">이 브라우저에 저장돼요</p>
      </div>
      <FavoriteList />
      <Footer />
    </Page>
  );
}
