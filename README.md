<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1A0M8k8VBWeaLOlaMG4nkr12lidpp-s9e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CGW Feature Flag

새로운 `/cgw` 위저드 진입점은 기본적으로 비활성화되어 있으며, `FEATURE_CGW=true`를 설정한 경우에만 사용할 수 있습니다. 예시는 아래와 같습니다.

```bash
# 기본 OFF 실행(기존 앱만 노출)
npm run dev

# CGW ON 실행
FEATURE_CGW=true npm run dev
```
