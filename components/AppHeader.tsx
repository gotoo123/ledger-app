import Link from "next/link";
import { Button } from "antd";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">自动记账</h1>
        <p className="app-subtitle">{subtitle ?? "个人实验性 Ledger App"}</p>
      </div>
      <nav className="app-nav">
        <Link href="/">
          <Button>首页</Button>
        </Link>
        <Link href="/statistics">
          <Button>统计</Button>
        </Link>
        <Link href="/tags">
          <Button>标签</Button>
        </Link>
      </nav>
    </header>
  );
}
