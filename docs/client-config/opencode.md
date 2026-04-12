# OpenCode

Use the built server path in your OpenCode MCP config.

```json
{
  "mcpServers": {
    "roblox-all-in-one": {
      "command": "node",
      "args": [
        "/absolute/path/to/roblox_all_in_one_mcp/dist/index.js"
      ]
    }
  }
}
```

After saving the config, restart OpenCode and run `doctor`.
