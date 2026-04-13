# Gamedev All-in-One MCP

![License: AGPL-3.0-only](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)
![Node 20+](https://img.shields.io/badge/node-20%2B-43853d.svg)
![Tools: 67](https://img.shields.io/badge/tools-67-blueviolet.svg)
![Engines: 4](https://img.shields.io/badge/engines-4-orange.svg)
![Status: Alpha](https://img.shields.io/badge/status-alpha-orange.svg)

One MCP server. Four game engines. 67 tools. Physics included.

**Roblox Studio + Unity + Unreal Engine + Blender** — all controllable from a single stdio MCP server with a built-in web dashboard and AI console.

## Features

- **67 MCP tools** across 12 modules (scene, script, instance, physics per engine)
- **4 engine connectors** with auto-reconnecting bridges
- **Web Dashboard** at `http://127.0.0.1:3100` with real-time SSE monitoring
- **AI Console** — built-in chat with Anthropic/OpenAI/Google, auto-executes tools
- **Physics tools** — gravity, rigid body, constraints, raycast, force/impulse per engine
- **Roblox Studio Plugin** — single-file `.lua` plugin with 20 command handlers
- **Graceful degradation** — port conflicts don't crash the server
- Works with Claude Desktop, Cursor, Claude Code, OpenCode, VS Code Copilot

## Quick Start

```bash
git clone https://github.com/nicepkg/gamedev-all-in-one.git
cd gamedev-all-in-one
npm install
npm run build
npm run dev
```

Then open `http://127.0.0.1:3100` in your browser.

### MCP Client Config

Point your MCP client to:

```json
{
  "mcpServers": {
    "gamedev-all-in-one": {
      "command": "node",
      "args": ["/absolute/path/to/gamedev-all-in-one/dist/index.js"]
    }
  }
}
```

## Architecture

```
MCP Client (Claude Desktop / Cursor / VS Code Copilot / OpenCode)
  |
  +-- stdio --> MCP Server (Node.js)
                  |-- Foundation tools (4)
                  |-- Roblox tools (20) --> Luau Bridge :3002 --> Studio Plugin
                  |-- Unity tools (15)  --> TCP Bridge :7890  --> C# EditorWindow
                  |-- Unreal tools (15) --> TCP Bridge :55557 --> C++ Plugin
                  |-- Blender tools (13)--> TCP Bridge :9876  --> Python Addon
                  |-- Web Dashboard :3100 (SSE + AI Console)
```

## Tool Inventory (67 tools)

### Foundation (4)

| Tool | Description |
|------|-------------|
| `project_init` | Initialize project manifest |
| `inspect_project` | Read manifest state |
| `doctor` | Validate environment and connectors |
| `list_capabilities` | List all tools and connector status |

### Roblox (20 tools)

**Core (2):** `roblox_run_code`, `roblox_create_workspace_part`

**Script (4):** `roblox_get_script_source`, `roblox_set_script_source`, `roblox_edit_script_lines`, `roblox_grep_scripts`

**Instance (5):** `roblox_create_instance`, `roblox_delete_instance`, `roblox_set_property`, `roblox_clone_instance`, `roblox_reparent_instance`

**Query (4):** `roblox_get_instance_properties`, `roblox_get_instance_children`, `roblox_search_instances`, `roblox_get_file_tree`

**Physics (5):** `roblox_set_gravity`, `roblox_set_physics`, `roblox_add_constraint`, `roblox_raycast`, `roblox_simulate_physics`

### Unity (15 tools)

**Core (10):** `unity_get_hierarchy`, `unity_get_gameobject`, `unity_create_gameobject`, `unity_delete_gameobject`, `unity_set_component_property`, `unity_add_component`, `unity_set_transform`, `unity_get_script_source`, `unity_play_mode`, `unity_execute_menu_item`

**Physics (5):** `unity_set_gravity`, `unity_add_rigidbody`, `unity_add_joint`, `unity_raycast`, `unity_apply_force`

### Unreal Engine (15 tools)

**Core (10):** `unreal_get_world_outliner`, `unreal_get_actor`, `unreal_spawn_actor`, `unreal_destroy_actor`, `unreal_set_actor_transform`, `unreal_set_actor_property`, `unreal_get_blueprint`, `unreal_run_python`, `unreal_play_mode`, `unreal_get_viewport_screenshot`

**Physics (5):** `unreal_set_gravity`, `unreal_set_simulate_physics`, `unreal_add_physics_constraint`, `unreal_raycast`, `unreal_apply_force`

### Blender (13 tools)

**Core (8):** `blender_get_scene`, `blender_get_object`, `blender_create_object`, `blender_delete_object`, `blender_set_transform`, `blender_set_material`, `blender_run_python`, `blender_export`

**Physics (5):** `blender_set_gravity`, `blender_setup_rigid_body`, `blender_add_constraint`, `blender_bake_physics`, `blender_apply_force`

## Web Dashboard

The built-in dashboard runs at `http://127.0.0.1:3100` and provides:

### Engine Connectors Panel
- Real-time status for all 4 engines (Active / Detected / Offline)
- Bridge connection status, port, protocol info
- Staggered entrance animations with engine-colored glow effects

### AI Console
- **Provider selection**: Anthropic (Claude), OpenAI (GPT-4o), Google (Gemini)
- **Model selection**: Auto-populates based on provider
- **API Key**: Stored in localStorage per provider
- **Prompt input**: Send messages, Enter to submit
- **Tool execution**: AI automatically calls engine tools and shows results
- **Tool call visualization**: Yellow cards showing tool name, input, and result

### Registered Tools Panel
- All 67 tools listed with color-coded engine dots
- Live filter/search across tool names and descriptions

### Event Log
- SSE-powered real-time event stream
- Connection status, tool usage, errors

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_DASHBOARD_PORT` | `3100` | Dashboard HTTP port |
| `WEB_DASHBOARD_ENABLED` | `true` | Set to `false` to disable |
| `ROBLOX_LUAU_BRIDGE_PORT` | `3002` | Roblox Luau bridge port |
| `UNITY_BRIDGE_PORT` | `7890` | Unity TCP bridge port |
| `UNREAL_BRIDGE_PORT` | `55557` | Unreal TCP bridge port |
| `BLENDER_BRIDGE_PORT` | `9876` | Blender TCP bridge port |

## Roblox Studio Plugin

A single-file plugin is provided at `runtime/roblox-studio-plugin/GamedevAllInOne.server.lua`.

### Installation

1. Copy `GamedevAllInOne.server.lua` to your Studio Plugins folder:
   - **Windows**: `%LOCALAPPDATA%\Roblox\Plugins\`
   - **Mac**: `~/Documents/Roblox/Plugins/`
2. Restart Roblox Studio
3. Enable: Game Settings > Security > Allow HTTP Requests = ON
4. Run `npm run dev` in this project
5. The plugin auto-connects to the bridge on load

### What the plugin does

- 20 command handlers (script CRUD, instance CRUD, physics, raycast)
- Auto-handshake with bridge on startup
- HTTP long-poll command loop
- Toolbar button to start/stop runtime
- `pcall`-wrapped HTTP for graceful failure

## Bridge Architecture

| Engine | Protocol | Port | Editor Plugin |
|--------|----------|------|---------------|
| Roblox | HTTP long-poll | 3002 | Luau plugin (auto-connect) |
| Unity | TCP socket | 7890 | C# EditorWindow (planned) |
| Unreal | TCP socket | 55557 | C++ Plugin (planned) |
| Blender | TCP socket | 9876 | Python addon (planned) |

All bridges bind to `127.0.0.1` only. TCP bridges auto-reconnect in background.

## Security

- All bridges loopback-only (`127.0.0.1`)
- Luau bridge: 1 MiB body limit, Host header validation, response TTL cleanup
- Dashboard: Host header validation, CORS headers
- API keys never stored server-side (localStorage only)
- Graceful EADDRINUSE handling (no crashes)

## Development

```bash
npm run dev          # Start with tsx (hot reload)
npm run build        # TypeScript compile + copy dashboard
npm start            # Production mode
npm test             # Run tests
```

## Project Structure

```
src/
  index.ts                     # Entrypoint + graceful shutdown
  version.ts                   # NAME, VERSION constants
  server/create-server.ts      # McpServer + 12 tool module registration
  connectors/
    shared/tcp-bridge.ts       # Shared TCP bridge class (Unity/Unreal/Blender)
    roblox/index.ts            # Roblox detection + executeRobloxCommand
    luau/bridge.ts             # HTTP long-poll bridge (hardened)
    luau/index.ts              # Luau runtime detection
    unity/index.ts             # Unity detection + TCP bridge
    unreal/index.ts            # Unreal detection + TCP bridge
    blender/index.ts           # Blender detection + TCP bridge
  tools/
    foundation.ts              # 4 foundation tools
    roblox.ts                  # 2 core Roblox tools
    roblox-script.ts           # 4 script tools
    roblox-instance.ts         # 5 instance tools
    roblox-query.ts            # 4 query tools
    roblox-physics.ts          # 5 physics tools
    unity.ts                   # 10 Unity tools
    unity-physics.ts           # 5 Unity physics tools
    unreal.ts                  # 10 Unreal tools
    unreal-physics.ts          # 5 Unreal physics tools
    blender.ts                 # 8 Blender tools
    blender-physics.ts         # 5 Blender physics tools
  web/
    server.ts                  # Dashboard HTTP + API + SSE + /api/chat
    llm-proxy.ts               # Multi-provider LLM caller with tool execution
    dashboard.html             # Single-file frontend (dark theme, glassmorphism)
runtime/
  roblox-studio-plugin/
    GamedevAllInOne.server.lua # Single-file Studio plugin (20 handlers)
    src/
      runtime_loop.luau        # Luau runtime loop (modular version)
      plugin_bootstrap.luau    # Plugin bootstrap
      init.luau                # Runtime entrypoint
```

## Upstream References

### Roblox
- `boshyxd/robloxstudio-mcp` (MIT, 37+ tools)
- `yannyhl/linkedsword-mcp` (MIT, 73 tools)
- `Roblox/studio-rust-mcp-server` (official)

### Unity
- `CoderGamester/mcp-unity` (MIT, TypeScript + C#)
- `CoplayDev/unity-mcp` (MIT, Python + C#, `manage_physics`)

### Unreal Engine
- `chongdashu/unreal-mcp` (MIT, 1.7k stars, C++ + Python)
- `kevinpbuckley/VibeUE` (MIT, Streamable HTTP)

### Blender
- `ahujasid/blender-mcp` (MIT, 19.1k stars)
- `poly-mcp/Blender-MCP-Server` (MIT, 51 tools, `setup_rigid_body`)

### Physics
- `KAIST-M4/MCP-SIM` (multi-agent physics simulation)
- `BlinkZer0/Phys-MCP` (physics calculator MCP)
- `@dimforge/rapier3d` (WASM physics engine)

## License

**AGPL-3.0-only**

- Improvements to the server must remain open source
- Networked or hosted variants must not become closed forks
- MIT and Apache-2.0 upstream code adapted with attribution preserved
