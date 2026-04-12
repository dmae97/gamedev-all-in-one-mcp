# Roblox All-in-One MCP

![License: AGPL-3.0-only](https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg)
![Node 20+](https://img.shields.io/badge/node-20%2B-43853d.svg)
![Status: Alpha](https://img.shields.io/badge/status-alpha-orange.svg)

Open-source MCP for Roblox game creation, with one public stdio MCP surface, a Luau runtime companion inside Studio, and a Blender integration path under the same project.

## Languages

- [English](#english)
- [한국어](#한국어)
- [中文](#中文)

## English

Roblox All-in-One MCP is an early open-source attempt to make Roblox creation feel native inside MCP-compatible clients.

Instead of splitting Roblox, Luau runtime work, and future Blender workflows across disconnected tools, this project keeps them behind one MCP server.

### What works now

- `project_init`
- `inspect_project`
- `doctor`
- `list_capabilities`
- live Luau runtime handshake
- runtime health checks
- first mutation workflows:
  - `roblox_run_code`
  - `roblox_create_workspace_part`

### Why this project exists

Most projects in this space do one thing well.

- Roblox-only MCP
- Blender-only MCP
- Blender to Roblox upload
- multi-DCC experiments for other engines

This repository is trying to combine the missing pieces into one workflow:

- one local stdio MCP server
- Roblox game-building workflows
- explicit Luau companion plugin/runtime layer
- Blender asset pipeline direction
- cross-client setup for Claude Desktop, Cursor, Claude Code, OpenCode, VS Code / Copilot-style setups, and similar MCP clients

## 한국어

이 프로젝트는 로블록스 게임 제작을 MCP 환경에서 자연스럽게 만들기 위한 오픈소스 시도입니다.

로블록스 작업, Luau 런타임, 앞으로 붙을 Blender 자산 흐름을 따로 노는 툴로 두지 않고, 하나의 MCP 서버 뒤로 묶는 방향입니다.

현재 되는 것:

- 프로젝트 초기화
- 상태 inspection
- 진단 도구 (`doctor`)
- capability 조회
- Luau 런타임 live handshake
- health-check
- 첫 mutation workflow

아직 알파 단계지만, 이제 단순 설계 문서만 있는 상태는 아닙니다. 실제 shell, bridge, handshake, 첫 구조화된 mutation path까지 올라와 있습니다.

## 中文

这个项目是在尝试把 Roblox 游戏开发流程真正放进 MCP 生态里。

目标不是做一个只会调用单个编辑器的 demo，而是把 Roblox 工作流、Studio 里的 Luau runtime，以及未来的 Blender 资产流程，统一到一个 MCP server 下面。

当前已经可用的部分包括：

- project init
- project inspect
- doctor / capabilities
- live Luau runtime handshake
- health checks
- first mutation workflows

现在还是 alpha，但已经不是只有架构文档的阶段了。

## Quick Start

```bash
npm install
npm run build
```

Then point your MCP client to:

```text
node /absolute/path/to/roblox_all_in_one_mcp/dist/index.js
```

After that, run:

- `doctor`
- `list_capabilities`

## Architecture

```text
MCP Client
  -> local stdio MCP server
      -> Roblox connector
      -> Luau companion plugin/runtime layer
      -> Blender connector
      -> orchestration layer
      -> project manifest/state
      -> validation and doctor layer
```

The key idea is the Luau boundary.

This repository does not treat Roblox Studio as a black box. It explicitly models a Studio-side companion runtime for Luau execution, runtime logs, playtest control, and mutation workflows.

## Screenshots / Examples / Inspiration

The current repository is still alpha, so the best visual references today are the MCP projects that informed this architecture.

These are reference examples, not claims that this repository already matches all of them.

### Blender MCP UI examples

<p>
  <img src="https://raw.githubusercontent.com/ahujasid/blender-mcp/main/assets/addon-instructions.png" alt="Blender MCP addon instructions" width="48%" />
  <img src="https://raw.githubusercontent.com/ahujasid/blender-mcp/main/assets/hammer-icon.png" alt="Blender MCP hammer icon" width="48%" />
</p>

Source: `ahujasid/blender-mcp`

### Blender MCP rendered scene example

<p>
  <img src="https://raw.githubusercontent.com/djeada/blender-mcp-server/main/docs/images/demo_render.png" alt="Blender MCP render example" width="72%" />
</p>

Source: `djeada/blender-mcp-server`

### Video references

- Blender MCP full tutorial: https://www.youtube.com/watch?v=lCyQ717DuzQ
- Blender MCP setup: https://www.youtube.com/watch?v=neoK_WMq92g
- Blender MCP demo scene: https://www.youtube.com/watch?v=DqgKuLYUv00
- Blender MCP Poly Haven demo: https://www.youtube.com/watch?v=I29rn92gkC4
- Blender MCP image-to-scene demo: https://www.youtube.com/watch?v=FDRb03XPiRo

## Current Status

Already in place:

- MCP server bootstrap
- `doctor`
- `list_capabilities`
- `project_init`
- `inspect_project`
- `roblox_run_code`
- `roblox_create_workspace_part`
- local project manifest
- live Luau runtime bridge server
- Luau runtime handshake and health path
- Studio-side Luau consumer loop
- Studio-side plugin bootstrap entrypoint

Next up:

1. production-ready Studio plugin packaging
2. richer Roblox scene / UI / script workflows
3. Blender asset sync path
4. broader client docs and examples

## Client Config Docs

- `docs/client-config/claude-desktop.md`
- `docs/client-config/claude-code.md`
- `docs/client-config/cursor.md`
- `docs/client-config/opencode.md`
- `docs/client-config/vscode-copilot.md`
- `docs/client-config/troubleshooting.md`

## Docs

- `process.md`
- `docs/architecture.md`
- `docs/open-source-quality.md`
- `docs/client-config/README.md`

## Upstream References

- Roblox runtime target: built-in Roblox Studio MCP
- Roblox reference: `drgost1/robloxstudio-mcp`
- Blender references: `ahujasid/blender-mcp`, `djeada/blender-mcp-server`
- pattern references: `CoplayDev/unity-mcp`, `loonghao/dcc-mcp-ipc`

## License

This project is licensed under **AGPL-3.0-only**.

That is intentional.

- improvements to the server should remain open
- networked or hosted variants should not silently become closed forks
- strong copyleft is acceptable for this project's goals

For source reuse inside this repository:

- direct code adaptation is fine from `MIT` and `Apache-2.0` upstreams
- `GPL` and `AGPL` projects are mainly reference material unless full copyleft implications are intentionally accepted
