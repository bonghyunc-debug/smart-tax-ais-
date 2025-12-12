# CGW (Capital Gain Wizard) 아키텍처 개요

새 위저드는 기존 Smart Tax 계산 엔진을 재사용하면서, 신고 흐름을 단계별 UX로 분리하기 위해 모듈형 구조를 갖는다. 이번 스캐폴딩은 최소 기능을 목표로 하며, 각 모듈은 확장 가능성을 고려한 분리도를 유지한다.

## 모듈 구성
- **app/**: 라우팅 진입점. `CgwApp`이 Wizard 컨테이너를 내보내며 `/cgw` 경로에 연결된다.
- **wizard/**: 화면 컴포넌트와 레이아웃. `WizardContainer`가 상태를 주입하고 스텝별 Screen 컴포넌트를 렌더링한다.
- **store/**: `WizardProvider`가 Draft 상태와 이동 제어를 관리한다. 각 스텝은 섹션별 partial 업데이트만 수행하며, 필수 필드 검증을 통해 다음 단계 버튼을 제어한다.
- **domain/**: `CapitalGainTransaction` 및 Draft 타입 정의. 신고/납세자/자산/거래/금액/감면 정보를 구조화했다.
- **scenario/**: 룰 테이블 뼈대. `evaluateScenario`가 Draft를 받아 시나리오 키를 평가하며, `uiPolicy`가 필드 노출·필수 정책을 담는다.
- **adapters/**: 새 도메인 모델을 기존 `TaxState`로 변환하는 `toLegacyTaxState`. 최소 필수 필드 매핑 후 기존 `calculateTax`를 호출할 수 있게 한다.
- **__tests__/**: 시나리오 평가 함수에 대한 단위 테스트.

## 상태 흐름
1. 사용자가 스텝별 입력을 진행하면 `WizardStore`가 Draft를 갱신한다.
2. 스텝 이동 시 `validateStep`이 필수 필드를 검사하여 미입력 시 이동을 막는다.
3. `evaluateScenario`가 Draft 상태를 분석해 시나리오 키를 노출하고, UI 정책에서 토지 면적 등 시나리오별 필드를 표시한다.
4. Result 단계에서 Draft를 `toLegacyTaxState`로 변환하고 기존 `calculateTax`를 호출한다. 결과 요약을 화면에 표시해 Tax Engine 재사용 경로를 검증한다.

## 확장 포인트
- **시나리오 확장**: `scenarioKey`를 추가하고 `evaluateScenario` 규칙 및 `uiPolicy` 필드를 확장한다.
- **검증 고도화**: `validateStep`에 스텝별 정교한 로직과 에러 메시지를 추가하고, 입력 컴포넌트 단위의 유효성 피드백을 제공한다.
- **서비스 연동**: `services/` 디렉터리에 PDF 출력, 신고서 전송, 저장 API 어댑터 등을 추가한다.
- **상태 관리 교체**: 필요 시 Zustand/Recoil 등으로 교체할 수 있도록 `WizardProvider`의 인터페이스를 유지한다.
