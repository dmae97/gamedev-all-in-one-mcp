# Roblox All-in-One MCP Constitution

## Core Principles

### I. Cross-Client Compatibility First
Every core workflow MUST work through a local stdio MCP server before any client-specific enhancement is added. If a capability only works in one client, it is optional, not foundational.

### II. Connector Isolation
Roblox and Blender integrations MUST live behind explicit connectors. The public tool surface cannot leak raw client- or bridge-specific behavior into the rest of the system.

### III. Deterministic Tool Contracts
All MCP tools MUST have stable names, explicit schemas, predictable side effects, and stderr-only logging. Core workflows must be consumable through tools even when prompts or resources are unsupported by a client.

### IV. Explicit Project State
Cross-tool workflows MUST use an explicit local project manifest as the source of truth for sync state, asset mappings, and environment discovery. Hidden state in prompts or temporary memory is not sufficient.

### V. Validate Before Mutation
Environment checks, prerequisite detection, and validation loops are first-class features. Dangerous or high-cost workflows should be preceded by doctor/preflight checks whenever practical.

## Product Constraints

- Default transport is stdio.
- Core product value is prompt-to-prototype Roblox building, not generic MCP experimentation.
- Tools are the MVP-critical capability surface.
- Resources and prompts are additive only.
- Local prerequisites like Roblox Studio or Blender may exist, but the package must explain missing dependencies clearly.

## Development Workflow

- New feature work starts in `.specify/specs/<feature>/spec.md`.
- Technical architecture is recorded in `.specify/specs/<feature>/plan.md` before broad scaffolding or implementation.
- The repository structure must match the selected structure in the implementation plan.
- Verification must include config validity and real command execution where applicable.

## Governance

This constitution governs project decisions, templates, and implementation plans. Any change that breaks these principles must be justified explicitly in the relevant plan.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
