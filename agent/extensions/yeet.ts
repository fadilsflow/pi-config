import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const YEET_PROMPT = `Commit and push current repo changes.

- Run \`git add -A\`.
- Review staged diff, then write concise accurate commit message.
- Commit, then push current branch.
  - No upstream: push with upstream tracking.
  - No remotes: skip push.
- If pushed, print remote URL:
  - \`main\`: repo URL.
  - Other branches: PR URL into \`main\`.
  - Convert SSH GitHub remotes to HTTPS.`;

function buildPrompt(args: string) {
  const instructions = args.trim();
  return instructions ? `${YEET_PROMPT}\n\nUser instructions:\n${instructions}` : YEET_PROMPT;
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("yeet", {
    description: "Add, commit, and push current repo changes",
    handler: async (args, ctx) => {
      const prompt = buildPrompt(args ?? "");

      if (ctx.isIdle()) {
        pi.sendUserMessage(prompt);
        return;
      }

      pi.sendUserMessage(prompt, { deliverAs: "followUp" });
      ctx.ui.notify("Queued /yeet as follow-up", "info");
    },
  });
}
