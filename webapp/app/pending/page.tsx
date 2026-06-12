import { getCards, toMeta } from "@/lib/kb";
import CardListItem from "@/components/CardListItem";

export const dynamic = "force-static";

export default function PendingPage() {
  const pending = getCards().filter((c) => c.folder === "90_pending");
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

  return (
    <>
      <h1>审核队列 Review queue</h1>
      <p className="subtitle">
        90_pending 中的草稿卡。审核在 GitHub PR 中进行——LLM 只能辅助，人是最终学术裁判。
        {repo && (
          <>
            {" "}
            <a href={`https://github.com/${repo}/pulls`} target="_blank" rel="noreferrer">
              打开 PR 列表 ↗
            </a>
          </>
        )}
      </p>

      <div className="checklist">
        <b>审核清单 Review checklist</b>
        <ul>
          <li>元数据完整：标题双语、type/tags、论文卡的 citation key 与 Zotero 一致</li>
          <li>内容正确：公式、结论、引用出处可核对；双语内容一致</li>
          <li>知识价值：对课题组有复用价值，与已有卡片正确互链（[[…]]）</li>
          <li>通过后：审核人将 frontmatter 的 <code>status</code> 改为 <code>official</code> 并批准 PR；合并后 CI 自动晋升</li>
        </ul>
      </div>

      <h2>{pending.length} 张待审卡片</h2>
      <div className="card-grid">
        {pending.map((c) => (
          <CardListItem key={c.slug} card={toMeta(c)} />
        ))}
      </div>
      {pending.length === 0 && <p className="subtitle">队列为空 🎉</p>}
    </>
  );
}
