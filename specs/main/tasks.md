# Tasks: Roblox All-in-One MCP

## Phase 1: Setup

- [X] T001 Verify current MCP scaffold, manifest path conventions, and build baseline in `src/` and `specs/main/`

## Phase 2: Foundational

- [X] T002 Extend the manifest model and file operations in `src/project/manifest.ts`
- [X] T003 [P] Add Luau runtime detection in `src/connectors/luau/index.ts`

## Phase 3: User Story 1 - Verify the local toolchain

**Goal**: The MCP server can create a manifest, inspect the current project state, and report Roblox, Luau runtime, and Blender capabilities through one tool surface.

**Independent Test**: Build the server, call `project_init`, `inspect_project`, `doctor`, and `list_capabilities`, and confirm they return structured output with manifest and runtime status.

- [X] T004 [US1] Implement `project_init` in `src/tools/foundation.ts`
- [X] T005 [US1] Implement `inspect_project` in `src/tools/foundation.ts`
- [X] T006 [US1] Expand `doctor` and `list_capabilities` to include Luau runtime and parsed manifest state in `src/tools/foundation.ts`
- [X] T007 [US1] Add minimal Luau runtime scaffold files in `src/connectors/luau/` and `runtime/roblox-studio-plugin/`

## Phase 4: Validation

- [X] T008 Validate the milestone end-to-end with `npm run build` and real MCP tool calls from the built server

## Phase 5: User Story 1 - Runtime Boundary and First Mutation Workflow

**Goal**: The MCP shell can accept a live Luau runtime handshake, expose runtime health, dispatch one Studio-side command, and document the current client/runtime setup path.

**Independent Test**: Build the server, post a live runtime handshake to the loopback bridge, call `list_capabilities`, then call `roblox_run_code` and return a simulated runtime response through the command/result endpoints.

- [X] T009 [US1] Implement the live Luau runtime bridge server in `src/connectors/luau/bridge.ts`
- [X] T010 [US1] Extend Luau detection and manifest runtime state in `src/connectors/luau/index.ts` and `src/project/manifest.ts`
- [X] T011 [US1] Add the first Roblox mutation workflow in `src/connectors/roblox/index.ts`, `src/tools/roblox.ts`, and `src/server/create-server.ts`
- [X] T012 [US1] Update the Studio-side runtime scaffold contract in `runtime/roblox-studio-plugin/src/init.luau`
- [X] T013 [US1] Add current client config and runtime troubleshooting docs in `docs/client-config/`

## Phase 6: Validation

- [X] T014 Validate the runtime bridge, handshake, and `roblox_run_code` end-to-end with real MCP tool calls and simulated runtime responses

## Phase 7: User Story 1 - Studio-Side Runtime Consumer and Structured Mutation

**Goal**: The repository contains a real Luau consumer loop for the live runtime bridge, plus one structured Roblox mutation workflow beyond raw code execution.

**Independent Test**: Build the server, simulate a live runtime handshake, call `roblox_create_workspace_part`, and confirm that the queued command and returned response use the structured mutation contract.

- [X] T015 [US1] Implement the Studio-side Luau consumer loop in `runtime/roblox-studio-plugin/src/runtime_loop.luau`
- [X] T016 [US1] Extend the Luau command contract in `src/connectors/luau/bridge.ts`
- [X] T017 [US1] Add the structured Roblox mutation workflow in `src/connectors/roblox/index.ts` and `src/tools/roblox.ts`
- [X] T018 [US1] Update runtime and troubleshooting docs for the new command flow in `runtime/roblox-studio-plugin/src/init.luau` and `docs/client-config/`

## Phase 8: Validation

- [X] T019 Validate `roblox_create_workspace_part` end-to-end with a simulated runtime response

## Phase 9: User Story 1 - Plugin Bootstrap and Broader Client Coverage

**Goal**: The repository exposes an explicit Studio-side plugin bootstrap entrypoint and broader MCP client config coverage while preserving the current runtime architecture.

**Independent Test**: Build the project, verify the plugin bootstrap file exists and points at the runtime entry, and verify the new client config docs exist and use the current built server command.

- [X] T020 [US1] Add the Studio-side plugin bootstrap entrypoint in `runtime/roblox-studio-plugin/src/plugin_bootstrap.luau`
- [X] T021 [US1] Extend client config coverage in `docs/client-config/opencode.md` and `docs/client-config/vscode-copilot.md`
- [X] T022 [US1] Update progress and architecture docs for the new bootstrap and client coverage in `process.md`, `README.md`, and `docs/architecture.md`

## Phase 10: Validation

- [X] T023 Validate plugin bootstrap and expanded client docs with build and read-back checks
