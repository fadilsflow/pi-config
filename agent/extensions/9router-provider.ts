/**
 * 9Router Provider Extension
 *
 * Connects pi agent to 9Router (https://github.com/decolua/9router) -
 * a FREE AI Router & Token Saver that provides access to 40+ AI providers
 * and 100+ models through an OpenAI-compatible endpoint.
 *
 * Features:
 * - Dynamic model discovery from 9Router's /v1/models endpoint
 * - OpenAI-compatible (openai-completions API)
 * - Configurable base URL and API key via environment variables
 * - Automatic reasoning detection for thinking/reasoner models
 * - Compat with common 9Router provider quirks
 *
 * Environment variables:
 *   PI_9ROUTER_BASE_URL  - Base URL (default: http://localhost:20128/v1)
 *   PI_9ROUTER_API_KEY   - API key from 9Router dashboard (optional for local)
 *   PI_9ROUTER_NAME      - Provider name in pi (default: "9router")
 *
 * Usage:
 *   1. Install 9Router: npm install -g 9router && 9router
 *   2. Restart pi (or /reload)
 *   3. Use /model to select "9router/<model-id>"
 */

import type {
  ExtensionAPI,
  ProviderModelConfig,
} from "@earendil-works/pi-coding-agent";

interface ModelEntry {
  id: string;
  object: string;
  owned_by: string;
}

interface ModelsResponse {
  object: string;
  data: ModelEntry[];
}

// Default models to use when fetch fails
const FALLBACK_MODELS: string[] = [
  "kr/claude-sonnet-4.5",
  "kr/claude-haiku-4.5",
  "kr/claude-sonnet-4.5-thinking",
  "kr/claude-haiku-4.5-thinking",
  "kr/deepseek-3.2",
  "kr/qwen3-coder-next",
  "kr/glm-5",
  "kr/MiniMax-M2.5",
  "bm/meta/llama-3.3-70b-instruct",
  "bm/meta/llama-3.1-8b-instruct",
  "bm/qwen3.6-27b",
  "bm/grok-4.20-fast",
  "nvidia/minimaxai/minimax-m2.7",
];

/**
 * Determine if a model ID suggests reasoning/thinking support.
 */
function hasReasoning(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return (
    id.includes("thinking") ||
    id.includes("reasoner") ||
    id.includes("deepseek-r1") ||
    id.endsWith("-thinking")
  );
}

/**
 * Determine if a model ID suggests vision/image support.
 */
function hasVision(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return (
    id.includes("vision") ||
    id.includes("vl") ||
    id.includes("multimodal") ||
    id.includes("image")
  );
}

/**
 * Generate a human-readable name from a model ID.
 */
function makeModelName(modelId: string): string {
  // Strip provider prefix for cleaner names
  const parts = modelId.split("/");
  const shortId = parts.length > 1 ? parts.slice(1).join("/") : modelId;

  // Capitalize and clean
  return shortId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Estimate context window based on model family.
 */
function estimateContextWindow(modelId: string): number {
  const id = modelId.toLowerCase();
  if (
    id.includes("claude") ||
    id.includes("sonnet") ||
    id.includes("haiku") ||
    id.includes("opus")
  ) {
    return 200000;
  }
  if (id.includes("deepseek") || id.includes("gemini") || id.includes("qwen")) {
    return 128000;
  }
  if (id.includes("grok")) {
    return 131072;
  }
  if (id.includes("llama")) {
    return 128000;
  }
  if (id.includes("glm")) {
    return 128000;
  }
  if (id.includes("mistral") || id.includes("mixtral")) {
    return 32000;
  }
  return 128000;
}

/**
 * Estimate max output tokens based on model family.
 */
function estimateMaxTokens(modelId: string): number {
  const id = modelId.toLowerCase();
  if (
    id.includes("claude") ||
    id.includes("sonnet") ||
    id.includes("haiku") ||
    id.includes("opus")
  ) {
    return 64000;
  }
  if (id.includes("deepseek")) {
    return 8192;
  }
  if (id.includes("qwen")) {
    return 8192;
  }
  if (id.includes("grok")) {
    return 131072;
  }
  if (
    id.includes("llama") ||
    id.includes("mistral") ||
    id.includes("mixtral")
  ) {
    return 4096;
  }
  return 16384;
}

function getApiKey(): string {
  return process.env.PI_9ROUTER_API_KEY || "";
}

export default async function (pi: ExtensionAPI) {
  const baseUrl =
    process.env.PI_9ROUTER_BASE_URL?.replace(/\/+$/, "") ||
    "http://localhost:20128/v1";
  const apiKey = getApiKey();
  const providerName = process.env.PI_9ROUTER_NAME || "9router";

  // Validate URL format
  const apiBase = baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`;

  // Fetch models from 9Router
  let modelIds: string[];
  try {
    const url = `${apiBase}/models`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const payload = (await response.json()) as ModelsResponse;
    modelIds = payload.data.map((m: ModelEntry) => m.id);

    if (modelIds.length === 0) {
      throw new Error("No models returned");
    }
  } catch (err) {
    console.warn(
      `[9router] Could not fetch models from ${apiBase}/models: ${err instanceof Error ? err.message : String(err)}`,
    );
    console.warn(
      `[9router] Using fallback model list (${FALLBACK_MODELS.length} models)`,
    );
    modelIds = FALLBACK_MODELS;
  }

  // Map to pi model configs
  const models: ProviderModelConfig[] = modelIds.map((id) => ({
    id,
    name: makeModelName(id),
    reasoning: hasReasoning(id),
    input: hasVision(id) ? ["text", "image"] : ["text"],
    contextWindow: estimateContextWindow(id),
    maxTokens: estimateMaxTokens(id),
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  }));

  // Register the provider
  pi.registerProvider(providerName, {
    name: "9Router",
    baseUrl: apiBase,
    apiKey: apiKey || "",
    api: "openai-completions",
    authHeader: !!apiKey,
    models,
    compat: {
      supportsDeveloperRole: false,
      supportsReasoningEffort: false,
      maxTokensField: "max_tokens",
    },
  });

  // Register a /9router command to show connection status
  pi.registerCommand("9router", {
    description: "Show 9Router connection status and model count",
    handler: async (_args, ctx) => {
      const base = apiBase;
      const keySet = !!apiKey;
      const count = modelIds.length;

      ctx.ui.notify(
        `9Router: ${base} | API key: ${keySet ? "✓" : "✗"} | ${count} models loaded`,
        "info",
      );
    },
  });
}
