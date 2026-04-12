# Client Config Docs

This directory will hold tested config snippets for supported MCP clients.

Minimum target set:

- Claude Desktop
- Claude Code
- Cursor
- VS Code / Copilot agent mode
- OpenCode / Codex-style local config

Rules:

- every snippet must be tested against the current build
- every snippet must use the exact command users should run
- Windows and macOS differences must be documented when they matter
- invalid JSON examples are never acceptable

Current implemented docs:

- `claude-desktop.md`
- `claude-code.md`
- `cursor.md`
- `opencode.md`
- `vscode-copilot.md`
- `troubleshooting.md`

Current runtime-aware workflow docs:

- `troubleshooting.md` explains the live handshake, command polling, and first mutation workflows
