# Architecture

## Top-Level Shape

```text
MCP Client (Claude Desktop / Cursor / Claude Code / OpenCode / VS Code Copilot)
  │
  └─ stdio ──▶ MCP Server (Node.js, single process)
                 ├─ Foundation tools      (4)  project_init, inspect_project, doctor, list_capabilities
                 ├─ Roblox tools          (15) run_code, create_workspace_part, script CRUD, instance CRUD, query
                 ├─ Unity tools           (planned, ~10)
                 ├─ Unreal tools          (planned, ~10)
                 ├─ Blender tools         (planned, ~8)
                 ├─ Manifest/state layer
                 └─ Validation/doctor layer
                 │
                 ├─ Roblox connector ──▶ Luau Bridge (HTTP long-poll, localhost:3002)
                 │                         └─▶ Roblox Studio Plugin (runtime_loop.luau, 15 command handlers)
                 │
                 ├─ Unity connector ──▶ TCP Bridge (planned, port 7890)
                 │   (planned)             └─▶ Unity Editor C# Package
                 │
                 ├─ Unreal connector ──▶ TCP Bridge (planned, port 55557)
                 │   (planned)              └─▶ Unreal C++ Plugin
                 │
                 └─ Blender connector ──▶ TCP Bridge (planned, port 9876)
                     (detection only)        └─▶ Blender Python Addon
```

## Why this shape

The public transport stays `stdio` because that is the strongest compatibility baseline across Claude Desktop, Cursor, Codex, Claude Code, OpenCode, and similar MCP clients.

Each engine connector is isolated because their local bridge models differ:

| Engine   | Bridge Protocol    | Editor-side Runtime        | Port  |
|----------|--------------------|----------------------------|-------|
| Roblox   | HTTP long-poll     | Luau plugin (runtime_loop) | 3002  |
| Unity    | TCP socket         | C# EditorWindow            | 7890  |
| Unreal   | TCP socket         | C++ Plugin (FToolRegistry) | 55557 |
| Blender  | TCP socket         | Python addon               | 9876  |

The user still sees one MCP package and one stdio entrypoint. Engine availability is auto-detected; tools for unavailable engines are registered but return clear error messages.

## Runtime Boundaries

### MCP server (`src/server/create-server.ts`)

- owns public tool registration (5 tool modules)
- owns graceful shutdown (SIGINT/SIGTERM)
- owns manifest/state reads and writes
- keeps stdout protocol-safe (all logging to stderr)
- exports `NAME` and `VERSION` from `src/version.ts`

### Roblox connector (`src/connectors/roblox/`)

- `RobloxConnectorStatus`: detection, bridge health, plugin staleness
- `executeRobloxCommand()`: generic workflow — validate status, dispatch via bridge, return `toolResult()`
- feeds 15 Roblox tools across 4 modules

### Luau companion plugin/runtime layer (`runtime/roblox-studio-plugin/`)

- `runtime_loop.luau`: 15 command handlers via `COMMAND_HANDLERS` dispatch table
- `resolvePath()` utility for safe instance path resolution
- `plugin_bootstrap.luau`: plugin toolbar, activation, HTTP polling lifecycle
- `init.luau`: runtime entrypoint
- creates a stable boundary between the stdio MCP shell and the in-Studio runtime

### Luau bridge (`src/connectors/luau/bridge.ts`)

- HTTP long-poll server on `127.0.0.1:3002` (configurable via `ROBLOX_LUAU_BRIDGE_PORT`)
- `LuauCommandKind` union type (15 kinds)
- `dispatchLuauCommand()` generic dispatcher
- Security hardening:
  - 1 MiB request body limit (`MAX_REQUEST_BODY_BYTES`)
  - Host header validation (`ALLOWED_HOSTS`: 127.0.0.1, localhost, [::1])
  - JSON parse error handling with `request.destroy()` on oversized payloads
  - Response TTL cleanup (300s TTL, 60s sweep interval)

### Blender connector (`src/connectors/blender/index.ts`)

- `BlenderConnectorStatus`: detection only (checks for `blender` binary)
- No bridge or tools implemented yet

### Unity connector (planned)

- TCP socket bridge, targeting `CoderGamester/mcp-unity` (MIT) patterns
- C# companion package for Unity Editor

### Unreal connector (planned)

- TCP socket bridge, targeting `chongdashu/unreal-mcp` (MIT) patterns
- C++ plugin companion for Unreal Editor

### Manifest/state layer (`src/project/manifest.ts`)

- tracks project root
- tracks connector status per engine
- tracks Luau runtime/plugin status
- tracks sync state and template selection

### Validation layer (`src/validation/environment.ts`)

- `envFlag()` for feature flags
- `commandExists()` with execute-permission check (`stat.mode & 0o111`)

## Tool Inventory (67 tools, 12 modules)

### Foundation (4, `src/tools/foundation.ts`)

| Tool | Description |
|------|-------------|
| `project_init` | Initialize project manifest |
| `inspect_project` | Read current manifest state |
| `doctor` | Validate environment, connectors, bridge health |
| `list_capabilities` | List all registered tools and connector status |

### Roblox — Core (2, `src/tools/roblox.ts`)

| Tool | Description |
|------|-------------|
| `roblox_run_code` | Execute arbitrary Luau code in Studio |
| `roblox_create_workspace_part` | Create a Part in Workspace with transform/properties |

### Roblox — Script (4, `src/tools/roblox-script.ts`)

| Tool | Description |
|------|-------------|
| `roblox_get_script_source` | Read script source by instance path |
| `roblox_set_script_source` | Overwrite entire script source |
| `roblox_edit_script_lines` | Replace line range within a script |
| `roblox_grep_scripts` | Search all scripts for a pattern |

### Roblox — Instance (5, `src/tools/roblox-instance.ts`)

| Tool | Description |
|------|-------------|
| `roblox_create_instance` | Create any ClassName under a parent path |
| `roblox_delete_instance` | Delete an instance by path |
| `roblox_set_property` | Set a property on an instance |
| `roblox_clone_instance` | Clone an instance to a target parent |
| `roblox_reparent_instance` | Move an instance to a new parent |

### Roblox — Query (4, `src/tools/roblox-query.ts`)

| Tool | Description |
|------|-------------|
| `roblox_get_instance_properties` | Read all properties of an instance |
| `roblox_get_instance_children` | List direct children of an instance |
| `roblox_search_instances` | Find instances by ClassName and/or name pattern |
| `roblox_get_file_tree` | Get hierarchical tree from a root path |

### Roblox — Physics (5, `src/tools/roblox-physics.ts`)

| Tool | Description |
|------|-------------|
| `roblox_set_gravity` | Set Workspace gravity vector |
| `roblox_set_physics` | Enable/disable physics on BasePart (anchor/velocity) |
| `roblox_add_constraint` | Add physics constraint (Spring, Hinge, Rope, Weld, etc.) |
| `roblox_raycast` | Cast ray in 3D space with filter support |
| `roblox_simulate_physics` | Apply impulse, force, or torque to a BasePart |

### Unity (10, `src/tools/unity.ts`)

| Tool | Description |
|------|-------------|
| `unity_get_hierarchy` | Scene hierarchy tree |
| `unity_get_gameobject` | GameObject properties and components |
| `unity_create_gameobject` | Create GameObject (primitives or empty) |
| `unity_delete_gameobject` | Delete GameObject by path |
| `unity_set_component_property` | Set component property value |
| `unity_add_component` | Add component to GameObject |
| `unity_set_transform` | Set position/rotation/scale |
| `unity_get_script_source` | Read C# script from Assets |
| `unity_play_mode` | Control play/stop/pause |
| `unity_execute_menu_item` | Execute Editor menu item |

### Unity — Physics (5, `src/tools/unity-physics.ts`)

| Tool | Description |
|------|-------------|
| `unity_set_gravity` | Set Physics.gravity vector |
| `unity_add_rigidbody` | Add Rigidbody with mass, drag, constraints, collision detection |
| `unity_add_joint` | Add physics joint (Fixed, Hinge, Spring, Character, Configurable) |
| `unity_raycast` | Physics.Raycast with layer mask |
| `unity_apply_force` | Apply force/impulse/torque to Rigidbody |

### Unreal (10, `src/tools/unreal.ts`)

| Tool | Description |
|------|-------------|
| `unreal_get_world_outliner` | World outliner actor hierarchy |
| `unreal_get_actor` | Actor properties and components |
| `unreal_spawn_actor` | Spawn actor from class/blueprint |
| `unreal_destroy_actor` | Destroy actor by path |
| `unreal_set_actor_transform` | Set location/rotation/scale |
| `unreal_set_actor_property` | Set actor or component property |
| `unreal_get_blueprint` | Inspect Blueprint asset |
| `unreal_run_python` | Execute Python in Editor |
| `unreal_play_mode` | Control PIE play/stop/pause |
| `unreal_get_viewport_screenshot` | Capture viewport screenshot |

### Unreal — Physics (5, `src/tools/unreal-physics.ts`)

| Tool | Description |
|------|-------------|
| `unreal_set_gravity` | Set world gravity override |
| `unreal_set_simulate_physics` | Enable/disable physics on component |
| `unreal_add_physics_constraint` | Add UPhysicsConstraintComponent |
| `unreal_raycast` | Line trace with channel filtering |
| `unreal_apply_force` | Apply force/impulse/torque to physics component |

### Blender (8, `src/tools/blender.ts`)

| Tool | Description |
|------|-------------|
| `blender_get_scene` | Scene hierarchy and metadata |
| `blender_get_object` | Object properties, modifiers, materials |
| `blender_create_object` | Create mesh primitive or empty |
| `blender_delete_object` | Delete object by name |
| `blender_set_transform` | Set location/rotation/scale |
| `blender_set_material` | Assign or create PBR material |
| `blender_run_python` | Execute bpy Python code |
| `blender_export` | Export to FBX/OBJ/glTF/STL |

### Blender — Physics (5, `src/tools/blender-physics.ts`)

| Tool | Description |
|------|-------------|
| `blender_set_gravity` | Set scene gravity vector |
| `blender_setup_rigid_body` | Setup rigid body (type, shape, mass, friction, damping) |
| `blender_add_constraint` | Add rigid body constraint (Fixed, Hinge, Slider, Motor, etc.) |
| `blender_bake_physics` | Bake simulation to keyframes |
| `blender_apply_force` | Apply velocity, angular velocity, or force field |

## Security Model

### Loopback-only

All bridges bind to `127.0.0.1` only. No remote connections accepted.

### Request validation

- Host header must match `ALLOWED_HOSTS` set
- Request body capped at 1 MiB
- JSON parse failures trigger immediate `request.destroy()`

### Response lifecycle

- Pending responses auto-cleaned after 300s TTL
- 60s sweep interval with `.unref()` (does not block shutdown)

### Planned

- Bridge auth token (shared secret between MCP server and editor plugin)
- Rate limiting per tool
- Forbidden path list (CoreGui, CorePackages, etc.)

## Directory Layout

```text
gamedev_all_in_one/
├── package.json                    # v0.1.0, AGPL-3.0-only
├── tsconfig.json                   # ES2022, NodeNext, strict
├── src/
│   ├── index.ts                    # Entrypoint + SIGINT/SIGTERM graceful shutdown
│   ├── version.ts                  # NAME, VERSION constants
│   ├── server/
│   │   └── create-server.ts        # McpServer creation + 5 tool module registration
│   ├── tools/
│   │   ├── foundation.ts           # project_init, inspect_project, list_capabilities, doctor
│   │   ├── roblox.ts               # roblox_run_code, roblox_create_workspace_part
│   │   ├── roblox-script.ts        # 4 script tools
│   │   ├── roblox-instance.ts      # 5 instance tools
│   │   └── roblox-query.ts         # 4 query tools
│   ├── connectors/
│   │   ├── roblox/index.ts         # RobloxConnectorStatus + executeRobloxCommand()
│   │   ├── luau/
│   │   │   ├── bridge.ts           # LuauRuntimeBridge (HTTP long-poll, hardened)
│   │   │   └── index.ts            # detectLuauRuntime
│   │   └── blender/index.ts        # BlenderConnectorStatus (detection only)
│   ├── project/manifest.ts         # ProjectManifest CRUD
│   ├── validation/environment.ts   # envFlag, commandExists
│   └── orchestrators/              # Empty (reserved)
├── runtime/roblox-studio-plugin/src/
│   ├── init.luau                   # Runtime entrypoint
│   ├── plugin_bootstrap.luau       # Plugin lifecycle, toolbar, HTTP polling
│   └── runtime_loop.luau           # 15 command handlers + COMMAND_HANDLERS dispatch table
├── tests/                          # Empty (contract/, integration/, unit/)
├── specs/                          # Empty
├── docs/
│   ├── architecture.md             # This file
│   ├── open-source-quality.md
│   └── client-config/
└── dist/                           # Build output
```

## Luau Command Dispatch

The bridge uses a `kind`-based dispatch model. The MCP server sends a command object:

```json
{ "kind": "get_script_source", "payload": { "path": "Workspace.Script" } }
```

The Luau runtime receives this via HTTP long-poll and routes through `COMMAND_HANDLERS`:

```text
COMMAND_HANDLERS = {
  run_code, create_workspace_part,
  get_script_source, set_script_source, edit_script_lines, grep_scripts,
  create_instance, delete_instance, set_property, clone_instance, reparent_instance,
  get_instance_properties, get_instance_children, search_instances, get_file_tree
}
```

Each handler returns a result table that the bridge serializes back to the MCP tool.

## Upstream Strategy

### Roblox

- Roblox runtime target: built-in Roblox Studio MCP
- Roblox architecture upgrade: explicit Luau companion plugin/runtime layer
- Roblox fast-track reference: `boshyxd/robloxstudio-mcp` (355+ stars, MIT, 37+ tools)
- Roblox reference: `yannyhl/linkedsword-mcp` (73 tools, MIT)
- Roblox AGPL reference: `hope1026/weppy-roblox-mcp` (AGPL-3.0)
- Roblox official: `Roblox/studio-rust-mcp-server`

### Unity

- `CoderGamester/mcp-unity` (MIT, TypeScript server + C# Unity package)
- `CoplayDev/unity-mcp` (MIT, Python server + C# bridge)

### Unreal Engine

- `chongdashu/unreal-mcp` (1.7k stars, MIT, C++ plugin + Python FastMCP, TCP port 55557)
- `kevinpbuckley/VibeUE` (MIT, Streamable HTTP, FToolRegistry action-based dispatch)
- `ColtonWilley/ue-llm-toolkit` (MIT)

### Blender

- `ahujasid/blender-mcp` (19.1k stars, MIT, Python socket addon + MCP server, port 9876)
- `djeada/blender-mcp-server` (pattern reference)
- Blender official direction: Blender Lab MCP Server

### Cross-engine

- `loonghao/dcc-mcp-ipc` (long-term backbone reference)

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

## Roadmap

### Completed

1. ~~Luau runtime handshake and health checks~~
2. ~~Studio-side plugin that consumes the runtime bridge~~
3. ~~Expanded Roblox workflow tools (15 tools across script/instance/query)~~
4. ~~Security hardening (body limits, host validation, response TTL, path traversal fixes)~~
5. ~~Graceful shutdown (SIGINT/SIGTERM)~~

### Phase A: Unity Connector (next)

- `src/connectors/unity/bridge.ts` — TCP socket bridge (port 7890)
- `src/connectors/unity/index.ts` — detection + status
- `src/tools/unity.ts` — ~10 tools (hierarchy, GameObject CRUD, component, script, play/stop)
- Unity Editor C# companion package

### Phase B: Unreal Connector

- `src/connectors/unreal/bridge.ts` — TCP socket bridge (port 55557)
- `src/connectors/unreal/index.ts` — detection + status
- `src/tools/unreal.ts` — ~10 tools (actor CRUD, blueprint, transform, viewport, Python exec)
- Unreal C++ plugin companion

### Phase C: Blender Full Integration

- `src/connectors/blender/bridge.ts` — TCP socket bridge (port 9876)
- `src/tools/blender.ts` — ~8 tools (scene inspect, object CRUD, material, code exec)
- Blender Python addon

### Phase D: Cross-Engine Workflows

- Export/import between engines
- Asset pipeline: Blender to Unity/Unreal/Roblox
- Unified manifest tracking all engine states

### Hardening Backlog

- Roblox playtest automation (start/stop/get_output)
- Undo/Redo via ChangeHistoryService
- Bridge auth token (shared secret)
- Rate limiting per tool
- Forbidden path list (CoreGui, CorePackages)
- Plugin packaging and auto-install CLI
- Test suite (tests/ directory currently empty)
