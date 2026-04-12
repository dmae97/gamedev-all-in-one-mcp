# Integration Matrix

| Domain | Primary Upstream | License | Role In This Project | Reuse Mode | Decision |
|---|---|---:|---|---|---|
| Multi-DCC backbone | `loonghao/dcc-mcp-ipc` | MIT | long-term architecture reference | pattern-only | defer as a backbone reference, not an MVP dependency |
| Roblox Studio runtime | Roblox built-in MCP / `Roblox/studio-rust-mcp-server` reference | MIT | compatibility target and bridge model | architecture reference | use built-in behavior as target, not the archived repo as base |
| Roblox fast-track implementation patterns | `drgost1/robloxstudio-mcp` | MIT | tool grouping, Node/TS packaging, local bridge flow | selective pattern reuse | preferred short-term reference |
| Blender official direction | Blender Lab MCP Server | confirm before vendoring | product reference and compatibility target | external compatibility target | do not vendor until license is verified cleanly |
| Blender packaging and ecosystem conventions | `ahujasid/blender-mcp` | MIT | packaging, addon split, tool ergonomics | selective pattern reuse | preferred ecosystem reference |
| Blender fast-track implementation patterns | `djeada/blender-mcp-server` | MIT | addon/server split, TCP bridge, job model | selective pattern reuse | preferred short-term reference |
| Unity pattern source | `CoplayDev/unity-mcp` | MIT | transport hardening, multi-client config, local/remote discipline | pattern-only | use as design reference only |
| Roblox docs sidecar | `n4tivex/mcp-roblox-docs` | MIT | API/docs companion | optional sidecar | defer until core connectors work |

## Fast-Track Rules

1. Public transport stays stdio.
2. Connector internals may differ by domain.
3. Roblox and Blender should share one top-level MCP surface, not two separately exposed servers.
4. Direct code adaptation should prefer MIT and Apache-2.0 sources even though this repository itself is AGPL-3.0-only.
