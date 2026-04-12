# Feature Specification: Roblox All-in-One MCP

**Feature Branch**: `[main]`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Design the architecture and update the docs for a Roblox all-in-one MCP that combines Roblox and Blender workflows under one MCP package, with an explicit Luau/Lua companion runtime side for deeper differentiation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify the local toolchain (Priority: P1)

As a builder using an MCP-compatible client, I want to install one MCP package and verify that my local Roblox and Blender prerequisites are detected, so that I can start from one known-good entry point.

**Why this priority**: If setup and environment validation are confusing, the product fails before any game-building value appears.

**Independent Test**: Register the server in one supported client, call `doctor`, and confirm that the report explains which connectors are available and what is missing.

**Acceptance Scenarios**:

1. **Given** the package is installed, **When** the user calls `doctor`, **Then** the server returns a structured capability report for Roblox, Blender, and manifest state.
2. **Given** the machine only partially satisfies prerequisites, **When** the user calls `doctor`, **Then** the missing parts are explained clearly enough to continue setup.

---

### User Story 2 - Build a Roblox gameplay slice from prompts and Luau runtime actions (Priority: P1)

As a Roblox creator, I want to generate and iterate on a small gameplay slice from prompts and runtime-side Luau actions, so that I can move from idea to playable prototype without manually wiring low-level editor actions first.

**Why this priority**: This is the core promise of the product.

**Independent Test**: Call one workflow tool to create or update a small Roblox prototype containing scene structure, UI, scripts, and physics configuration.

**Acceptance Scenarios**:

1. **Given** a valid Roblox runtime target, **When** the user requests an obby or arena slice, **Then** the system creates or updates the Roblox project in the requested direction.
2. **Given** an existing project, **When** the user asks for iterative changes to UI, scripts, or physics, **Then** the system updates the right systems without full regeneration.
3. **Given** the Luau companion runtime is available, **When** the workflow needs in-Studio mutation, runtime logs, or playtest feedback, **Then** the MCP package routes those actions through the Luau companion layer rather than treating Studio as an opaque endpoint.

---

### User Story 3 - Bring Blender assets into the same workflow (Priority: P2)

As a creator who uses Blender, I want exported assets to flow into the same Roblox build workflow, so that environment and gameplay iteration feel like one product.

**Why this priority**: Blender integration is a differentiator, but the product still has value before full asset round-tripping is complete.

**Independent Test**: Inspect a Blender scene, export an asset bundle, and record it in project state for downstream Roblox sync.

**Acceptance Scenarios**:

1. **Given** Blender integration is available, **When** the user exports an asset bundle, **Then** the package records that bundle in the project manifest.
2. **Given** an existing manifest with Blender assets, **When** the user triggers sync, **Then** the asset mapping is updated through the unified server path.

### Edge Cases

- Roblox is available but Blender is not.
- Blender is available but Roblox Studio is not.
- Roblox Studio exists but the Luau companion runtime/plugin is not connected.
- The MCP client supports tools but not prompts or resources.
- The local runtime target exists but the connector version does not match the expected contract.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST run as a single local MCP package over stdio.
- **FR-002**: The system MUST expose one unified tool surface across Roblox, Blender, and orchestration workflows.
- **FR-003**: The system MUST provide `doctor` and `list_capabilities` as first-class foundation tools.
- **FR-004**: The system MUST isolate Roblox and Blender behavior behind explicit connectors.
- **FR-004a**: The system MUST model the Luau companion plugin/runtime as an explicit internal layer rather than an implicit side effect.
- **FR-005**: The system MUST maintain explicit local project state for Roblox metadata, Blender asset mappings, and sync state.
- **FR-005a**: The system MUST track Luau companion runtime availability and command-routing state in project/runtime state.
- **FR-006**: The system MUST keep stdout protocol-safe.
- **FR-007**: The system MUST remain usable in tools-only MCP clients.
- **FR-008**: The MVP MUST target Roblox game-slice generation before broader multi-DCC ambitions.

### Key Entities *(include if feature involves data)*

- **Project Manifest**: Local source of truth for environment, asset mappings, and sync state.
- **Connector Capability Report**: Structured detection output for Roblox and Blender availability.
- **Luau Runtime Status**: Structured detection output for the companion plugin/runtime availability inside Roblox Studio.
- **Game Slice Request**: A prompt-driven request to create or patch a small Roblox feature slice.
- **Asset Bundle Mapping**: The relationship between Blender-exported assets and Roblox project targets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can install and register the package in at least five MCP-compatible clients using documented stdio configuration.
- **SC-002**: A user can get a useful `doctor` report in under 2 minutes after install.
- **SC-003**: The product supports tools-only clients without requiring prompt/resource support for core workflows.
- **SC-004**: The architecture and docs are explicit enough that connector implementation can proceed without re-deciding the product shape.

## Assumptions

- Roblox Studio built-in MCP behavior is the runtime compatibility target.
- An explicit Luau companion runtime is part of the differentiated architecture.
- Blender integration will use the addon + local bridge split, not direct in-process MCP in this repo.
- The current MVP prioritizes local orchestration and connector boundaries, not remote deployment.
