import { getCards } from "@/lib/kb";
import ExportBuilder from "@/components/ExportBuilder";

export const dynamic = "force-static";

export default function ExportPage() {
  const cards = getCards();
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return (
    <>
      <h1>导出给你的 LLM Export for your LLM</h1>
      <p className="subtitle">
        勾选卡片 → 打包成提示词 → 粘贴到每个成员自己的 ChatGPT / Claude / Kimi 里做文献调研。
        不消耗任何团队 API 额度。
      </p>
      <ExportBuilder cards={cards} repo={repo} />
    </>
  );
}
