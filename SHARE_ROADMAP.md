# GCOO 스펙 타임라인 로드맵 공유 방법

다른 사람이 **로드맵 페이지**를 볼 수 있는 링크를 만드는 방법입니다.

---

## 1. 로컬에서만 볼 때

프론트엔드 개발 서버를 띄운 뒤 아래 주소로 접속하면 됩니다.

```bash
cd frontend && npm run dev
```

**로컬 링크:** http://localhost:5173/roadmap.html

---

## 2. 인터넷에 공개 링크 만들기

### 방법 A – GitHub Pages (추천)

1. 이 프로젝트를 **GitHub 저장소**에 push합니다.
2. 저장소 **Settings** → **Pages** 이동.
3. **Source**: "Deploy from a branch" 선택.
4. **Branch**: `main` (또는 사용 중인 브랜치), **Folder**: `/docs` 선택 후 Save.
5. 몇 분 후 아래 주소로 접속 가능합니다.

   **공개 링크:** `https://<GitHub사용자명>.github.io/coupon_simulator/roadmap.html`

   예: `https://hansnn.github.io/coupon_simulator/roadmap.html`

로드맵 HTML 파일은 이미 `docs/roadmap.html`에 있으므로, push만 하면 됩니다.

---

### 방법 B – Netlify Drop (가입 없이 빠르게)

1. [https://app.netlify.com/drop](https://app.netlify.com/drop) 접속.
2. **`frontend/public`** 폴더 전체를 드래그해서 올립니다.
   - 또는 `frontend/public` 안의 파일들만 모아서 zip으로 압축한 뒤 zip을 올립니다.
3. 배포가 끝나면 Netlify가 **랜덤 URL**을 줍니다.
   - 예: `https://random-name-12345.netlify.app/roadmap.html`

이 URL을 그대로 공유하면 됩니다.

---

### 방법 C – Vercel로 프론트엔드 배포

1. [vercel.com](https://vercel.com)에서 GitHub 연동 후 이 저장소를 import.
2. **Root Directory**를 `frontend`로 설정하고 배포.
3. 배포 후 주소는 예: `https://coupon-simulator-xxx.vercel.app/roadmap.html`

---

## 파일 위치

| 용도           | 경로                          |
|----------------|-------------------------------|
| 프론트 빌드/로컬 | `frontend/public/roadmap.html` |
| GitHub Pages   | `docs/roadmap.html`           |

두 파일 내용은 동일합니다. GitHub Pages를 쓰면 `docs/roadmap.html`만 있으면 됩니다.
