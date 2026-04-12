# Quickstart: Roblox All-in-One MCP

## 1. Install dependencies

```bash
npm install
```

## 2. Build the server

```bash
npm run build
```

## 3. Register the MCP server in a client

Use a stdio config pointing at the built entrypoint.

Example shape:

```json
{
  "mcpServers": {
    "roblox-all-in-one": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```

## 4. Verify the environment

Call:

- `list_capabilities`
- `doctor`

Expected outcome:

- MCP server responds over stdio
- stdout remains protocol-safe
- report explains Roblox and Blender availability clearly

## Runtime note

The differentiated Roblox path includes a Luau companion plugin/runtime layer inside Studio.

That runtime boundary is part of the target architecture, even though the current foundation only implements the MCP shell and diagnostic side.

## 5. Current MVP boundary

At this stage, the repository provides the architecture shell and foundation tools.

The next implementation step is connector contracts plus `project_init`.
