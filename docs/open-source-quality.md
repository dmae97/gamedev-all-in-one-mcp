# Open Source Quality Bar

This project is intended to be published as open source.

That means the product must be usable by strangers, not just by us.

## Quality requirements

### 1. Installation must be exact

- every supported client needs a tested config example
- every command shown in docs must be copy-pasteable
- setup steps must be ordered, minimal, and verified

### 2. The public transport stays simple

- stdio is the required default
- if any internal bridge uses HTTP or TCP, that detail stays behind connectors
- users should not need to understand multiple bridge topologies to get started

### 3. Local trust boundaries must be explicit

- docs must warn that MCP tools can modify local projects
- docs must distinguish trusted local setup from unsafe or untrusted integrations
- local-only endpoints should stay loopback-only by default

### 4. Verification is part of the product

- `doctor` is mandatory, not optional polish
- every install path must include a verification step
- troubleshooting docs must cover bad config, missing binaries, and disconnected runtimes

### 5. Open source means maintainable

- connector contracts must be explicit
- upstream references must be documented
- vendoring decisions must stay license-safe and deliberate
- code copied or adapted from permissive upstreams must preserve attribution
- copyleft reuse must be intentional and documented

## Release gate

Do not call the project ready for public release until it has:

1. tested client config snippets
2. a clean `doctor` story
3. a documented manifest format
4. clear connector contracts
5. troubleshooting docs for common setup failures
6. license and attribution clarity for any directly adapted code

## License posture

This repository uses AGPL-3.0-only.

That does not mean every upstream source should be copied blindly.

- MIT and Apache-2.0 code are the easiest direct-adapt sources
- GPL and AGPL sources should only be pulled in when the copyleft consequence is clearly accepted
- official or unclear-license sources should stay compatibility targets until redistribution terms are certain

## Evidence used

This quality bar is aligned with:

- Roblox official Studio MCP docs, which emphasize exact client config, verification, and multi-client support
- Blender official MCP guidance, which emphasizes local installation, add-on setup, and explicit security warnings
- MCP security best practices, which emphasize consent, stdio-first local usage, least privilege, and loopback-safe local server design
