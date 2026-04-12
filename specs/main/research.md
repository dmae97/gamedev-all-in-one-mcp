# Research: Roblox All-in-One MCP

## Decision: one stdio MCP shell with connector-specific local bridges

### Rationale

Across Roblox, Blender, and Unity MCP examples, the stable pattern is:

```text
AI client -> stdio MCP server -> local bridge/plugin/addon -> editor runtime
```

This is the safest cross-client baseline and matches the current repository scaffold.

### Alternatives considered

- Directly expose separate Roblox and Blender MCP servers to the user.
  - Rejected because the user still has to coordinate multiple tools manually.
- Build on a remote-first HTTP architecture.
  - Rejected because local stdio compatibility is more important for the MVP.

## Decision: Roblox built-in MCP is the runtime target

### Rationale

Roblox already ships the current product direction inside Studio. That makes built-in Roblox MCP behavior the right compatibility target.

For implementation speed, `drgost1/robloxstudio-mcp` is the best TypeScript pattern reference for tool grouping, local bridge flow, and config ergonomics.

### Alternatives considered

- Vendor the archived `Roblox/studio-rust-mcp-server`.
  - Rejected because it is archived and should be treated as reference material, not as the project base.

## Decision: Blender uses official direction as target, MIT community repos as implementation references

### Rationale

The official Blender Lab MCP direction confirms the right split: addon inside Blender, MCP server outside Blender.

For packaging and ecosystem conventions, `ahujasid/blender-mcp` is the strongest practical reference.
For explicit addon/server/job handling, `djeada/blender-mcp-server` is a good secondary reference.

### Alternatives considered

- Copy official Blender code into this repo immediately.
  - Rejected until vendoring terms are clearly safe.

## Decision: Unity is a pattern source, not an MVP integration target

### Rationale

`CoplayDev/unity-mcp` is valuable because it solves transport hardening, loopback-only security, and broad client configuration. Those patterns are reusable here even though Unity itself is not part of the MVP.

### Alternatives considered

- Add Unity support now.
  - Rejected because it expands scope before Roblox + Blender are working well.

## Decision: keep multi-DCC backbone ideas out of MVP dependencies

### Rationale

`loonghao/dcc-mcp-ipc` is the best long-term backbone reference for future growth, but introducing it as an active dependency now would slow Phase 1 and Phase 2 work.

### Alternatives considered

- Adopt a multi-DCC framework immediately.
  - Rejected because the MVP needs working Roblox + Blender connectors first.
