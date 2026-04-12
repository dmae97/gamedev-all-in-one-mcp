# Implementation Plan: Roblox All-in-One MCP

**Branch**: `[001-roblox-all-in-one-mcp]` | **Date**: 2026-04-12 | **Spec**: `.specify/specs/001-roblox-all-in-one-mcp/spec.md`
**Input**: Feature specification from `/.specify/specs/001-roblox-all-in-one-mcp/spec.md`

**Note**: This plan follows the real Spec Kit structure initialized from the official `github/spec-kit` repository.

## Summary

Build a single local stdio MCP server that presents one stable tool surface while delegating real work to isolated Roblox and Blender connectors. Core workflows are tools-first so that the product remains usable across Claude Desktop, Cursor, Codex, Claude Code, OpenCode, and other MCP-compatible clients.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+  
**Primary Dependencies**: official MCP TypeScript SDK, Zod, local bridge/connector adapters for Roblox and Blender  
**Storage**: local files via explicit project manifest  
**Testing**: Node-based unit, integration, and contract tests  
**Target Platform**: local developer machines running supported MCP clients  
**Project Type**: local MCP server package  
**Performance Goals**: sub-second capability inspection, predictable multi-step workflow execution, no protocol corruption on stdout  
**Constraints**: stdio-first compatibility, tools-first API, no client-specific core dependency, explicit project state  
**Scale/Scope**: one package, two primary connectors, prompt-to-prototype Roblox workflows for MVP

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
.specify/specs/001-roblox-all-in-one-mcp/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
docs/
└── client-config/

src/
├── connectors/
│   ├── blender/
│   └── roblox/
├── orchestrators/
├── project/
├── server/
├── tools/
└── validation/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Use a single-package repository with one MCP server entry point and internal connector boundaries. This is the smallest structure that supports cross-client MCP compatibility without turning the project into a thin wrapper or a monolith.

## Architecture

### Top-Level Shape

```text
MCP Client
  -> local stdio MCP server
      -> server bootstrap and tool registration
      -> Roblox connector
      -> Blender connector
      -> orchestration layer
      -> project manifest/state layer
      -> validation and doctor layer
```

### Key Decisions

1. **stdio is the default transport**
   - This is the compatibility baseline across major MCP clients.

2. **Tools are the MVP-critical surface**
   - Resources and prompts can be added later, but the core product must work through tools alone.

3. **Connectors own platform-specific behavior**
   - Roblox and Blender details stay inside their connectors.
   - Orchestrators and tools consume stable internal contracts.

4. **Project manifest is mandatory**
   - The manifest tracks project root, detected capabilities, Roblox metadata, Blender asset mappings, and sync state.

### Planned Tool Families

1. Foundation
   - `project_init`
   - `doctor`
   - `inspect_project`
   - `list_capabilities`

2. Roblox
   - place inspection
   - scene/object creation
   - UI creation
   - script generation/patching
   - physics configuration

3. Blender
   - scene inspection
   - asset export
   - asset mapping/sync

4. Workflow
   - prompt-to-game-slice generation
   - iterative feature updates
   - validation and patch loops

## Implementation Phases

### Phase 1

- establish repository structure
- define manifest contract
- implement server bootstrap plan
- implement doctor/capabilities path

### Phase 2

- implement Roblox connector contract
- expose scene, UI, script, and physics tool families

### Phase 3

- implement Blender connector contract
- expose inspection/export/sync workflows

### Phase 4

- implement orchestration tools for prompt-to-prototype slices
- harden validation and iteration loops

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple internal modules in one MCP package | Roblox and Blender have different integration surfaces | A single flat tool layer would leak platform-specific behavior everywhere |
