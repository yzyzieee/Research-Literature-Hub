// Pluggable LLM provider layer. Switch providers by setting LLM_PROVIDER and
// the matching API key — no code change. DeepSeek is the default (text-only,
// cheapest). Gemini / OpenAI / Anthropic are wired and ready: add the key and
// flip LLM_PROVIDER to use them (the vision-capable ones can read PDFs better,
// a future enhancement to /api/extract).

export type Provider = "deepseek" | "gemini" | "openai" | "anthropic";

interface ProviderCfg {
  kind: "openai" | "anthropic"; // wire format
  url: string;
  key: string | undefined;
  model: string;
}

function resolve(): { provider: Provider; cfg: ProviderCfg } {
  const provider = (process.env.LLM_PROVIDER || "deepseek").toLowerCase() as Provider;
  switch (provider) {
    case "gemini":
      return {
        provider,
        cfg: {
          kind: "openai",
          url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          key: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        },
      };
    case "openai":
      return {
        provider,
        cfg: {
          kind: "openai",
          url: "https://api.openai.com/v1/chat/completions",
          key: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        },
      };
    case "anthropic":
      return {
        provider,
        cfg: {
          kind: "anthropic",
          url: "https://api.anthropic.com/v1/messages",
          key: process.env.ANTHROPIC_API_KEY,
          model: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
        },
      };
    case "deepseek":
    default:
      return {
        provider: "deepseek",
        cfg: {
          kind: "openai",
          url: "https://api.deepseek.com/chat/completions",
          key: process.env.DEEPSEEK_API_KEY,
          model: process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
        },
      };
  }
}

export function llmConfigured(): boolean {
  return Boolean(resolve().cfg.key);
}

export function llmProvider(): Provider {
  return resolve().provider;
}

interface ChatArgs {
  system: string;
  user: string;
  maxTokens: number;
  json?: boolean;
}

export async function llmChat({ system, user, maxTokens, json }: ChatArgs): Promise<string> {
  const { provider, cfg } = resolve();
  if (!cfg.key) {
    throw new Error(`No API key for LLM provider "${provider}" — set its key env var.`);
  }

  if (cfg.kind === "anthropic") {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: maxTokens,
        system,
        messages: [
          { role: "user", content: json ? `${user}\n\nReturn a single JSON object only.` : user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`${provider} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  }

  // openai-compatible (deepseek / gemini / openai)
  const body: Record<string, unknown> = {
    model: cfg.model,
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (json) body.response_format = { type: "json_object" };
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${provider} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Parse a JSON object from an LLM response, tolerating ```json code fences. */
export function parseJsonLoose<T = Record<string, unknown>>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  return JSON.parse(s) as T;
}
