# Audio Research Knowledge Base | 音频研究知识库

Collaborative knowledge base for audio / ANC / signal processing research. Cards are written in English; the web app UI can switch between English and Chinese.
面向音频 / 主动降噪 / 信号处理方向的协作研究知识库。知识卡统一用英文撰写；Web 应用界面可在中英文之间切换。

> **Formal rule | 正式规则**: PDFs stay in Google Drive; cards, templates, index and scripts stay in this repo.
> PDF 原文存放在 Google Drive；卡片、模板、索引与脚本存放在本仓库。

## Repository layout | 目录结构

```
00_templates/   Card templates 卡片模板 (paper / concept / algorithm / resource / synthesis)
official/       Approved cards 正式卡片 (flat; organised by domain/type in frontmatter)
pending/        Draft cards awaiting review 待审核草稿卡
bib/personal/   Each member's Better BibTeX export 个人 .bib 导出
bib/library.bib Merged bibliography (generated) 合并书目（自动生成）
index/          Generated index 自动生成的索引 (cards.json / INDEX.md)
scripts/        Maintenance scripts 维护脚本 (DOMAINS list lives in scripts/kblib.py)
docs/           Specs and guides 规范文档
webapp/         Team web app (Next.js) 团队协作 Web 应用
```

Cards are stored flat and **organised by `domain` (research field) and `type` via frontmatter** — the web app groups and filters by them. The controlled domain list lives in `scripts/kblib.py` (`DOMAINS`).

## Workflow | 工作流

1. **Prepare source | 准备资料** — upload PDF to Google Drive, normalize the file name.
2. **Create metadata | 整理元数据** — add the item to Zotero, verify the Better BibTeX citation key, export your personal `.bib` into `bib/personal/<yourname>.bib`.
3. **Draft card | 起草卡片** — copy a template from `00_templates/`, fill it in (LLM assistance welcome), save it into `90_pending/`, open a pull request.
4. **Review | 人工审核** — a teammate reviews the PR: metadata, content, knowledge value. LLM output is assistance only — a human is the final judge.
5. **Promote | 晋升正式库** — the reviewer sets `status: official` in the card. After merge, automation moves the card into its official folder.
6. **Maintain & reuse | 维护与复用** — CI regenerates `index/` and `bib/library.bib` on every merge. Browse and search via the web app.

## Scripts | 脚本

Requires Python 3.10+ and `pip install -r scripts/requirements.txt`.

| Script | Purpose |
|---|---|
| `python scripts/check_cards.py` | Validate all cards (frontmatter, enums, duplicates, broken links) 校验卡片 |
| `python scripts/update_index.py` | Regenerate `index/cards.json` + `index/INDEX.md` 重建索引 |
| `python scripts/merge_bibtex.py` | Merge `bib/personal/*.bib` into `bib/library.bib` 合并书目 |
| `python scripts/promote.py` | Move `status: official` cards out of `90_pending/` 晋升卡片 |

CI runs `check_cards.py` on every pull request and the other three after every merge to `main` — you normally never run `promote.py` by hand.

## Card spec | 卡片规范

See [docs/CARD_SPEC.md](docs/CARD_SPEC.md) for the frontmatter schema, naming rules and bilingual section layout.

## Web app | 协作应用

`webapp/` contains a Next.js app: browse / search the library, review queue, and a new-card wizard with DOI metadata lookup and LLM drafting. See [webapp/README.md](webapp/README.md) for setup and deployment.
