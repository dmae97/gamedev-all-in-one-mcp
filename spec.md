# Local Control Plane Spec

## Problem

현재 저장소는 stdio MCP 서버 중심 구조라 로컬 사용자가 provider 선택, 로컬 CLI agent 실행, Roblox/Blender 자동 감지, skills/MCP 구성 확인을 한 곳에서 다루기 어렵다.

## Goals

- 기존 stdio MCP 서버를 유지한다.
- 로컬 전용 second entrypoint를 추가한다.
- `.env` 또는 환경변수에서 provider 설정을 읽는다.
- Roblox, Luau, Blender 상태를 자동 감지해 보여준다.
- API provider와 로컬 CLI agent provider를 한 API/UI에서 선택 가능하게 한다.
- local config로 skills/MCP registry를 붙일 수 있게 한다.

## Non-Goals

- 원격 배포
- 기존 MCP tool 동작 변경
- Blender/Roblox workflow 자체 확장
- full auth/settings UI

## Users / Use Cases

- 로컬 사용자: 브라우저로 상태 확인, provider 선택, prompt 실행
- 로컬 사용자: Codex/Claude Code 설치 여부와 Roblox/Blender 감지 상태 확인
- 로컬 사용자: skills/MCP registry를 config 파일로 관리

## Constraints

- local-only
- current TypeScript/Node stack 유지
- 최소 의존성
- 기존 `src/index.ts` stdio entrypoint 보존

## Acceptance Criteria

1. `npm run local` 또는 동등한 local entrypoint로 loopback-only 웹 서버가 뜬다.
2. 상태 API가 Roblox/Luau/Blender 감지 결과와 provider availability를 반환한다.
3. `.env` 기반 provider selection이 동작한다.
4. API provider(OpenAI/Anthropic)와 CLI provider(Codex/Claude Code) 중 설치/설정된 provider만 실행 가능하다.
5. local config 파일에서 skills/MCP entries를 읽어 상태 API와 UI에 노출한다.
6. 기존 `npm start` stdio MCP 서버는 그대로 유지된다.

## Risks

- CLI agent 명령행 인터페이스 차이
- API key 미설정 환경
- provider별 출력 형식 차이
- 로컬 control plane과 stdio MCP의 역할 혼동

## Open Questions

- 없음. 이번 구현은 최소 local control plane으로 한정한다.
