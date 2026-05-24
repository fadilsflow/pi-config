/**
 * freemodel.dev — Custom Provider untuk pi agent
 *
 * Routes requests melalui cc.freemodel.dev proxy.
 *
 * Setup:
 *   1. Dapetin secret key dari cc.freemodel.dev
 *   2. Set di ~/.zshrc:
 *      export FREEMODEL_API_KEY=<secret-key>
 *      lalu jalankan: source ~/.zshrc
 *   3. /reload
 *   4. /model pake freemodel/<model>
 *      Contoh: /model freemodel/claude-sonnet-4-6
 *
 * Models akan auto-discover dari endpoint /v1/models
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const BASE_URL = "https://cc.freemodel.dev";

function getApiKey(): string | undefined {
  return process.env.FREEMODEL_API_KEY;
}

export default async function (pi: ExtensionAPI) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("freemodel: API key tidak ditemukan di settings.json.env.FREEMODEL_API_KEY");
  }
  // Fetch available models dari endpoint
  let models: any[] = [];
  try {
    const res = await fetch(`${BASE_URL}/v1/models`);
    const data = (await res.json()) as {
      data: Array<{ id: string; owned_by?: string }>;
    };

    models = data.data.map((m) => ({
      id: m.id,
      name: `${m.id} (FreeModel)`,
      reasoning: m.id.includes("sonnet") || m.id.includes("opus"),
      input: ["text", "image"] as ("text" | "image")[],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 200000,
      maxTokens: 8192,
    }));
  } catch (e) {
    console.error("freemodel: gagal fetch model list, pake fallback:", e);
  }

  // Fallback models kalau gagal fetch
  if (models.length === 0) {
    models = [
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6 (FreeModel)",
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 8192,
      },
      {
        id: "claude-opus-4-7",
        name: "Claude Opus 4.7 (FreeModel)",
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 8192,
      },
      {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6 (FreeModel)",
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 8192,
      },
      {
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5 (FreeModel)",
        reasoning: false,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 8192,
      },
    ];
  }

  pi.registerProvider("freemodel", {
    baseUrl: BASE_URL,
    apiKey: apiKey ?? "",
    api: "anthropic-messages",
    models,
  });
}
