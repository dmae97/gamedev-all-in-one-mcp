# Luau Runtime Contract

## Purpose

Define the boundary between the public MCP shell and the Studio-side Luau companion runtime.

## Required Operations

- `handshake()` -> runtime identity and version
- `detect()` -> runtime availability and supported capabilities
- `dispatch()` -> Studio-side mutation or Luau execution request
- `collectLogs()` -> runtime or playtest log retrieval
- `playtestControl()` -> start, stop, and inspect playtest sessions

## Required Properties

- deterministic runtime availability state
- explicit plugin/runtime version reporting
- machine-readable capability list
- human-readable reasons when the runtime is unavailable

## Rules

1. The Luau runtime is an internal boundary, not a separate public MCP server.
2. Studio-side mutation, Luau execution, and runtime feedback should route through this layer.
3. The MCP shell must keep stdout protocol-safe regardless of runtime failures.
4. Runtime state must be observable by `doctor` and future project inspection tools.
