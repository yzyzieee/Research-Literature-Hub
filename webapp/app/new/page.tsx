import NewCardWizard from "@/components/NewCardWizard";

export default function NewCardPage() {
  return (
    <>
      <h1>新建卡片 New card</h1>
      <p className="subtitle">
        填写元数据 → （可选）Claude 起草双语正文 → 提交 PR 进入 90_pending 等待人工审核
      </p>
      <NewCardWizard />
    </>
  );
}
