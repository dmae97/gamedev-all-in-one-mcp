# Runtime Troubleshooting

## Luau runtime handshake가 안 잡히는 경우

Studio-side runtime은 아래 endpoint를 기준으로 동작합니다.

- `POST /runtime/handshake`
- `GET /runtime/health`
- `GET /runtime/commands/next?timeoutMs=25000`
- `POST /runtime/commands/result`

기본 bridge 주소는 다음과 같습니다.

- `http://127.0.0.1:3002`

## 기대되는 handshake payload

```json
{
  "protocolVersion": 1,
  "runtimeName": "roblox-all-in-one-mcp-runtime",
  "runtimeVersion": "0.1.0",
  "bridgeMode": "http-long-poll",
  "capabilities": ["run_code"],
  "lastSeenAt": "2026-04-12T12:34:56.000Z"
}
```

`lastSeenAt`가 오래되면 MCP shell은 runtime을 stale로 판단합니다.

## 첫 mutation workflow

현재 첫 mutation workflow는 다음 두 개입니다.

- `roblox_run_code`
- `roblox_create_workspace_part`

이 툴들은 runtime이 healthy한 경우에만 command를 queue에 넣고, optional wait 시간 안에 response가 오면 결과까지 반환합니다.

## Studio-side runtime 구현 위치

현재 Luau consumer 구현은 여기에 있습니다.

- `runtime/roblox-studio-plugin/src/runtime_loop.luau`

이 파일은 다음을 처리합니다.

- 주기적인 handshake POST
- long-poll command fetch
- `run_code` 처리
- `create_workspace_part` 처리
- result POST
