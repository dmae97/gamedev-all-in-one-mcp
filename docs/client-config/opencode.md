# OpenCode

Use the built server path in your OpenCode MCP config.

```json
{
  "mcpServers": {
    "gamedev-all-in-one": {
      "command": "node",
      "args": [
        "/absolute/path/to/gamedev_all_in_one/dist/index.js"
      ]
    }
  }
}
```

After saving the config, restart OpenCode and run `doctor`.
