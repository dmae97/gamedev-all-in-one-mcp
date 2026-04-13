# Local Control Plane Plan

1. Add local control-plane entrypoint and server shell.
   Verify: loopback-only web server starts.

2. Add env/config loading for providers and pluggable skills/MCP registry.
   Verify: status API returns parsed provider/config data.

3. Add provider adapters for OpenAI API, Anthropic API, Codex CLI, Claude Code CLI.
   Verify: available providers are listed correctly and unsupported ones return clear errors.

4. Add status and job-launch JSON APIs plus minimal local HTML UI.
   Verify: browser page renders and can launch a simple job.

5. Add automated tests for status API and local config/provider surfacing.
   Verify: `npm test` passes.
