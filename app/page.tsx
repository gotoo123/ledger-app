import dayjs from "dayjs";
import { AppHeader } from "@/components/AppHeader";
import { LedgerHomeClient } from "@/components/LedgerHomeClient";

export default function Home() {
  return (
    <main className="page-shell">
      <AppHeader subtitle="今天先记一笔，后续再接入 AI 语音和图片识别" />
      <LedgerHomeClient initialDate={dayjs().format("YYYY-MM-DD")} />
    </main>
  );
}
