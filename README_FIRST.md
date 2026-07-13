# DEEPFRAME VdoCipher v2 — 처음 설치 순서

## 1) GitHub에 업로드
이 ZIP을 압축 해제한 뒤, 안의 파일과 `functions` 폴더를 전부 저장소 최상단에 업로드합니다.

저장소 첫 화면에서:
- `uploading an existing file`
- 압축을 푼 모든 파일/폴더 드래그
- 아래 `Commit changes`

중요: ZIP 자체를 올리는 것이 아닙니다.

## 2) Cloudflare Pages와 GitHub 연결
Cloudflare:
1. Workers & Pages
2. Create application
3. 화면 아래 `Looking to deploy Pages? Get started`
4. Connect to Git
5. GitHub 저장소 `deepframe-education` 선택

빌드 설정:
- Framework preset: None
- Build command: 비워두기
- Build output directory: `/` 또는 비워둘 수 있으면 비워두기
- Root directory: `/`

## 3) 처음 배포 후 비밀값 4개 등록
Cloudflare Pages 프로젝트:
Settings → Variables and Secrets 또는 Environment variables

Production과 Preview 양쪽에 아래를 등록합니다.

- `VDOCIPHER_API_SECRET`
  - VdoCipher Config에서 만든 API Secret
  - 절대 GitHub 파일에 쓰지 마세요.
- `SITE_PASSCODE`
  - 시청자에게 전달할 공통 접속코드
- `SESSION_SECRET`
  - 예: 영문/숫자/특수문자 포함 40자 이상의 무작위 문자열
- `PLAYBACK_WHITELIST`
  - 테스트 중: `deepframekr.art|프로젝트명.pages.dev`
  - 도메인 연결 완료 후: `deepframekr.art`

등록 뒤 새 배포(Retry deployment)를 실행합니다.

## 4) VdoCipher 영상 ID 8개 반영
실제 영상 ID는 아래 두 파일에 모두 넣습니다.

1. `courses.js`
2. `functions/api/otp.js`

GitHub 웹에서 파일을 열고 연필(Edit) 버튼으로 수정한 뒤 Commit하면 Cloudflare가 자동 재배포합니다.

## 5) deepframekr.art 연결
Cloudflare Pages 프로젝트:
Custom domains → Set up a custom domain → `deepframekr.art`

도메인을 Canva에서 샀기 때문에 DNS 변경 안내가 나오면 Canva 도메인 설정에서 Cloudflare가 제시한 레코드를 입력해야 합니다.

## 보안 구조
- 공통 접속코드
- 12시간 로그인 쿠키
- 영상 클릭 때마다 서버에서 5분짜리 VdoCipher OTP 생성
- API Secret은 Cloudflare Secret에만 저장
- 허용된 영상 ID만 OTP 발급
- 재생 도메인 제한
- 움직이는 고정 보안 워터마크
- VdoCipher DRM

공통 접속코드가 전달되는 것까지 막으려면 사용자별 계정이 필요합니다. 현재 구성은 로그인 절차를 최소화하면서 링크만 공유하는 것보다 강한 보안을 제공하는 절충안입니다.
