# MCP Tool Contract

## Foundation Tools

### `doctor`

- Purpose: diagnose local prerequisites and connector availability
- Input: optional flags controlling report verbosity
- Output: structured report containing manifest state, connector reports, and missing prerequisites

### `list_capabilities`

- Purpose: return the current MCP capability surface for this machine and project
- Input: none
- Output: connector availability, manifest presence, and workflow compatibility metadata

## Design Rules

1. Core tools must work in tools-only MCP clients.
2. Tool names should stay stable and predictable.
3. Tool outputs should include structured content when possible.
4. High-level workflow tools should compose connector operations rather than bypass them.
