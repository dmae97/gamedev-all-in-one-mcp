# Research: Roblox All-in-One MCP

## Objective

Find existing MCP servers and bridge patterns that let this project move faster without inventing the wrong abstraction.

## Search Summary

The search focused on Roblox MCP, Blender MCP, Unity MCP, and adjacent engine/editor MCP projects.

The strongest result is that editor-integrated MCP servers all converge on the same shape:

1. AI client talks to one local MCP server over stdio.
2. The MCP server talks to a local editor or addon bridge.
3. The bridge talks to the actual editor runtime.

This validates the architecture already chosen for this repository.

## Upstream Candidates

### 0. Multi-DCC backbone candidate

- Repo: `loonghao/dcc-mcp-ipc`
- License: MIT
- Why it matters:
  - multi-DCC integration is the main problem this project eventually grows into
  - already models connectors, transport boundaries, service discovery, and connection pooling
  - useful as an architecture reference for how to grow beyond one engine or one editor
- What to reuse:
  - connector/backbone thinking
  - service and transport boundary discipline
  - future adapter expansion model
- What not to do:
  - do not pull it in as a hard dependency during the current Phase 1 and Phase 2 work

### 1. Roblox official reference

- Source of truth: Roblox Studio built-in MCP
- Open reference repo: `Roblox/studio-rust-mcp-server`
- License: MIT
- Status: built-in MCP is current target, open repo is archived but still valuable as a reference implementation
- Why it matters:
  - Roblox has already converged on the product shape we need to interoperate with
  - official Roblox-origin tool taxonomy
  - proven Studio plugin + local bridge + stdio MCP shape
  - confirms that broad MCP client compatibility is practical
- What to reuse:
  - bridge topology
  - playtest and console interaction ideas
  - setup and verification flow
- What not to do:
  - do not treat the archived repo as the long-term implementation base

### 2. Roblox community fast-track server

- Repo: `drgost1/robloxstudio-mcp`
- License: MIT
- Why it matters:
  - TypeScript-based
  - broad tool surface already organized around Roblox Studio workflows
  - explicit cross-client config examples
  - similar stack to this project, so patterns are easier to adapt quickly
- What to reuse:
  - tool grouping ideas
  - Node/TypeScript packaging shape
  - local HTTP bridge pattern
  - timeout and polling considerations

### 3. Blender official direction

- Source: Blender Foundation MCP server page and Blender Lab project
- Status: active official direction
- Why it matters:
  - validates Blender as a first-class MCP target
  - confirms addon + local bridge + MCP server split
  - confirms stdio MCP + local editor bridge is the right model
- Reuse policy:
  - treat as compatibility target and product reference
  - do not vendor code until exact source license and redistribution implications are confirmed cleanly for this repo

### 4. Blender community implementation reference

- Repo: `djeada/blender-mcp-server`
- License: MIT
- Why it matters:
  - clear addon + stdio MCP + local TCP bridge architecture
  - tool families are understandable and realistic
  - script library pattern is reusable
- What to reuse:
  - TCP bridge shape
  - addon/server separation
  - job/status model for longer Blender actions

### 4b. Blender de facto standard reference

- Repo: `ahujasid/blender-mcp`
- License: MIT
- Why it matters:
  - widely referenced in the Blender MCP ecosystem
  - clean Python packaging with a script entrypoint
  - useful reference for naming, addon split, and tool ergonomics
- What to reuse:
  - `uvx`-friendly packaging shape
  - tool naming and prompt guidance patterns
  - addon + MCP server separation

### 5. Unity MCP as pattern library

- Repo: `CoplayDev/unity-mcp`
- License: MIT
- Why it matters:
  - not a direct dependency for this product
  - excellent reference for editor bridge hardening
  - strong local-vs-remote transport discipline
  - strong multi-client install/config coverage
- What to reuse:
  - loopback-only local HTTP assumptions
  - transport and URL validation patterns
  - explicit security posture around local vs remote modes
  - mature tool-family grouping strategy

### 6. Roblox docs sidecar

- Repo: `n4tivex/mcp-roblox-docs`
- License: MIT
- Why it matters:
  - documentation MCP can be kept separate from editor mutation MCP
  - useful later for API lookup, Luau docs, Cloud docs, and DevForum search
- Role in this project:
  - optional sidecar or future bundled companion
  - not required for Phase 1 or connector implementation

## Repeated Architecture Pattern

Across Roblox, Blender, and Unity examples, the pattern that keeps showing up is:

```text
AI Client
  -> stdio MCP server
      -> local bridge or adapter
          -> editor plugin/addon/runtime
```

Where there is local HTTP, TCP, or polling, it is almost always only between the MCP server and the editor-side bridge, not between the AI client and the editor directly.

## Integration Decisions

### Roblox

Primary direction:
- treat built-in Roblox Studio MCP behavior as the primary compatibility target

Fast-track implementation reference:
- use `drgost1/robloxstudio-mcp` as the fastest Node/TypeScript reference when defining connector contracts and tool group boundaries

### Blender

Primary direction:
- follow the official Blender split model: addon inside Blender, MCP server outside Blender

Fast-track implementation reference:
- use `ahujasid/blender-mcp` and `djeada/blender-mcp-server` as complementary references
- favor `ahujasid/blender-mcp` for packaging and ecosystem conventions
- favor `djeada/blender-mcp-server` for explicit addon/server/job-model clarity

### Unity

Use only as a pattern source, not as a direct integration target for the MVP.

The most valuable reuse is security and transport discipline, especially loopback-only local endpoints.

## Licensing Decision

This project will use **MIT**, not Apache.

Reasons:

1. Most strong community MCP candidates found in this search are MIT.
2. MIT keeps reuse straightforward for packaging and examples.
3. Apache-specific patent language is not necessary for this project's current shape.

Practical rule:

- MIT upstream code or patterns can be adapted carefully with attribution preserved.
- Official Blender MCP code should not be copied into this repository until its exact source license and redistribution terms are confirmed.
- External bridges with AGPL or similar reciprocal terms should not be used as a base for core vendored code.

## Immediate Project Impact

These findings imply the next build steps should be:

1. formalize connector contracts around editor bridge patterns
2. keep stdio as the public transport
3. assume local bridge communication can be HTTP for Roblox and TCP for Blender
4. keep docs/search as separate or optional capability, not mixed into the core mutation path
5. treat multi-DCC growth as a later backbone concern, not an MVP dependency

## Recommendation

Move fast by treating this repository as the orchestration shell and treating external MCP implementations as references, not wholesale vendored foundations.

That keeps the product unified while avoiding license and maintenance traps.
