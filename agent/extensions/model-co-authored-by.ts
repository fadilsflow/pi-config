import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const COMMAND_TOOL_NAMES = new Set(["bash", "ctx_shell", "shell"]);
const GIT_COMMIT_RE = /\bgit\s+commit\b/g;
const TRAILER_PREFIX = ' -m "" -m ';

type QuoteMode = "single" | "double" | "ansi-c" | undefined;

interface CoAuthor {
  name: string;
  email: string;
}

const MODEL_CO_AUTHORS: Array<{ match: RegExp; coAuthor: CoAuthor }> = [
  {
    match: /\b(claude|anthropic)\b/i,
    coAuthor: {
      name: "claude",
      email: "noreply@anthropic.com",
    },
  },
  {
    match: /\b(codex|openai|gpt)\b/i,
    coAuthor: {
      name: "codex",
      email: "codex@users.noreply.github.com",
    },
  },
  {
    match: /\b(deepseek)\b/i,
    coAuthor: {
      name: "deepseek",
      email: "service@deepseek.com",
    },
  },
];

export default function modelCoAuthoredBy(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    const input = getCommandInput(event);
    if (!input) return;

    const coAuthor = getCoAuthor(ctx.model);
    if (!coAuthor) return;

    input.command = appendCoAuthorTrailer(input.command, coAuthor);
  });
}

function getCommandInput(event: { toolName: string; input: unknown }) {
  if (!COMMAND_TOOL_NAMES.has(event.toolName)) return undefined;
  if (!isRecord(event.input)) return undefined;
  if (typeof event.input.command !== "string") return undefined;

  return event.input as { command: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getCoAuthor(
  model: { provider?: string; id?: string; name?: string } | undefined,
): CoAuthor | undefined {
  if (!model) return undefined;

  const modelKey = [model.provider, model.id, model.name]
    .filter(Boolean)
    .join(" ");
  return MODEL_CO_AUTHORS.find(({ match }) => match.test(modelKey))?.coAuthor;
}

function appendCoAuthorTrailer(cmd: string, coAuthor: CoAuthor): string {
  const segment = findCommitSegment(cmd);
  if (!segment) return cmd;

  const trailer = `Co-authored-by: ${coAuthor.name} <${coAuthor.email}>`;
  const existingCommitCommand = cmd.slice(segment.start, segment.end);
  if (hasCoAuthorTrailer(existingCommitCommand, coAuthor)) return cmd;

  const trailerArgs = `${TRAILER_PREFIX}${ansiCString(trailer)}`;
  const afterCommit = cmd.slice(segment.end);
  const separatorPadding =
    afterCommit.startsWith("&&") || afterCommit.startsWith("||") ? " " : "";

  return `${cmd.slice(0, segment.end).trimEnd()}${trailerArgs}${separatorPadding}${afterCommit}`;
}

function findCommitSegment(
  cmd: string,
): { start: number; end: number } | undefined {
  GIT_COMMIT_RE.lastIndex = 0;

  for (const match of cmd.matchAll(GIT_COMMIT_RE)) {
    const start = match.index;
    const end = findSegmentEnd(cmd, start);
    const segment = cmd.slice(start, end).replace(/\\\n/g, " ");
    if (hasMessageFlag(segment)) return { start, end };
  }

  return undefined;
}

function hasMessageFlag(segment: string): boolean {
  return (
    /(?:^|\s)-[^\s-]*m\b/.test(segment) ||
    /(?:^|\s)--message(?:\s|=|$)/.test(segment)
  );
}

function hasCoAuthorTrailer(
  commitCommand: string,
  coAuthor: CoAuthor,
): boolean {
  const normalized = commitCommand.toLowerCase();
  return (
    normalized.includes("co-authored-by:") ||
    normalized.includes(coAuthor.email.toLowerCase())
  );
}

function findSegmentEnd(cmd: string, start: number): number {
  let quote: QuoteMode;

  for (let i = start; i < cmd.length; i += 1) {
    const char = cmd[i];
    const next = cmd[i + 1];

    if (char === "\\") {
      i += 1;
      continue;
    }

    if (quote === "single") {
      if (char === "'") quote = undefined;
      continue;
    }

    if (quote === "ansi-c") {
      if (char === "'") quote = undefined;
      continue;
    }

    if (quote === "double") {
      if (char === '"') quote = undefined;
      continue;
    }

    if (char === "$" && next === "'") {
      quote = "ansi-c";
      i += 1;
      continue;
    }

    if (char === "'") {
      quote = "single";
      continue;
    }

    if (char === '"') {
      quote = "double";
      continue;
    }

    if (
      char === ";" ||
      char === "\n" ||
      (char === "&" && next === "&") ||
      (char === "|" && next === "|")
    ) {
      return i;
    }
  }

  return cmd.length;
}

function ansiCString(value: string): string {
  return `$'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
}
