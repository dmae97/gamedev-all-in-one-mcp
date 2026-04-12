# Roblox All-in-One MCP

![License: AGPL-3.0-only](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)
![Node 20+](https://img.shields.io/badge/node-20%2B-43853d.svg)

Open-source MCP for building Roblox games with one public MCP surface, a Luau companion runtime inside Studio, and Blender asset workflows behind the same package.

## Quick start

```bash
npm install
npm run build
```

Then register the built server in your MCP client with a stdio entry pointing to `dist/index.js`.

Current foundation tools:

- `doctor`
- `list_capabilities`
- `project_init`
- `inspect_project`
- `roblox_run_code`

## What makes this different

Most MCP projects in this space do one thing well.

- Roblox-only MCP
- Blender-only MCP
- Blender to Roblox asset upload
- multi-DCC experiments for other engines

This repository is aiming at the missing combination:

- one local stdio MCP package
- Roblox game-building workflows
- explicit Luau companion plugin/runtime layer
- Blender asset pipeline integration
- cross-client setup for Claude Desktop, Cursor, Claude Code, OpenCode, Codex-style clients, and similar MCP tools

## Current architecture

```text
MCP Client
  -> local stdio MCP server
      -> Roblox connector
      -> Luau companion plugin/runtime layer
      -> Blender connector
      -> orchestration layer
      -> project manifest/state
      -> validation and doctor layer
```

The important bit is the Luau boundary.

This project is not treating Roblox Studio like a black box. It is explicitly reserving a Studio-side runtime layer for Luau execution, playtest control, logs, and mutation workflows.

## Status

This repository is in the first public architecture phase.

Already in place:

- MCP server bootstrap
- `doctor`
- `list_capabilities`
- `project_init`
- `inspect_project`
- `roblox_run_code`
- manifest path detection
- live Luau runtime bridge server
- Luau runtime handshake and health check path
- first Roblox mutation workflow through the Luau boundary
- architecture and license direction

Planned for the next week:

1. production-ready Studio-side plugin packaging
2. richer Roblox mutation workflows beyond `roblox_run_code`
3. Blender asset sync path
4. more client config coverage

Expected time for the current milestone: about 1 week.

## Upstream strategy

- Roblox runtime target: built-in Roblox Studio MCP
- Roblox product/reference sources: `drgost1/robloxstudio-mcp`, Roblox official Studio MCP docs
- Blender references: `ahujasid/blender-mcp`, `djeada/blender-mcp-server`
- pattern references only: `CoplayDev/unity-mcp`, `loonghao/dcc-mcp-ipc`

This repository is opinionated about one thing: the public UX must feel like one MCP, not a pile of disconnected servers.

## Open source and license

This project is licensed under **AGPL-3.0-only**.

That is intentional.

- improvements to the server should remain open
- networked or hosted variants should not silently become closed forks
- strong copyleft is acceptable for this project's goals

For source reuse inside this repository:

- direct code adaptation is fine from `MIT` and `Apache-2.0` upstreams
- `GPL` and `AGPL` projects are primarily reference material unless we intentionally accept full copyleft consequences for the derived code

## Docs

- `process.md`
- `docs/architecture.md`
- `docs/open-source-quality.md`
- `docs/client-config/README.md`

## Links

- Docs: `docs/architecture.md`
