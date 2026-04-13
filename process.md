# Process

## 현재 상태

- 프로젝트: `gamedev-all-in-one`
- 라이선스: `AGPL-3.0-only`
- 현재 단계: 아키텍처 + 파운데이션 마일스톤 완료
- 현재 공개 표면: 단일 로컬 stdio MCP 서버

## 이미 실제로 구현된 것

현재 저장소에서 구현되고 검증된 항목은 다음과 같습니다.

- Spec Kit 프로젝트 구조가 초기화되어 있고 실제로 사용 중임
- 아키텍처, 계획, 리서치, 계약 문서가 작성되어 있음
- MCP 서버 부트스트랩이 `src/index.ts`에서 동작함
- 파운데이션 툴이 살아 있음:
  - `project_init`
  - `inspect_project`
  - `doctor`
  - `list_capabilities`
  - `roblox_run_code`
  - `roblox_create_workspace_part`
- 로컬 프로젝트 manifest 생성과 inspection이 `.roblox-mcp/project.json`을 통해 동작함
- Roblox, Luau companion runtime, Blender capability detection이 서버에 연결되어 있음
- loopback HTTP 기반 Luau runtime bridge가 MCP shell과 함께 올라감
- Luau runtime handshake와 health-check 경로가 구현되어 있음
- Studio-side Luau consumer 코드가 `runtime/roblox-studio-plugin/src/runtime_loop.luau`에 구현되어 있음
- Studio-side plugin bootstrap 파일이 `runtime/roblox-studio-plugin/src/plugin_bootstrap.luau`에 구현되어 있음
- 최소 Roblox Studio Luau companion scaffold가 `runtime/roblox-studio-plugin/` 아래에 존재함

## 현재 아키텍처 상태

```text
MCP Client
  -> stdio MCP server                     [구현됨]
      -> project manifest/state          [구현됨]
      -> doctor/capabilities             [구현됨]
      -> Roblox connector detection      [구현됨]
      -> Luau runtime detection          [구현됨]
      -> Luau runtime handshake          [구현됨]
      -> Luau runtime health-check       [구현됨]
      -> command dispatch contract       [구현됨]
      -> Blender connector detection     [구현됨]
      -> Roblox workflow execution       [부분 구현]
      -> Blender asset sync              [미구현]
```

## 현재 마일스톤 결과

이 저장소는 이제 단순 scaffold 단계를 넘어섰습니다.

현재 마일스톤은 setup과 inspection 레이어를 넘어서 runtime boundary 진입까지 완료했습니다. 지금 프로젝트는 자기 manifest를 직접 생성할 수 있고, 현재 상태를 inspection할 수 있으며, Roblox, Luau companion runtime, Blender 세 런타임 표면을 구조화된 진단 정보로 노출할 수 있습니다. 또한 Luau runtime과의 live handshake와 health-check, 첫 Roblox mutation workflow, 그리고 Studio-side consumer 루프까지 저장소 안에 구현되어 있습니다.

## 다음 아키텍처 단계

다음 아키텍처 마일스톤은 Luau companion 레이어를 shell 쪽 구현에서 실제 Studio-side plugin 구현으로 밀어넣는 데 집중해야 합니다.

즉 다음이 필요합니다.

1. Roblox mutation workflow를 `roblox_create_workspace_part`보다 더 넓은 scene/UI/script workflow로 확장
2. Studio-side runtime consumer를 실제 plugin packaging으로 마무리
3. Blender asset sync를 같은 manifest/runtime 모델에 연결
4. client config 문서를 더 넓은 클라이언트 집합으로 확장

## 검증 기록

이미 실행된 최근 수동 QA는 다음과 같습니다.

- `npm run build` 통과
- MCP tool 등록 결과:
  - `project_init`
  - `inspect_project`
  - `doctor`
  - `list_capabilities`
- `roblox_run_code`
- `project_init`가 `.roblox-mcp/project.json` 생성
- `inspect_project`가 파싱된 manifest와 capability 상태 반환
- `doctor`가 구조화된 missing prerequisites 반환
- `list_capabilities`가 manifest, Roblox, Luau, Blender, workflow 상태 반환
- live handshake와 command dispatch를 사용하는 `roblox_run_code`가 응답을 반환함
- live handshake와 command dispatch를 사용하는 `roblox_create_workspace_part`도 shell 경로에서 검증 가능함

## 현재 제약

현재 핵심 부족분은 MCP shell 쪽이 아닙니다.

부족한 부분은 production-ready Studio-side plugin packaging과 더 넓은 Roblox mutation workflow입니다. shell 쪽 handshake와 dispatch는 operational 단계로 진입했고, Luau side도 consumer와 bootstrap 코드까지 들어갔지만, 아직 실제 배포 가능한 plugin packaging 단계는 아닙니다.

## 기준 문서

- 아키텍처: `docs/architecture.md`
