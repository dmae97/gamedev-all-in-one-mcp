# Feature Specification: Roblox All-in-One MCP

**Feature Branch**: `[001-roblox-all-in-one-mcp]`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "All-in-one Roblox MCP package that combines official Roblox MCP plus Blender MCP and works across Claude Desktop, Cursor, Codex, Claude Code, OpenCode, and other MCP-compatible clients. Users should be able to build Roblox games from prompts, including UI, physics, assets, scripting, and iteration, with simple setup."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect and Verify the Toolchain (Priority: P1)

As a builder using an MCP-compatible client, I want to install one MCP package and verify my local Roblox and Blender prerequisites, so that I can start building without manually stitching together multiple MCP servers.

**Why this priority**: Without a clean setup and validation path, the rest of the product does not feel usable.

**Independent Test**: Can be fully tested by registering the MCP server in one supported client, running `doctor`, and receiving a clear capability and prerequisite report.

**Acceptance Scenarios**:

1. **Given** the user has installed the package, **When** they register it in a supported MCP client and call `doctor`, **Then** the server reports whether Roblox and Blender integrations are available and what is missing.
2. **Given** the user has the required local integrations available, **When** they call `list_capabilities`, **Then** they receive a stable list of supported Roblox, Blender, and workflow tools.

---

### User Story 2 - Build a Roblox Game Slice from Prompts (Priority: P1)

As a Roblox creator, I want to generate a basic gameplay slice from prompts, so that I can move from idea to playable prototype without manually creating every object, UI element, or script.

**Why this priority**: This is the core product promise. If the package cannot create a small but real Roblox game slice, it is not delivering its main value.

**Independent Test**: Can be tested by using one workflow tool to create a small prototype containing place structure, UI, scripts, and physics settings.

**Acceptance Scenarios**:

1. **Given** a valid local Roblox environment, **When** the user requests a small game slice such as an obby or arena loop, **Then** the system creates or updates the Roblox project structure and applies the requested gameplay components.
2. **Given** an existing project, **When** the user asks to adjust UI, scripts, or physics, **Then** the system updates the relevant systems without requiring full regeneration.

---

### User Story 3 - Bring Blender Assets into the Roblox Workflow (Priority: P2)

As a creator who uses Blender, I want to generate or inspect Blender-side assets and sync them into the Roblox build flow, so that environment art and gameplay prototyping can happen through one MCP package.

**Why this priority**: Blender integration is a core differentiator, but the product still has value before this is fully complete.

**Independent Test**: Can be tested by inspecting a Blender scene, exporting an asset bundle, and mapping it into the Roblox project state.

**Acceptance Scenarios**:

1. **Given** Blender integration is available, **When** the user exports an asset bundle, **Then** the package records the exported artifacts in project state and makes them available to Roblox sync workflows.
2. **Given** an existing Roblox project state, **When** the user syncs Blender assets, **Then** the package updates the asset mapping without requiring manual multi-tool coordination.

### Edge Cases

- What happens when Roblox integration is available but Blender integration is not?
- How does the system handle a client that supports tools but not resources or prompts?
- How does the system handle asset sync when exported Blender paths are stale or missing?
- What happens when the local Roblox or Blender bridge version is incompatible with the connector contract?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST run as a single MCP package that can be launched locally over stdio.
- **FR-002**: The system MUST expose a unified tool surface for Roblox, Blender, and orchestration workflows.
- **FR-003**: The system MUST provide a `doctor` capability that reports local prerequisites, detected bridges, and missing dependencies.
- **FR-004**: The system MUST provide a `list_capabilities` capability that describes what the local environment can currently do.
- **FR-005**: The system MUST support prompt-driven Roblox operations for scene setup, UI creation, scripting, and physics configuration.
- **FR-006**: The system MUST support iterative updates to an existing Roblox project rather than only one-shot generation.
- **FR-007**: The system MUST support Blender-side inspection and export workflows through the same MCP package.
- **FR-008**: The system MUST maintain explicit local project state for Roblox metadata, Blender asset mappings, and sync metadata.
- **FR-009**: The system MUST keep protocol output clean by reserving stdout for valid MCP messages only.
- **FR-010**: The system MUST remain usable in clients that only support MCP tools.

### Key Entities *(include if feature involves data)*

- **Project Manifest**: The local record of project root, enabled connectors, Roblox metadata, Blender asset mappings, and sync timestamps.
- **Capability Report**: A structured view of what the current machine and current client can support.
- **Game Slice**: A discrete prototype increment containing scene structure, scripts, UI, and physics configuration.
- **Asset Bundle**: Blender-exported content that can be mapped into Roblox workflows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can install and register the package in at least five supported MCP clients using documented config snippets.
- **SC-002**: A user can complete environment validation and receive a doctor report in under 2 minutes after install.
- **SC-003**: A user can generate one playable Roblox prototype slice from prompts without manually configuring separate Roblox and Blender MCP servers.
- **SC-004**: The package can operate in tool-only MCP clients without depending on resources or prompts for core workflows.

## Assumptions

- Users have local access to at least one supported MCP client.
- Roblox integration will be available through an official Roblox MCP or a compatible local bridge.
- Blender integration will be available through an existing Blender MCP or a compatible local bridge/addon.
- The MVP prioritizes local development workflows over remote-hosted MCP deployment.
