import path from "node:path";
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

type Rgb = [number, number, number];

// Soft blue-teal palette — subtle, professional
const PALETTE: Rgb[] = [
  [56, 139, 253],  // blue-500
  [14, 165, 233],  // sky-500
  [6, 182, 212],   // cyan-500
  [14, 165, 233],  // sky-500
  [56, 139, 253],  // blue-500
];

function mix(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function sampleGradient(position: number): Rgb {
  const wrapped = ((position % 1) + 1) % 1;
  const scaled = wrapped * PALETTE.length;
  const index = Math.floor(scaled);
  const nextIndex = (index + 1) % PALETTE.length;
  const t = scaled - index;
  const a = PALETTE[index]!;
  const b = PALETTE[nextIndex]!;
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function fg([r, g, b]: Rgb, text: string) {
  return `\x1b[38;2;${r};${g};${b}m${text}${RESET}`;
}

function gradientText(text: string, phase: number) {
  const chars = [...text];
  const span = Math.max(chars.length - 1, 1);
  return chars
    .map((char, idx) => {
      if (char === " ") return char;
      return fg(sampleGradient(idx / span + phase), char);
    })
    .join("");
}

// ── Helpers ────────────────────────────────────────────────────────

function padRight(text: string, width: number) {
  const len = visibleLen(text);
  return text + " ".repeat(Math.max(0, width - len));
}

function visibleLen(text: string) {
  return text.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function projectLabel() {
  return path.basename(process.cwd()) || "session";
}

function shortDir(p: string) {
  const home = process.env.HOME ?? "";
  return p.startsWith(home) ? `~${p.slice(home.length)}` : p;
}

function formatModel(id: string) {
  // "anthropic/claude-sonnet-4-20250514" → "claude sonnet 4"
  const short = id
    .replace(/^[^/]+\//, "")
    .replace(/-202\d+/g, "")
    .replace(/-/g, " ");
  return short;
}

// ── Header renderer ────────────────────────────────────────────────

function renderBoxHeader(width: number, phase: number, modelId: string) {
  const dir = shortDir(process.cwd());
  const model = formatModel(modelId);

  const modelLine = `model:     ${model}`;
  const dirLine = `directory: ${dir}`;
  const piTag = ">_  Pi";

  // Content area width between "│ " and " │"
  const contentLen = Math.max(visibleLen(piTag), visibleLen(modelLine), visibleLen(dirLine));
  const inner = contentLen;
  // Total box width between corner chars
  const boxWidth = inner + 4;

  if (boxWidth < 20) {
    return ["", `  ${model}  ·  ${projectLabel()}`, `  ${dir}`, ""];
  }

  const topLeft = "╭";
  const topRight = "╮";
  const botLeft = "╰";
  const botRight = "╯";
  const hBar = "─";
  const vBar = "│";

  // Border rule spans between corner chars = boxWidth - 2
  const ruleLen = boxWidth - 2;
  const rule = hBar.repeat(ruleLen);

  const rawLines = [
    `${topLeft}${rule}${topRight}`,
    `${vBar} ${padRight(piTag, inner)} ${vBar}`,
    `${vBar} ${padRight("", inner)} ${vBar}`,
    `${vBar} ${padRight(modelLine, inner)} ${vBar}`,
    `${vBar} ${padRight(dirLine, inner)} ${vBar}`,
    `${botLeft}${rule}${botRight}`,
  ];

  const result: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]!;
    if (i === 0 || i === rawLines.length - 1) {
      const prefix = line[0]!;
      const suffix = line[line.length - 1]!;
      const middle = line.slice(1, -1);
      result.push(
        `${gradientText(prefix, phase)}${gradientText(middle, phase + 0.1)}${gradientText(suffix, phase + 0.2)}`,
      );
    } else {
      const v = gradientText(vBar, phase + i * 0.05);
      const content = line.slice(2, -2);
      const coloredContent =
        i === 1
          ? gradientText(content, phase + 0.15)
          : `${DIM}${content}${RESET}`;
      result.push(`${v} ${coloredContent} ${v}`);
    }
  }

  return ["", ...result, ""];
}

// ── Extension ──────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  let requestRender: (() => void) | undefined;
  let currentModelId = "no model selected";

  function installHeader(ctx: ExtensionContext) {
    ctx.ui.setHeader((tui) => {
      requestRender = () => tui.requestRender();
      return {
        render(width: number) {
          return renderBoxHeader(width, 0, currentModelId);
        },
      };
    });
  }

  pi.on("session_start", (_event, ctx) => {
    currentModelId = ctx.model?.id ?? "no model selected";
    if (!ctx.hasUI) return;
    installHeader(ctx);
  });

  pi.on("model_select", (event) => {
    currentModelId = event.model.id;
    requestRender?.();
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (ctx.hasUI) ctx.ui.setHeader(undefined);
  });

  pi.registerCommand("flow-title", {
    description: "Enable the blue flowing gradient session header",
    handler: async (_args, ctx) => {
      installHeader(ctx);
      ctx.ui.notify("Flow title enabled", "info");
    },
  });

  pi.registerCommand("flow-title-builtin", {
    description: "Restore pi's built-in header for this session",
    handler: async (_args, ctx) => {
      ctx.ui.setHeader(undefined);
      ctx.ui.notify("Built-in header restored", "info");
    },
  });
}
