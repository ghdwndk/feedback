# CLASS FEEDBACK

수업 만족도 조사 웹앱 (HTML/CSS/JS + Supabase).

- Vercel 환경변수: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (빌드 시 `public/config.js` 생성)
- 관리자 계정: Supabase Dashboard → Authentication → Users → Add user → Create new user
- DB: `votes` 테이블 + RLS (anon: INSERT만 / authenticated: SELECT, INSERT, DELETE)
