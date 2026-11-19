/*
 * Browny – phần thưởng dùng chung cho mọi trang: chuỗi ngày học, XP, thành tựu và lời động viên của Nie.
 * Lưu trong localStorage "browny-rewards-v1" (trang chính, Luyện nghe, Đọc hiểu, Từ vựng cùng một trang web nên dùng chung).
 *
 * API:
 *   BrownyRewards.answer(ok)                       – gọi sau mỗi câu trả lời trong bài luyện (đếm chuỗi đúng liên tiếp)
 *   BrownyRewards.finish({ kind, correct, total })  – gọi khi xong một bài; hiện màn chúc mừng
 *        kind: 'structure' | 'listening' | 'reading' | 'ets' | 'vocab' | 'quiz'
 *   BrownyRewards.summary()                        – { streak, best, xp, totals }
 *   BrownyRewards.greeting()                       – lời chào trong ngày
 *   BrownyRewards.badgesHTML()                     – lưới huy hiệu cho trang chính
 */
(function () {
  const KEY = 'browny-rewards-v1';
  const DAY = 86400000;
  const dayStr = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const today = () => dayStr(Date.now());
  const yesterday = () => dayStr(Date.now() - DAY);

  let S = { streak: 0, best: 0, lastDay: '', xp: 0, combo: 0, bestCombo: 0, greeted: '',
    totals: { lessons: 0, correct: 0, answered: 0, perfect: 0, kinds: {} }, badges: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); S = { ...S, ...o, totals: { ...S.totals, ...(o.totals || {}) } }; } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  // A streak still counts today if the last study day was yesterday; older than that, it has lapsed.
  const liveStreak = () => (S.lastDay === today() || S.lastDay === yesterday()) ? S.streak : 0;
  function touch() {
    const t = today();
    if (S.lastDay === t) return false;
    S.streak = S.lastDay === yesterday() ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak);
    S.lastDay = t;
    return true;
  }

  /* ---------- Nie's messages ---------- */
  const NIE = {
    perfect: ['Mẹ ơi mẹ giỏi quá!', 'Đúng hết luôn! Nie tự hào về mẹ lắm!', 'Mẹ là số một của Nie!', 'Mẹ ơi, điểm tuyệt đối luôn kìa!', 'Mẹ siêu quá, Nie thương mẹ nhiều!'],
    good: ['Hôm nay mẹ giỏi lắm!', 'Mẹ ơi mẹ giỏi quá!', 'Mẹ làm tốt lắm, Nie thương mẹ!', 'Mẹ tiến bộ nhiều lắm đó!', 'Nie biết mẹ làm được mà!'],
    ok: ['Mẹ ơi cố lên!', 'Mẹ làm được mà, Nie tin mẹ!', 'Từng chút một thôi mẹ ơi, mẹ đang tiến bộ đó!', 'Mẹ học chăm quá, Nie thương mẹ!'],
    low: ['Không sao đâu, thất bại là mẹ thành công!', 'Nie yêu mẹ lắm, mẹ cố lên!', 'Sai thì mình học lại thôi mẹ ơi!', 'Mẹ nghỉ uống nước chút rồi làm tiếp nha, Nie ở đây cổ vũ mẹ!', 'Lần sau mẹ sẽ làm tốt hơn, Nie tin mẹ!'],
    combo: ['Mẹ đúng {n} câu liền luôn!', 'Mẹ ơi {n} câu liên tiếp, quá đỉnh!', 'Chuỗi {n} câu đúng, mẹ giỏi quá!'],
    streak: ['Mẹ học {n} ngày liên tiếp rồi đó!', 'Chuỗi {n} ngày, Nie phục mẹ luôn!', '{n} ngày không nghỉ, mẹ kiên trì quá!'],
    hello: ['Chào mẹ! Hôm nay mình học một chút nha, Nie cổ vũ mẹ!', 'Mẹ ơi cố lên! Nie yêu mẹ lắm!', 'Mẹ ơi, học xong Nie thơm mẹ một cái nha!', 'Hôm nay mẹ cũng sẽ giỏi lắm cho xem!'],
    back: ['Mẹ quay lại rồi! Nie nhớ mẹ lắm, mình học tiếp nha!', 'Không sao đâu mẹ, mình bắt đầu lại từ hôm nay nha!'],
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fill = (s, n) => s.replace('{n}', n);

  /* ---------- Badges ---------- */
  const ICONS = {
    flame: '<path d="M12 2c1 4 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    star: '<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/>',
    trophy: '<path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zM6 7v1a2 2 0 0 0 1 1.7V7zm11 0v2.7A2 2 0 0 0 18 8V7z"/>',
    heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    target: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
    book: '<path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z"/>',
    ear: '<path d="M4 14v-2a8 8 0 0 1 16 0v2h-3v6h1a2 2 0 0 0 2-2v-4M4 14h3v6H6a2 2 0 0 1-2-2z"/>',
    cards: '<path d="M4 7h12v14H4zM8 3h12v14h-2V5H8z"/>',
    bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
  };
  const T = () => S.totals, K = k => (S.totals.kinds[k] || 0);
  const BADGES = [
    { id: 'first', name: 'Bước đầu tiên', desc: 'Hoàn thành bài học đầu tiên', icon: 'heart', color: '#E9705E', ok: () => T().lessons >= 1 },
    { id: 'streak3', name: 'Ba ngày chăm chỉ', desc: 'Học 3 ngày liên tiếp', icon: 'flame', color: '#F2884B', ok: () => S.best >= 3 },
    { id: 'streak7', name: 'Một tuần bền bỉ', desc: 'Học 7 ngày liên tiếp', icon: 'flame', color: '#E9705E', ok: () => S.best >= 7 },
    { id: 'streak14', name: 'Hai tuần kiên trì', desc: 'Học 14 ngày liên tiếp', icon: 'flame', color: '#C2410C', ok: () => S.best >= 14 },
    { id: 'streak30', name: 'Một tháng không nghỉ', desc: 'Học 30 ngày liên tiếp', icon: 'flame', color: '#9A3412', ok: () => S.best >= 30 },
    { id: 'perfect1', name: 'Điểm tuyệt đối', desc: 'Đúng hết một bài (từ 5 câu trở lên)', icon: 'star', color: '#F2B654', ok: () => T().perfect >= 1 },
    { id: 'perfect5', name: 'Năm lần tuyệt đối', desc: 'Đúng hết 5 bài', icon: 'star', color: '#D99A35', ok: () => T().perfect >= 5 },
    { id: 'lessons10', name: 'Mười bài học', desc: 'Hoàn thành 10 bài', icon: 'trophy', color: '#7B4B2E', ok: () => T().lessons >= 10 },
    { id: 'lessons50', name: 'Năm mươi bài', desc: 'Hoàn thành 50 bài', icon: 'trophy', color: '#5A3420', ok: () => T().lessons >= 50 },
    { id: 'correct100', name: '100 câu đúng', desc: 'Trả lời đúng 100 câu', icon: 'target', color: '#4FB98F', ok: () => T().correct >= 100 },
    { id: 'correct500', name: '500 câu đúng', desc: 'Trả lời đúng 500 câu', icon: 'target', color: '#2F9468', ok: () => T().correct >= 500 },
    { id: 'correct1000', name: '1000 câu đúng', desc: 'Trả lời đúng 1000 câu', icon: 'target', color: '#1E6E4C', ok: () => T().correct >= 1000 },
    { id: 'combo10', name: 'Mười câu liền', desc: 'Đúng 10 câu liên tiếp', icon: 'bolt', color: '#F2B654', ok: () => S.bestCombo >= 10 },
    { id: 'listener', name: 'Đôi tai thính', desc: 'Làm xong một đề Luyện nghe 50 câu', icon: 'ear', color: '#3E7CC0', ok: () => K('listening') >= 1 },
    { id: 'reader', name: 'Mọt sách nhỏ', desc: 'Làm xong 3 bài Đọc hiểu', icon: 'book', color: '#2F9468', ok: () => K('reading') >= 3 },
    { id: 'ets', name: 'Thi thử như thật', desc: 'Chấm xong một đề Reading ETS', icon: 'book', color: '#7B4B2E', ok: () => K('ets') >= 1 },
    { id: 'vocab', name: 'Kho từ vựng', desc: 'Học xong 5 buổi từ vựng', icon: 'cards', color: '#C48A1E', ok: () => K('vocab') + K('quiz') >= 5 },
  ];
  function checkBadges() {
    const fresh = [];
    BADGES.forEach(b => { if (!S.badges[b.id] && b.ok()) { S.badges[b.id] = today(); fresh.push(b); } });
    return fresh;
  }
  const svg = (icon, color, size = 26) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" aria-hidden="true">${ICONS[icon]}</svg>`;

  /* ---------- Styles (scoped, use page tokens when present) ---------- */
  const css = `
  .bw-ov{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px max(16px,env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));background:rgba(30,20,14,.55);backdrop-filter:blur(4px);animation:bwFade .25s both}
  @keyframes bwFade{from{opacity:0}}
  .bw-card{position:relative;width:min(400px,100%);max-height:100%;overflow:auto;background:var(--surface,#fff);color:var(--fg,#3B2A21);border-radius:28px;padding:22px 20px 20px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;box-shadow:0 10px 0 var(--line,#E8DDD4),0 30px 60px rgba(0,0,0,.25);animation:bwPop .55s cubic-bezier(.3,1.6,.5,1) both;font-family:var(--font-body,"Nunito",system-ui,sans-serif)}
  @keyframes bwPop{from{transform:scale(.6) translateY(30px);opacity:0}}
  .bw-bear{width:120px;height:132px;animation:bwHop 1.2s cubic-bezier(.3,1.6,.5,1) infinite alternate}
  @keyframes bwHop{from{transform:translateY(0)}to{transform:translateY(-8px)}}
  .bw-say{position:relative;background:var(--surface-2,#F3ECE6);border-radius:18px;padding:12px 16px;font-weight:800;font-size:18px;line-height:1.35;font-family:var(--font-display,"Baloo 2",system-ui,sans-serif)}
  .bw-say::before{content:"";position:absolute;top:-9px;left:50%;margin-left:-9px;border:9px solid transparent;border-top:0;border-bottom-color:var(--surface-2,#F3ECE6)}
  .bw-from{font-size:12.5px;font-weight:800;color:var(--fg-soft,#87736A);letter-spacing:.4px}
  .bw-score{font-family:var(--font-display,"Baloo 2",system-ui,sans-serif);font-size:32px;font-weight:700;color:var(--brown,#7B4B2E);line-height:1}
  .bw-xp{display:inline-flex;gap:6px;align-items:center;padding:4px 12px;border-radius:999px;background:#FDF0D5;color:#9A6A12;font-weight:800;font-size:14px}
  .bw-streak{display:flex;gap:8px;align-items:center;padding:8px 14px;border-radius:14px;background:#FFE9DA;color:#C2410C;font-weight:800;font-size:15px}
  .bw-streak svg{animation:bwFlick 1.2s ease-in-out infinite}
  @keyframes bwFlick{50%{transform:scale(1.15,.92) rotate(-4deg)}}
  .bw-badges{display:flex;flex-direction:column;gap:8px;width:100%}
  .bw-badge{display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;text-align:left;padding:10px 12px;border-radius:16px;background:var(--surface-2,#F3ECE6);animation:bwSlide .5s cubic-bezier(.3,1.5,.5,1) both}
  .bw-badge .ic{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--surface,#fff);box-shadow:inset 0 0 0 3px currentColor}
  .bw-badge b{display:block;font-size:15px}.bw-badge span{font-size:12.5px;font-weight:700;color:var(--fg-soft,#87736A)}
  .bw-badge small{display:block;font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#D99A35}
  @keyframes bwSlide{from{transform:translateX(-20px);opacity:0}}
  .bw-btn{width:100%;padding:14px;border-radius:16px;border:0;cursor:pointer;font:inherit;font-weight:800;font-size:16px;background:var(--brown,#7B4B2E);color:#FFF8F2;box-shadow:0 5px 0 var(--brown-deep,#5A3420);display:flex;gap:8px;justify-content:center;align-items:center}
  .bw-btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--brown-deep,#5A3420)}
  .bw-heart{position:fixed;z-index:101;pointer-events:none;animation:bwFloat 2.4s ease-out forwards}
  @keyframes bwFloat{0%{transform:translateY(0) scale(.5);opacity:0}15%{opacity:1}100%{transform:translateY(-70vh) translateX(var(--dx)) scale(1.1) rotate(var(--rot));opacity:0}}
  .bw-conf{position:fixed;z-index:101;width:9px;height:9px;border-radius:3px;pointer-events:none;animation:bwBurst 1.1s cubic-bezier(.2,.7,.4,1) forwards}
  @keyframes bwBurst{to{transform:translate(var(--dx),var(--dy)) rotate(var(--rot));opacity:0}}
  .bw-toast{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));z-index:99;transform:translate(-50%,-30px);opacity:0;display:flex;gap:8px;align-items:center;padding:10px 16px;border-radius:999px;background:#FDF0D5;color:#7B4B2E;font-weight:800;font-size:14.5px;box-shadow:0 6px 20px rgba(0,0,0,.15);transition:.35s cubic-bezier(.3,1.5,.5,1);pointer-events:none;max-width:calc(100% - 32px);font-family:var(--font-body,"Nunito",system-ui,sans-serif)}
  .bw-toast.show{transform:translate(-50%,0);opacity:1}
  .bw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
  .bw-tile{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border-radius:18px;background:var(--surface,#fff);border:2px solid var(--line,#E8DDD4);text-align:center;font-weight:800;font-size:12px;line-height:1.25}
  .bw-tile .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--surface-2,#F3ECE6)}
  .bw-tile.locked{opacity:.45}.bw-tile.locked svg{filter:grayscale(1)}
  .bw-tile small{font-weight:700;color:var(--fg-soft,#87736A);font-size:10.5px}
  @media (prefers-reduced-motion:reduce){.bw-ov *,.bw-heart,.bw-conf{animation-duration:.001ms!important;animation-iteration-count:1!important}}
  `;
  function injectCSS() { if (document.getElementById('bw-css')) return; const s = document.createElement('style'); s.id = 'bw-css'; s.textContent = css; document.head.appendChild(s); }

  const BEAR = `<svg class="bw-bear" viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="196" rx="54" ry="30" fill="#8A5636"/><ellipse cx="100" cy="200" rx="30" ry="18" fill="#E9C9A8" opacity=".7"/>
    <circle cx="50" cy="52" r="27" fill="#8A5636"/><circle cx="50" cy="54" r="14" fill="#C08A63"/><circle cx="150" cy="52" r="27" fill="#8A5636"/><circle cx="150" cy="54" r="14" fill="#C08A63"/>
    <ellipse cx="100" cy="104" rx="74" ry="68" fill="#8A5636"/><ellipse cx="100" cy="134" rx="33" ry="25" fill="#E9C9A8"/>
    <ellipse cx="56" cy="124" rx="11" ry="7" fill="#F49A8E" opacity=".7"/><ellipse cx="144" cy="124" rx="11" ry="7" fill="#F49A8E" opacity=".7"/>
    <g fill="none" stroke="#2B1A12" stroke-width="4.5" stroke-linecap="round"><path d="M63 103 Q72 91 81 103"/><path d="M119 103 Q128 91 137 103"/></g>
    <ellipse cx="100" cy="123" rx="10" ry="7" fill="#2B1A12"/><path d="M89 133 Q100 133 111 133 Q109 149 100 149 Q91 149 89 133Z" fill="#7A2E2A" stroke="#2B1A12" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="44" cy="176" rx="14" ry="12" fill="#8A5636" transform="rotate(-30 44 176)"/><ellipse cx="156" cy="176" rx="14" ry="12" fill="#8A5636" transform="rotate(30 156 176)"/>
    <path d="M100 178c-8-8-20-2-14 8l14 12 14-12c6-10-6-16-14-8z" fill="#E9705E"/></svg>`;

  function hearts(n = 10) {
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div'); h.className = 'bw-heart';
      h.innerHTML = svg('heart', ['#E9705E', '#F49A8E', '#F2B654'][i % 3], 18 + Math.random() * 16);
      h.style.cssText = `left:${10 + Math.random() * 80}vw;bottom:-30px;--dx:${(Math.random() - .5) * 120}px;--rot:${(Math.random() - .5) * 60}deg;animation-delay:${Math.random() * .8}s`;
      document.body.appendChild(h); setTimeout(() => h.remove(), 3400);
    }
  }
  function confetti(n = 36) {
    const colors = ['#F2B654', '#4FB98F', '#E9705E', '#C08A63', '#3E7CC0'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'bw-conf';
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 150;
      c.style.cssText = `left:50vw;top:38vh;background:${colors[i % 5]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 60}px;--rot:${Math.random() * 720}deg;border-radius:${i % 2 ? '50%' : '3px'}`;
      document.body.appendChild(c); setTimeout(() => c.remove(), 1200);
    }
  }
  let toastT;
  function toast(text, icon = 'heart', color = '#E9705E') {
    injectCSS();
    let t = document.getElementById('bw-toast');
    if (!t) { t = document.createElement('div'); t.id = 'bw-toast'; t.className = 'bw-toast'; document.body.appendChild(t); }
    t.innerHTML = `${svg(icon, color, 20)}<span>Nie: ${text}</span>`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- Public API ---------- */
  const sfx = name => { try { window.BrownySound && BrownySound.play(name); } catch (e) {} };
  function answer(ok) {
    sfx(ok ? 'correct' : 'wrong');
    if (ok) {
      S.combo++; S.bestCombo = Math.max(S.bestCombo, S.combo);
      if ([3, 5, 10, 15, 20].includes(S.combo)) { setTimeout(() => sfx('combo'), 350); toast(fill(pick(NIE.combo), S.combo), 'bolt', '#D99A35'); }
    } else {
      if (S.combo >= 3) toast(pick(['Không sao đâu mẹ, mình làm tiếp nha!', 'Mẹ ơi cố lên!']));
      S.combo = 0;
    }
    save();
  }

  function finish({ kind, correct, total, onClose } = {}) {
    injectCSS();
    const t = S.totals;
    const newDay = touch();
    t.lessons++; t.correct += correct; t.answered += total;
    t.kinds[kind] = (t.kinds[kind] || 0) + 1;
    const ratio = total ? correct / total : 0, perfect = total >= 5 && correct === total;
    if (perfect) t.perfect++;
    const gained = correct * 10 + 20 + (perfect ? 50 : 0) + (newDay ? 30 : 0);
    S.xp += gained;
    const fresh = checkBadges();
    save();

    const tier = perfect ? 'perfect' : ratio >= .7 ? 'good' : ratio >= .5 ? 'ok' : 'low';
    const ov = document.createElement('div'); ov.className = 'bw-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Lời nhắn của Nie');
    ov.innerHTML = `<div class="bw-card">
      ${BEAR}
      <div class="bw-say">${pick(NIE[tier])}</div>
      <div class="bw-from">Nie nhắn mẹ</div>
      ${total ? `<div class="bw-score">${correct}/${total}</div>` : ''}
      <span class="bw-xp">${svg('star', '#D99A35', 16)}+${gained} XP</span>
      ${newDay && S.streak >= 2 ? `<div class="bw-streak">${svg('flame', '#F2884B', 22)}${fill(pick(NIE.streak), S.streak)}</div>` : newDay ? `<div class="bw-streak">${svg('flame', '#F2884B', 22)}Ngày học đầu tiên của chuỗi mới!</div>` : ''}
      ${fresh.length ? `<div class="bw-badges">${fresh.map((b, i) => `<div class="bw-badge" style="animation-delay:${.3 + i * .15}s;color:${b.color}"><span class="ic">${svg(b.icon, b.color, 26)}</span><div><small>Thành tựu mới</small><b style="color:var(--fg,#3B2A21)">${b.name}</b><span>${b.desc}</span></div></div>`).join('')}</div>` : ''}
      <button class="bw-btn" id="bwClose">${svg('heart', '#FFF8F2', 18)}Cảm ơn Nie</button>
    </div>`;
    document.body.appendChild(ov);
    if (tier === 'perfect' || tier === 'good' || fresh.length) confetti();
    sfx(tier === 'low' || tier === 'ok' ? 'soft' : 'celebrate');
    if (fresh.length) setTimeout(() => sfx('badge'), 1300);
    hearts(tier === 'low' ? 6 : 12);
    const close = () => { ov.remove(); if (onClose) onClose(); };
    ov.querySelector('#bwClose').onclick = close;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('#bwClose').focus({ preventScroll: true });
    return { gained, badges: fresh };
  }

  function greeting() {
    const t = today();
    const lapsed = S.lastDay && S.lastDay !== t && S.lastDay !== yesterday();
    const msg = lapsed ? pick(NIE.back) : liveStreak() >= 2 ? `${fill(pick(NIE.streak), liveStreak())} Hôm nay mình học tiếp nha!` : pick(NIE.hello);
    const first = S.greeted !== t; S.greeted = t; save();
    return { text: msg, first };
  }

  function badgesHTML() {
    injectCSS();
    return `<div class="bw-grid">${BADGES.map(b => { const got = S.badges[b.id];
      return `<div class="bw-tile ${got ? '' : 'locked'}" title="${b.desc}"><span class="ic">${svg(b.icon, b.color, 26)}</span>${b.name}<small>${got ? got.split('-').reverse().join('/') : b.desc}</small></div>`; }).join('')}</div>`;
  }

  // Offline support: only on the real site (GitHub Pages) or a local test server, never inside the Claude preview frame.
  if ('serviceWorker' in navigator && /(^|\.)github\.io$|^localhost$/.test(location.hostname)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  window.BrownyRewards = {
    answer, finish, greeting, badgesHTML, toast,
    nie: tier => pick(NIE[tier] || NIE.hello),
    summary: () => ({ streak: liveStreak(), best: S.best, xp: S.xp, totals: S.totals, badges: Object.keys(S.badges).length, badgeTotal: BADGES.length, studiedToday: S.lastDay === today() }),
  };
})();
