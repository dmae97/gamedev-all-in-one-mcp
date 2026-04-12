# Implementation Plan: Roblox All-in-One MCP

**Branch**: `[main]` | **Date**: 2026-04-12 | **Spec**: `/specs/main/spec.md`
**Input**: Feature specification from `/specs/main/spec.md`

## Summary

Build one local stdio MCP package that presents a single tool surface for Roblox and Blender workflows while keeping platform-specific behavior inside dedicated connectors. Upgrade the Roblox side so it is explicitly modeled as `Roblox connector + Luau companion plugin/runtime layer`, not just a generic Roblox endpoint. Use built-in Roblox Studio MCP behavior as the runtime target, keep Blender on the addon + local bridge model, and let the repository act as the orchestration shell.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+  
**Primary Dependencies**: `@modelcontextprotocol/sdk`, `zod`  
**Storage**: local files via `.roblox-mcp/project.json`  
**Testing**: Node-based unit, integration, and contract tests  
**Target Platform**: local developer machines running MCP-compatible clients  
**Project Type**: local MCP server package  
**Performance Goals**: sub-second capability inspection, predictable connector routing, stdout remains protocol-safe  
**Constraints**: stdio-first compatibility, tools-first API, connector isolation, explicit project state, explicit Luau runtime boundary  
**Scale/Scope**: one package, three primary internal runtime surfaces (Roblox, Luau companion runtime, Blender), prompt-to-prototype Roblox workflows for the MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Cross-client compatibility first: PASS
- Connector isolation: PASS
- Deterministic tool contracts: PASS
- Explicit project state: PASS
- Validate before mutation: PASS

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── connector-contract.md
│   └── mcp-tool-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
docs/
├── architecture.md
└── client-config/

src/
├── connectors/
│   ├── blender/
│   ├── luau/
│   └── roblox/
├── orchestrators/
├── project/
├── server/
├── tools/
└── validation/

runtime/
└── roblox-studio-plugin/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Keep one package with a single MCP entrypoint and explicit connector boundaries. Add a dedicated Luau/runtime boundary and a Studio plugin scaffold so the Roblox side can evolve beyond a thin wrapper. This is the smallest structure that still supports cross-client compatibility, bridge-specific behavior, and future workflow orchestration.

## Architecture Decisions

### Public transport

- stdio is the only required public transport for the MVP.

### Roblox direction

- runtime target: built-in Roblox Studio MCP behavior
- differentiator: explicit Luau companion plugin/runtime layer for Studio-side actions, logs, and playtest feedback
- short-term TypeScript reference: `drgost1/robloxstudio-mcp`

### Blender direction

- runtime target: official addon + local bridge model
- ecosystem reference: `ahujasid/blender-mcp`
- implementation-pattern reference: `djeada/blender-mcp-server`

### Pattern-only references

- `CoplayDev/unity-mcp` for local/remote transport discipline and config UX
- `loonghao/dcc-mcp-ipc` for future multi-DCC backbone thinking, not current dependency

## Open Source Release Requirements

- tested client config snippets are required
- `doctor` and troubleshooting flow are required
- local trust and mutation warnings must be documented clearly
- internal bridge details must not leak into the basic install path
- vendoring must remain license-safe and attribution-safe

## License Strategy

- repository license: AGPL-3.0-only
- direct code adaptation priority: MIT, Apache-2.0
- GPL and AGPL upstreams are allowed only when their copyleft implications are intentionally accepted

## Phase Outputs

### Phase 0

- lock architecture direction
- record upstream references and license policy

### Phase 1

- formalize manifest and connector contracts
- formalize Luau companion runtime contract
- document quickstart and architecture
- keep docs and source layout aligned

### Phase 2

- add `project_init`
- add `inspect_project`
- implement richer Roblox connector contract
- implement Luau runtime bridge contract

## Current Checkpoint

The setup-and-inspection milestone is complete, and the first runtime bridge milestone is now in place.

Completed in code:

- `project_init`
- `inspect_project`
- manifest lifecycle support
- Roblox connector detection
- Luau runtime detection
- live Luau runtime bridge server
- Luau runtime handshake and health-check path
- Blender connector detection
- minimal Studio-side runtime scaffold
- first Roblox mutation workflow via `roblox_run_code`
- Studio-side Luau consumer loop
- structured Roblox mutation workflow via `roblox_create_workspace_part`

The next architecture focus is the transition from detection to execution:

1. production-ready Studio plugin packaging and bootstrap
2. richer Roblox mutation workflows through the Luau runtime boundary
3. Blender asset sync through the same manifest/runtime model

### Phase 3

- implement Blender connector contract and asset mapping flows

## Complexity Tracking

No constitution violations currently require justification.
