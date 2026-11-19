/*
 * Browny – âm thanh, tạo hoàn toàn bằng Web Audio API (không dùng file âm thanh nào).
 * Vì vậy không có vấn đề bản quyền, file rất nhẹ và chạy được khi offline.
 *
 * - Hiệu ứng: tap, correct, wrong, flip, combo, celebrate, badge, soft
 * - Nhạc nền "Browny Lo-fi": giai điệu được sinh ngẫu nhiên trên vòng hợp âm tươi sáng, 82 BPM, không lặp lại y hệt.
 * - Nút nốt nhạc nổi ở góc màn hình để bật/tắt nhạc nền, hiệu ứng và chỉnh âm lượng.
 * Cài đặt lưu trong localStorage "browny-sound-v1".
 *
 * API: BrownySound.play(name), BrownySound.music(on), BrownySound.settings()
 */
(function () {
  const KEY = 'browny-sound-v1';
  let P = { sfx: true, music: false, vol: 0.55 };
  try { const raw = localStorage.getItem(KEY); if (raw) P = { ...P, ...JSON.parse(raw) }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };

  let ctx = null, master, sfxBus, musicBus, noiseBuf;
  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = 1;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9 * P.vol; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- Building blocks ---------- */
  function tone(dest, { f, f2, type = 'sine', t, a = 0.005, d = 0.3, g = 0.3, lp }) {
    const o = ctx.createOscillator(), v = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(g, t + a);
    v.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    let out = v;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; v.connect(fl); out = fl; }
    o.connect(v); out.connect(dest);
    o.start(t); o.stop(t + a + d + 0.05);
  }
  function noise(dest, { t, d = 0.1, g = 0.2, type = 'bandpass', f = 2000, q = 1 }) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(v); v.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }
  const bell = (f, t, g = 0.22, d = 0.6) => { tone(sfxBus, { f, t, d, g }); tone(sfxBus, { f: f * 2.01, t, d: d * 0.6, g: g * 0.35 }); tone(sfxBus, { f: f * 3, t, d: d * 0.3, g: g * 0.12 }); };

  /* ---------- Sound effects ---------- */
  const SFX = {
    tap: t => tone(sfxBus, { f: 880, f2: 660, t, d: 0.05, g: 0.08, type: 'triangle' }),
    soft: t => tone(sfxBus, { f: 520, f2: 780, t, d: 0.12, g: 0.1, type: 'sine' }),
    correct: t => { bell(mtof(81), t, 0.2, 0.35); bell(mtof(88), t + 0.09, 0.22, 0.6); },
    wrong: t => { tone(sfxBus, { f: 300, f2: 210, t, d: 0.28, g: 0.16, type: 'triangle', lp: 1200 }); tone(sfxBus, { f: 240, f2: 170, t: t + 0.12, d: 0.3, g: 0.12, type: 'triangle', lp: 1000 }); },
    flip: t => noise(sfxBus, { t, d: 0.16, g: 0.12, type: 'bandpass', f: 1400, q: 0.7 }),
    combo: t => [76, 79, 84, 88].forEach((m, i) => bell(mtof(m), t + i * 0.07, 0.14, 0.3)),
    celebrate: t => {
      [72, 76, 79, 84].forEach((m, i) => { tone(sfxBus, { f: mtof(m), t: t + i * 0.11, d: 0.5, g: 0.16, type: 'triangle', lp: 3000 }); });
      [60, 64, 67, 72].forEach(m => tone(sfxBus, { f: mtof(m), t: t + 0.44, a: 0.03, d: 1.1, g: 0.07, type: 'sine' }));
      for (let i = 0; i < 6; i++) bell(mtof(91 + (i % 3) * 3), t + 0.5 + i * 0.06, 0.06, 0.4);
    },
    badge: t => { [84, 88, 91, 96, 91, 96].forEach((m, i) => bell(mtof(m), t + i * 0.08, 0.12, 0.5)); },
  };
  function play(name) {
    if (!P.sfx || !SFX[name]) return;
    if (!ensure()) return;
    try { SFX[name](ctx.currentTime + 0.01); } catch (e) {}
  }

  /* ---------- Background music: "Browny Lo-fi" ---------- */
  const BPM = 82, EIGHTH = 60 / BPM / 2, SWING = 0.055;
  // Bright progressions (voicings in MIDI). Section A: Cmaj7–Am7–Fmaj7–G6, section B: Fmaj7–Em7–Dm7–G7sus.
  const PROG = [
    [{ root: 48, pad: [60, 64, 67, 71] }, { root: 45, pad: [57, 60, 64, 67] }, { root: 41, pad: [57, 60, 64, 65] }, { root: 43, pad: [55, 59, 62, 64] }],
    [{ root: 41, pad: [57, 60, 64, 65] }, { root: 40, pad: [55, 59, 62, 64] }, { root: 38, pad: [57, 60, 62, 65] }, { root: 43, pad: [55, 60, 62, 65] }],
  ];
  const SCALE = [72, 74, 76, 79, 81, 84, 86, 88];
  let playing = false, timer = null, nextTime = 0, step = 0, bar = 0, mel = 3, melBus, delay;

  function setupMusicFx() {
    melBus = ctx.createGain(); melBus.gain.value = 1; melBus.connect(musicBus);
    delay = ctx.createDelay(1); delay.delayTime.value = EIGHTH * 1.5;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 1800;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    melBus.connect(delay); delay.connect(dl); dl.connect(fb); fb.connect(delay); dl.connect(wet); wet.connect(musicBus);
  }
  function scheduleStep(t) {
    const section = Math.floor(bar / 8) % 2, chord = PROG[section][bar % 4];
    const beat = step / 2, off = step % 2 === 1;
    const tt = off ? t + SWING : t;
    // Pad at the start of each bar.
    if (step === 0) chord.pad.forEach((m, i) => {
      tone(musicBus, { f: mtof(m) * (1 + (i % 2 ? 0.003 : -0.003)), t, a: 0.5, d: EIGHTH * 8 - 0.3, g: 0.035, type: 'triangle', lp: 1100 });
    });
    // Bass on beats 1 and 3 (and a pickup now and then).
    if (step === 0 || step === 4 || (step === 7 && Math.random() < 0.3)) tone(musicBus, { f: mtof(chord.root), t: tt, a: 0.01, d: EIGHTH * 1.8, g: 0.16, type: 'sine', lp: 600 });
    // Drums: soft kick, brushed snare, quiet hats.
    if (step === 0 || step === 5 && Math.random() < 0.5) tone(musicBus, { f: 120, f2: 45, t: tt, a: 0.002, d: 0.22, g: 0.32 });
    if (step === 2 || step === 6) noise(musicBus, { t: tt, d: 0.16, g: 0.07, type: 'bandpass', f: 1700, q: 0.8 });
    noise(musicBus, { t: tt, d: 0.04, g: off ? 0.018 : 0.03, type: 'highpass', f: 7000, q: 0.5 });
    // Melody: gentle random walk on the major pentatonic, more notes on strong beats.
    const p = beat % 1 === 0 ? 0.5 : 0.3;
    if (bar % 8 !== 7 && Math.random() < p) {
      mel = Math.max(0, Math.min(SCALE.length - 1, mel + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      let m = SCALE[mel];
      if (step === 0 && !chord.pad.some(x => (x - m) % 12 === 0)) m = chord.pad[2] + 12; // land on a chord tone at bar start
      tone(melBus, { f: mtof(m), t: tt, a: 0.008, d: 0.5, g: 0.075, type: 'triangle', lp: 2600 });
      tone(melBus, { f: mtof(m) * 2, t: tt, a: 0.004, d: 0.18, g: 0.015, type: 'sine' });
    }
  }
  function scheduler() {
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(nextTime);
      nextTime += EIGHTH;
      step = (step + 1) % 8;
      if (step === 0) bar++;
    }
  }
  function startMusic() {
    if (playing || !ensure()) return;
    if (!melBus) setupMusicFx();
    playing = true; step = 0; bar = 0;
    nextTime = ctx.currentTime + 0.1;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.7 * P.vol, ctx.currentTime + 2.5);
    timer = setInterval(scheduler, 30);
    updateUI();
  }
  function stopMusic() {
    if (!playing) return;
    playing = false;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => { if (!playing) clearInterval(timer); }, 900);
    updateUI();
  }
  function music(on) { P.music = on; save(); on ? startMusic() : stopMusic(); }
  function setVol(v) {
    P.vol = v; save();
    if (!ctx) return;
    sfxBus.gain.value = 0.9 * v;
    if (playing) musicBus.gain.setTargetAtTime(0.7 * v, ctx.currentTime, 0.1);
  }

  // Browsers only allow sound after a tap: resume music on the first touch of each page.
  const kick = () => { if (P.music) startMusic(); else if (P.sfx) ensure(); };
  addEventListener('pointerdown', kick, { once: true, capture: true });
  addEventListener('keydown', kick, { once: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (P.music || P.sfx) ctx.resume();
  });
  // A quiet tap on every button press.
  addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled && !b.closest('.bs-panel')) play('tap'); }, true);

  /* ---------- Floating control ---------- */
  const css = `
  .bs-fab{position:fixed;right:max(14px,env(safe-area-inset-right,0px));z-index:90;width:46px;height:46px;border-radius:50%;border:2px solid var(--line,#E8DDD4);background:var(--surface,#fff);color:var(--brown,#7B4B2E);display:grid;place-items:center;box-shadow:0 4px 0 var(--line,#E8DDD4);cursor:pointer;padding:0}
  .bs-fab svg{width:22px;height:22px}
  .bs-fab>*{pointer-events:none}
  .bs-fab.on{background:#FDF0D5;border-color:#F2B654}
  .bs-bars{display:flex;gap:2px;align-items:flex-end;height:16px}
  .bs-bars i{display:block;width:3px;border-radius:2px;background:currentColor;animation:bsBar .9s ease-in-out infinite}
  .bs-bars i:nth-child(2){animation-delay:.2s}.bs-bars i:nth-child(3){animation-delay:.4s}.bs-bars i:nth-child(4){animation-delay:.1s}
  @keyframes bsBar{0%,100%{height:4px}50%{height:16px}}
  .bs-panel{position:fixed;right:max(14px,env(safe-area-inset-right,0px));z-index:91;width:min(290px,calc(100vw - 28px));background:var(--surface,#fff);color:var(--fg,#3B2A21);border:2px solid var(--line,#E8DDD4);border-radius:20px;padding:14px;box-shadow:0 12px 30px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:12px;font-family:var(--font-body,"Nunito",system-ui,sans-serif);animation:bsIn .25s cubic-bezier(.3,1.5,.5,1)}
  @keyframes bsIn{from{transform:translateY(10px) scale(.95);opacity:0}}
  .bs-panel h4{margin:0;font-family:var(--font-display,"Baloo 2",system-ui,sans-serif);font-size:17px;font-weight:600}
  .bs-row{display:flex;justify-content:space-between;align-items:center;gap:10px;font-weight:700;font-size:14.5px}
  .bs-row small{display:block;font-weight:700;font-size:12px;color:var(--fg-soft,#87736A)}
  .bs-sw{position:relative;width:48px;height:28px;border-radius:999px;background:var(--surface-2,#F3ECE6);border:2px solid var(--line,#E8DDD4);cursor:pointer;flex:none;padding:0}
  .bs-sw::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.3,1.5,.5,1)}
  .bs-sw[aria-checked="true"]{background:#4FB98F;border-color:#4FB98F}
  .bs-sw[aria-checked="true"]::after{transform:translateX(20px)}
  .bs-vol{width:100%;accent-color:#7B4B2E}
  .bs-now{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:var(--surface-2,#F3ECE6);font-size:13px;font-weight:700;color:var(--fg-soft,#87736A)}
  .bs-now b{color:var(--fg,#3B2A21)}
  `;
  const NOTE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 18.5a3 3 0 1 1-2-2.83V5.5l12-2.5v12.5a3 3 0 1 1-2-2.83V7.6l-8 1.7z"/></svg>';
  let fab, panel;
  function bottomOffset() { return document.getElementById('nav') && !document.getElementById('nav').hidden ? 92 : 18; }
  function place() {
    if (!fab) return;
    // Step aside while a bottom sheet, word popup or celebration is on screen.
    const covered = document.querySelector('.sheet.show, .pop.show, .bw-ov');
    fab.style.display = covered ? 'none' : '';
    if (covered && panel) { panel.remove(); panel = null; }
    const b = bottomOffset();
    fab.style.bottom = `calc(${b}px + env(safe-area-inset-bottom, 0px))`;
    if (panel) panel.style.bottom = `calc(${b + 56}px + env(safe-area-inset-bottom, 0px))`;
  }
  function updateUI() {
    if (!fab) return;
    fab.classList.toggle('on', playing);
    fab.innerHTML = playing ? '<span class="bs-bars"><i></i><i></i><i></i><i></i></span>' : NOTE;
    fab.setAttribute('aria-label', playing ? 'Âm thanh: đang phát nhạc nền' : 'Mở cài đặt âm thanh');
    if (panel) renderPanel();
  }
  function renderPanel() {
    panel.innerHTML = `<h4>Âm thanh</h4>
      <div class="bs-row"><div>Nhạc nền<small>Lo-fi nhẹ nhàng để học</small></div><button class="bs-sw" id="bsMusic" role="switch" aria-checked="${P.music}" aria-label="Nhạc nền"></button></div>
      <div class="bs-row"><div>Hiệu ứng<small>Tiếng đúng, sai, lật thẻ, chúc mừng</small></div><button class="bs-sw" id="bsSfx" role="switch" aria-checked="${P.sfx}" aria-label="Hiệu ứng âm thanh"></button></div>
      <div><div class="bs-row" style="margin-bottom:4px"><span>Âm lượng</span><small>${Math.round(P.vol * 100)}%</small></div><input class="bs-vol" id="bsVol" type="range" min="0" max="1" step="0.05" value="${P.vol}" aria-label="Âm lượng"></div>
      ${playing ? '<div class="bs-now"><span class="bs-bars" style="color:#F2B654"><i></i><i></i><i></i><i></i></span><span>Đang phát <b>Browny Lo-fi</b>, giai điệu mới mỗi lần nghe</span></div>' : ''}`;
    panel.querySelector('#bsMusic').onclick = () => music(!P.music);
    panel.querySelector('#bsSfx').onclick = () => { P.sfx = !P.sfx; save(); if (P.sfx) { ensure(); play('soft'); } renderPanel(); };
    const vol = panel.querySelector('#bsVol');
    vol.oninput = () => { setVol(+vol.value); vol.previousElementSibling.querySelector('small').textContent = Math.round(P.vol * 100) + '%'; };
    vol.onchange = () => play('correct');
  }
  function togglePanel() {
    if (panel) { panel.remove(); panel = null; return; }
    panel = document.createElement('div'); panel.className = 'bs-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Cài đặt âm thanh');
    document.body.appendChild(panel); renderPanel(); place();
  }
  function mount() {
    if (fab) return;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    fab = document.createElement('button'); fab.className = 'bs-fab';
    fab.onclick = e => { e.stopPropagation(); ensure(); togglePanel(); };
    document.body.appendChild(fab);
    // composedPath() still lists the panel even when the tapped switch was re-rendered away.
    document.addEventListener('click', e => { const path = e.composedPath(); if (panel && !path.includes(panel) && !path.includes(fab)) { panel.remove(); panel = null; } });
    updateUI(); place();
    // The main page shows/hides its bottom nav when switching screens; keep the button above it.
    new MutationObserver(place).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  window.BrownySound = { play, music, settings: () => ({ ...P, playing, audio: ctx ? ctx.state : 'not started' }) };
})();
