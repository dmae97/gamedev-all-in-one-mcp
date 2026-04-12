# VS Code / Copilot Agent Mode

Use the built server path in the MCP configuration accepted by your VS Code agent setup.

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

After saving the config, restart the agent host and run `doctor`.
