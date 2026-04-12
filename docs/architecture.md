# Architecture

## Top-Level Shape

```text
MCP Client
  -> local stdio MCP server
      -> server bootstrap and tool registration
      -> Roblox connector
      -> Luau companion plugin/runtime layer
      -> Blender connector
      -> orchestration layer
      -> project manifest/state layer
      -> validation and doctor layer
```

## Why this shape

The public transport stays `stdio` because that is the strongest compatibility baseline across Claude Desktop, Cursor, Codex, Claude Code, OpenCode, and similar MCP clients.

Roblox and Blender are kept behind separate connectors because their local bridge models are different. Roblox is treated as a Studio MCP runtime target, but the differentiator in this project is that live Studio work is not modeled as a black box. We explicitly represent the Luau companion plugin/runtime layer that executes Studio-side actions, Luau code, and playtest/runtime feedback. Blender is treated as an addon plus local bridge target. The user still sees one MCP package.

## Runtime Boundaries

### MCP server

- owns public tool registration
- owns orchestration
- owns manifest/state reads and writes
- keeps stdout protocol-safe

### Roblox connector

- targets Roblox Studio MCP behavior
- normalizes Roblox-specific bridge/runtime details
- feeds scene, UI, script, and physics workflows

### Luau companion plugin/runtime layer

- owns Studio-side execution of Luau and object mutations
- owns playtest/runtime feedback loops, logs, and command dispatch
- creates a stable boundary between the stdio MCP shell and the in-Studio runtime
- is the main differentiation point beyond a normal Roblox-only MCP wrapper

### Blender connector

- targets the addon + local bridge model
- normalizes Blender scene inspection and export flows
- feeds asset export and sync workflows

### Manifest/state layer

- tracks project root
- tracks connector status
- tracks Luau runtime/plugin status
- tracks Blender asset mappings
- tracks sync state and template selection

## Current implementation checkpoint

The current repository has completed the setup and inspection milestone.

Implemented now:

- stdio MCP server bootstrap
- local manifest creation and inspection
- `project_init`
- `inspect_project`
- `doctor`
- `list_capabilities`
- Roblox connector detection
- Luau companion runtime detection
- live Luau runtime bridge server on loopback HTTP
- Luau runtime handshake and health probe path
- Blender connector detection
- minimal Studio plugin/runtime scaffold
- first Roblox mutation workflow via `roblox_run_code`
- Studio-side Luau consumer loop for long-poll command handling
- structured Roblox mutation workflow via `roblox_create_workspace_part`
- Studio-side plugin bootstrap entrypoint

Not implemented yet:

- production-ready Studio plugin packaging and bootstrap
- richer Roblox mutation workflows through the companion runtime
- Blender asset sync workflows

## Upstream Strategy

- Roblox runtime target: built-in Roblox Studio MCP
- Roblox architecture upgrade: explicit Luau companion plugin/runtime layer
- Roblox fast-track TypeScript reference: `drgost1/robloxstudio-mcp`
- Blender official direction: Blender Lab MCP Server
- Blender ecosystem reference: `ahujasid/blender-mcp`
- Blender implementation-pattern reference: `djeada/blender-mcp-server`
- Pattern source only: `CoplayDev/unity-mcp`
- Long-term backbone reference only: `loonghao/dcc-mcp-ipc`

## License Direction

This repository uses AGPL-3.0-only.

Permissive upstreams such as MIT and Apache-2.0 can be adapted carefully with attribution preserved. GPL and AGPL sources should be treated as deliberate copyleft decisions, not casual copy-paste sources.

## Open Source Quality Bar

This architecture is meant for public open-source release, so it has to optimize for setup clarity and predictable behavior.

- users get one stdio MCP entrypoint
- internal HTTP or TCP bridges stay hidden behind connectors
- client-specific config examples must be tested and documented
- local trust boundaries and security warnings must be explicit
- verification paths such as `doctor` are part of the architecture, not optional extras

## Near-Term Build Order

1. implement Luau runtime handshake and health checks
2. implement the Studio-side plugin that consumes the runtime bridge
3. expand Roblox workflow tools through the runtime boundary
4. implement Blender sync workflows after Roblox mutation paths are real
