const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = window.APP_CONFIG || {};
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const views = ['student', 'login', 'admin'];
const show = (name) => views.forEach((v) => ($('view-' + v).hidden = v !== name));

const ITEMS = [
  { key: 'satisfied', label: '😊 만족', color: '#22c55e' },
  { key: 'neutral', label: '😐 보통', color: '#f59e0b' },
  { key: 'unsatisfied', label: '😞 불만족', color: '#ef4444' },
];

// ----- 학생 -----
document.querySelectorAll('.vote').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const buttons = document.querySelectorAll('.vote');
    const msg = $('student-msg');
    buttons.forEach((b) => (b.disabled = true));
    msg.className = 'msg';
    msg.textContent = '';
    const { error } = await db.from('votes').insert({ rating: btn.dataset.rating });
    if (error) {
      msg.className = 'msg error';
      msg.textContent = '저장에 실패했습니다. 다시 시도해 주세요.';
    } else {
      msg.textContent = '투표가 완료되었습니다. 감사합니다.';
    }
    buttons.forEach((b) => (b.disabled = false));
  });
});

// ----- 관리자 로그인 -----
$('btn-admin').addEventListener('click', async () => {
  const { data } = await db.auth.getSession();
  if (data.session) { show('admin'); loadResults(); } else show('login');
});
$('btn-back').addEventListener('click', () => show('student'));

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('login-msg').textContent = '';
  const { error } = await db.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value,
  });
  $('password').value = '';
  if (error) { $('login-msg').textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; return; }
  show('admin');
  loadResults();
});

$('btn-logout').addEventListener('click', async () => {
  await db.auth.signOut();
  $('student-msg').textContent = '';
  show('student');
});

// ----- 결과 -----
async function loadResults() {
  $('admin-msg').textContent = '';
  const counts = { satisfied: 0, neutral: 0, unsatisfied: 0 };
  // 행 전체를 내려받지 않고 항목별 개수만 조회
  const results = await Promise.all(ITEMS.map((i) =>
    db.from('votes').select('id', { count: 'exact', head: true }).eq('rating', i.key)));
  for (let i = 0; i < ITEMS.length; i++) {
    if (results[i].error) { $('admin-msg').textContent = '결과를 불러오지 못했습니다.'; return; }
    counts[ITEMS[i].key] = results[i].count || 0;
  }
  render(counts);
}

function render(counts) {
  const total = ITEMS.reduce((s, i) => s + counts[i.key], 0);
  $('total').textContent = total;
  $('bars').innerHTML = ITEMS.map((i) => {
    const pct = total ? (counts[i.key] / total) * 100 : 0;
    return `<div class="bar-row">
      <span class="bar-label">${i.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${i.color}"></div></div>
      <span class="bar-val">${counts[i.key]}표 (${pct.toFixed(1)}%)</span>
    </div>`;
  }).join('');
}

$('btn-refresh').addEventListener('click', loadResults);

$('btn-reset').addEventListener('click', async () => {
  if (!confirm('모든 투표 결과를 초기화하시겠습니까? 삭제된 결과는 복구할 수 없습니다.')) return;
  const { error } = await db.from('votes').delete().not('id', 'is', null);
  if (error) { $('admin-msg').textContent = '초기화에 실패했습니다.'; return; }
  render({ satisfied: 0, neutral: 0, unsatisfied: 0 });
});

// 세션이 만료/로그아웃되면 학생 화면으로
db.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') show('student');
});
