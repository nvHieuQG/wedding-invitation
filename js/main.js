/* ═══════════════════════════════════════════════════════════
   main.js – Wedding Invitation Scripts
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   HEARTS CANVAS – Trái tim rơi xuyên suốt
───────────────────────────────────────────────────────── */
const canvas       = document.getElementById('hearts-canvas');
const ctx          = canvas.getContext('2d');
let   hearts       = [];
let   heartsRunning = false;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const HEART_COLORS = [
  'rgba(200,16,46,VAL)',
  'rgba(180,10,35,VAL)',
  'rgba(220,30,60,VAL)',
];

function createHeart() {
  const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
  return {
    x:        Math.random() * canvas.width,
    y:        -20,
    size:     6 + Math.random() * 14,
    speed:    0.6 + Math.random() * 1.2,
    drift:    (Math.random() - 0.5) * 0.8,
    opacity:  0.4 + Math.random() * 0.5,
    color:    color,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
  };
}

function drawHeart(h) {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(h.rotation);
  ctx.scale(h.size / 10, h.size / 10);
  ctx.fillStyle = h.color.replace('VAL', h.opacity);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-5, -5, -10, 0, 0, 8);
  ctx.bezierCurveTo(10, 0, 5, -5, 0, 0);
  ctx.fill();
  ctx.restore();
}

function animateHearts() {
  if (!heartsRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.05) hearts.push(createHeart());

  hearts = hearts.filter(h => h.y < canvas.height + 30);
  hearts.forEach(h => {
    h.y        += h.speed;
    h.x        += h.drift;
    h.rotation += h.rotSpeed;
    drawHeart(h);
  });

  requestAnimationFrame(animateHearts);
}

function startHearts() {
  if (heartsRunning) return;
  heartsRunning = true;
  animateHearts();
}

/* ─────────────────────────────────────────────────────────
   CURTAIN – Mở màn kéo lên
───────────────────────────────────────────────────────── */
function openCurtain() {
  const curtain = document.getElementById('curtain');
  curtain.classList.add('open');

  // Hiện page sau animation
  setTimeout(() => {
    curtain.style.pointerEvents = 'none';
    document.getElementById('page').classList.add('visible');
  }, 800);

  startHearts();
}

/* ─────────────────────────────────────────────────────────
   COUNTDOWN – Đếm ngược đến ngày cưới
───────────────────────────────────────────────────────── */
// TODO: Điền ngày giờ cưới thực tế (định dạng: 'YYYY-MM-DDTHH:MM:00')
const weddingDate = new Date('YYYY-MM-DDTHH:MM:00');

function updateCountdown() {
  const diff = weddingDate - new Date();

  if (isNaN(diff) || diff <= 0) {
    const el = document.getElementById('countdown');
    if (el) {
      if (isNaN(diff)) {
        el.innerHTML = '<p style="font-family:Lora,serif;font-size:.9rem;color:#7a5c3a">Đặt ngày cưới trong <code>js/main.js</code> (weddingDate) để xem đếm ngược</p>';
      } else {
        el.innerHTML = '<p style="font-family:Great Vibes,cursive;font-size:2rem;color:#C8102E">Hôm nay là ngày trọng đại! 🎊</p>';
      }
    }
    return;
  }

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(Math.max(0, Math.floor(val))).padStart(2, '0');
  };
  set('cd-days',  diff / 86400000);
  set('cd-hours', (diff % 86400000) / 3600000);
  set('cd-mins',  (diff % 3600000)  / 60000);
  set('cd-secs',  (diff % 60000)    / 1000);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ─────────────────────────────────────────────────────────
   SCROLL REVEAL – Hiệu ứng xuất hiện khi cuộn
───────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────────────────────
   RSVP – Xác nhận tham dự
───────────────────────────────────────────────────────── */
function submitRSVP(e) {
  e.preventDefault();
  const name   = document.getElementById('rsvp-name').value;
  const attend = document.getElementById('rsvp-attend').value;
  const msg    = attend === 'yes'
    ? `Cảm ơn ${name}! 💌\nChúng tôi rất vui khi bạn sẽ tham dự.\nHẹn gặp bạn trong ngày vui! 🎊`
    : `Cảm ơn ${name} đã phản hồi! 💌\nChúng tôi rất tiếc khi bạn không thể đến.\nChúc bạn mọi điều tốt lành! 🌸`;
  alert(msg);
  e.target.reset();
}

