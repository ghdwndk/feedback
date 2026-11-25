// Vercel 빌드 시 환경변수를 정적 config.js로 생성 (공개 가능한 값만 사용)
const fs = require('fs');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}
fs.writeFileSync(
  'public/config.js',
  `window.APP_CONFIG = ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key })};\n`
);
console.log('public/config.js generated');
