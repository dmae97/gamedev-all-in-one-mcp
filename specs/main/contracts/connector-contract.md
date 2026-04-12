# Connector Contract

## Purpose

Each connector hides platform-specific bridge details behind one stable internal interface.

For Roblox, this is intentionally split into two cooperating boundaries:

1. Roblox connector
2. Luau companion plugin/runtime layer

## Required Operations

- `detect()` -> capability report
- `connect()` -> establish or validate bridge reachability
- `describeRuntime()` -> runtime metadata for diagnostics
- `listToolFamilies()` -> supported grouped operations

## Required Properties

- deterministic `available` state
- machine-readable `detected` data
- human-readable `reasons`

## Contract Rules

1. Connector code may depend on different local bridge protocols.
2. Connector output must be normalized before reaching tool handlers.
3. Connector detection must be safe to run before any mutation path.
4. Connector logs must never contaminate MCP stdout.
5. Roblox-side runtime execution must not bypass the Luau companion boundary when Studio-side mutation, playtest, or runtime logs are involved.
