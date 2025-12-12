# CGW 진입점 Feature Flag

새로운 양도소득 Wizard(CGW) 진입점은 **환경변수 `FEATURE_CGW`가 `true`일 때만** 활성화됩니다. 기본값은 정의되지 않음/`false`이며, 이 경우 `/cgw`로 접근해도 기존 앱에 영향 없이 안내 화면만 노출됩니다.

## 실행 예시
- 기본 OFF 상태(기존 앱만 실행):
  ```bash
  npm run dev
  ```
- CGW를 ON으로 테스트:
  ```bash
  FEATURE_CGW=true npm run dev
  ```
