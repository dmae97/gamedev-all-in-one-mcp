# Data Model: Roblox All-in-One MCP

## Project Manifest

Represents the local source of truth for one Roblox all-in-one MCP workspace.

### Fields

- `projectRoot`: absolute project root path
- `runtimeTarget`: target Roblox runtime mode
- `connectors.roblox`: Roblox connector metadata and detection state
- `connectors.luau`: Luau companion runtime and plugin detection state
- `connectors.blender`: Blender connector metadata and detection state
- `assetMappings`: exported Blender asset bundle mappings
- `syncState`: last successful sync timestamps and status
- `templates`: selected starter template metadata

### Validation Rules

- `projectRoot` must be an absolute path
- connector metadata must include a deterministic availability state
- asset mappings must point to local paths known to the manifest

## Connector Capability Report

Represents a snapshot of what the current machine can do.

### Fields

- `available`: boolean
- `detected`: structured machine signals such as command, bridge, or env hints
- `reasons`: human-readable missing prerequisite explanations

### Relationships

- One manifest owns one Roblox capability report, one Luau runtime status, and one Blender capability report

## Luau Runtime Status

Represents whether the companion plugin/runtime inside Roblox Studio is reachable and safe to use.

### Fields

- `available`: boolean
- `bridgeMode`: polling, push, or unknown
- `pluginVersion`: detected plugin/runtime version when available
- `capabilities`: runtime-specific actions such as mutation, log streaming, playtest, Luau execution
- `reasons`: missing prerequisite explanations

## Game Slice Request

Represents a prompt-driven request to create or patch a prototype gameplay slice.

### Fields

- `prompt`: natural-language request
- `intent`: normalized category such as `obby`, `arena`, `lobby_ui`, `physics_patch`
- `targetScope`: requested project or subsystem scope
- `artifacts`: resulting scripts, UI, scene changes, or asset mappings

## Asset Bundle Mapping

Represents how a Blender export is intended to flow into the Roblox project.

### Fields

- `sourcePath`: Blender export path
- `format`: `glb`, `fbx`, `obj`, or similar
- `targetName`: target asset or import identifier in Roblox-facing workflows
- `status`: pending, synced, stale, failed

### State Transitions

- `pending -> synced`
- `pending -> failed`
- `synced -> stale`
- `stale -> synced`
