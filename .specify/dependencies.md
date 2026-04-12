# External Dependencies

## Core Runtime

- Node.js 20+
- `@modelcontextprotocol/sdk`
- `zod`

## External Reference Projects

### Roblox

- Runtime target: built-in Roblox Studio MCP
- Official reference: `Roblox/studio-rust-mcp-server`
- Fast-track reference: `drgost1/robloxstudio-mcp`

### Blender

- Official direction: Blender Lab MCP Server
- Ecosystem reference: `ahujasid/blender-mcp`
- Fast-track reference: `djeada/blender-mcp-server`

### Pattern Reference

- `CoplayDev/unity-mcp`
- `loonghao/dcc-mcp-ipc`

### Optional Future Companion

- `n4tivex/mcp-roblox-docs`

## Dependency Policy

- Prefer permissive licenses for direct code adaptation.
- Treat official or restrictive external integrations as compatibility targets unless vendoring terms are clearly acceptable.
- Keep docs/search companions out of the Phase 1 and Phase 2 critical path.
