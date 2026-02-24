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

  // Khởi động các hiệu ứng sau khi mở màn
  setTimeout(() => {
    curtain.style.pointerEvents = 'none';
    document.getElementById('page').classList.add('visible');
    initHeroSlider(); // Gọi hàm khởi tạo slide
  }, 800);

  startHearts();
}

/* ─────────────────────────────────────────────────────────
   HERO SLIDER – Chuyển đổi ảnh bìa tự động
   ───────────────────────────────────────────────────────── */
function initHeroSlider() {
  const slider = document.getElementById('hero-slider');
  const track = document.getElementById('hero-track');
  const dotsContainer = document.getElementById('hero-dots');
  if (!slider || !track) return;
  
  let slides = Array.from(track.querySelectorAll('.hero-slide'));
  const originalCount = slides.length;
  if (originalCount <= 1) return;

  // CLONE slides for seamless loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[originalCount - 1].cloneNode(true);
  
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  // Update slides array after cloning
  slides = Array.from(track.querySelectorAll('.hero-slide'));
  const totalSlides = slides.length;

  let currentIndex = 1; // Start at the first real slide
  let startX = 0;
  let isDragging = false;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let autoPlayTimer = null;
  let isTransitioning = false;

  // Create Dots (based on original count)
  dotsContainer.innerHTML = '';
  for (let i = 0; i < originalCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      if (isTransitioning) return;
      goToSlide(i + 1);
    });
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.dot');

  // Initial position
  updateSliderPosition(false);

  // Events
  slider.addEventListener('touchstart', touchStart, { passive: true });
  slider.addEventListener('touchend', touchEnd);
  slider.addEventListener('touchmove', touchMove, { passive: true });
  slider.addEventListener('mousedown', touchStart);
  slider.addEventListener('mouseup', touchEnd);
  slider.addEventListener('mouseleave', touchEnd);
  slider.addEventListener('mousemove', touchMove);

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function touchStart(e) {
    if (isTransitioning) return;
    isDragging = true;
    startX = getPositionX(e);
    clearInterval(autoPlayTimer);
    track.style.transition = 'none';
  }

  function touchMove(e) {
    if (!isDragging) return;
    const currentX = getPositionX(e);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function touchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -80) currentIndex++;
    else if (movedBy > 80) currentIndex--;

    goToSlide(currentIndex);
    startAutoPlay();
  }

  function goToSlide(index, animate = true) {
    if (isTransitioning) return;
    isTransitioning = animate;
    currentIndex = index;

    if (animate) {
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }

    updateSliderPosition();

    if (animate) {
      setTimeout(() => {
        handleTransitionEnd();
      }, 600);
    }
  }

  function handleTransitionEnd() {
    isTransitioning = false;
    // Jump without animation if we are on a clone
    if (currentIndex === 0) {
      currentIndex = originalCount;
      updateSliderPosition(false);
    } else if (currentIndex === totalSlides - 1) {
      currentIndex = 1;
      updateSliderPosition(false);
    }
    updateDots();
  }

  function updateSliderPosition(animate = true) {
    if (!animate) track.style.transition = 'none';
    currentTranslate = -currentIndex * slider.offsetWidth;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function updateDots() {
    let dotIndex = currentIndex - 1;
    if (currentIndex === 0) dotIndex = originalCount - 1;
    if (currentIndex === totalSlides - 1) dotIndex = 0;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === dotIndex);
    });
  }

  function startAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  startAutoPlay();
  
  // Clean up on resize
  window.addEventListener('resize', () => {
    updateSliderPosition(false);
  });
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
   RSVP – Xác nhận tham dự + Lưu vào localStorage
───────────────────────────────────────────────────────── */
function showRSVPToast(name, attend) {
  const overlay  = document.getElementById('rsvp-toast-overlay');
  const box      = document.getElementById('rsvp-toast-box');
  const iconEl   = document.getElementById('rsvp-toast-icon');
  const titleEl  = document.getElementById('rsvp-toast-title-text');
  const nameEl   = document.getElementById('rsvp-toast-name');
  const msgEl    = document.getElementById('rsvp-toast-msg');
  const heartsEl = document.getElementById('rsvp-toast-hearts');

  if (attend === 'yes') {
    box.classList.remove('decline');
    iconEl.textContent   = '🎊';
    titleEl.textContent  = 'Tuyệt vời!';
    nameEl.textContent   = name;
    msgEl.textContent    = 'Chúng tôi rất vui khi biết bạn sẽ tham dự lễ cưới. Hẹn gặp bạn trong ngày trọng đại!';
    heartsEl.textContent = '💕 ❤️ 💍 ❤️ 💕';
  } else if (attend === 'no') {
    box.classList.add('decline');
    iconEl.textContent   = '�';
    titleEl.textContent  = 'Cảm ơn bạn!';
    nameEl.textContent   = name;
    msgEl.textContent    = 'Chúng tôi rất tiếc khi bạn không thể đến. Chúc bạn mọi điều tốt lành và hạnh phúc!';
    heartsEl.textContent = '🌸 ✨ 🌷 ✨ 🌸';
  } else {
    box.classList.remove('decline');
    iconEl.textContent   = '💌';
    titleEl.textContent  = 'Đã nhận được!';
    nameEl.textContent   = name;
    msgEl.textContent    = 'Cảm ơn bạn đã gửi phản hồi. Chúng tôi rất mong sớm được gặp bạn!';
    heartsEl.textContent = '💕 ❤️ 💕';
  }

  // Re-trigger icon animation
  iconEl.style.animation = 'none';
  requestAnimationFrame(() => { iconEl.style.animation = ''; });

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeRSVPToast() {
  const overlay = document.getElementById('rsvp-toast-overlay');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Khởi tạo sự kiện đóng toast
(function initRSVPToast() {
  const btn     = document.getElementById('rsvp-toast-close');
  const overlay = document.getElementById('rsvp-toast-overlay');
  if (btn)     btn.addEventListener('click', closeRSVPToast);
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeRSVPToast();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeRSVPToast();
  });
})();

function submitRSVP(e) {
  e.preventDefault();
  const name   = document.getElementById('rsvp-name').value.trim();
  const phone  = document.getElementById('rsvp-phone').value.trim();
  const attend = document.getElementById('rsvp-attend').value;
  const guests = document.getElementById('rsvp-guests').value || '0';
  const msg    = document.getElementById('rsvp-msg').value.trim();

  // Lưu vào localStorage
  const rsvpList = JSON.parse(localStorage.getItem('wedding_rsvp') || '[]');
  rsvpList.push({
    id:      Date.now(),
    name,
    phone,
    attend,
    guests:  parseInt(guests, 10) || 0,
    message: msg,
    time:    new Date().toISOString(),
  });
  localStorage.setItem('wedding_rsvp', JSON.stringify(rsvpList));

  // Hiển thị toast đẹp
  showRSVPToast(name || 'bạn', attend);
  e.target.reset();
}


/* ─────────────────────────────────────────────────────────
   LIGHTBOX – Xem ảnh phóng to khi click
───────────────────────────────────────────────────────── */
(function initLightbox() {
  // ── 1. Tạo HTML overlay ──────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.id = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox-content" id="lb-content">
      <img class="lightbox-img" id="lb-img" src="" alt="">
    </div>
    <button class="lightbox-close" id="lb-close" aria-label="Đóng">&#x2715;</button>
    <button class="lightbox-btn lightbox-prev" id="lb-prev" aria-label="Ảnh trước">&#8592;</button>
    <button class="lightbox-btn lightbox-next" id="lb-next" aria-label="Ảnh tiếp">&#8594;</button>
    <div class="lightbox-caption" id="lb-caption"></div>
    <div class="lightbox-counter" id="lb-counter"></div>
  `;
  document.body.appendChild(overlay);

  // ── 2. Danh sách ảnh (thu thập tất cả ảnh có thể click) ──
  let images = [];  // [{src, alt}]
  let current = 0;

  function collectImages() {
    const selectors = [
      '.gallery-img',               // Gallery section
      '.tl2-photo-img',             // Timeline
      '.person-photo-img',          // Chú rể / Cô dâu
    ];
    images = [];
    document.querySelectorAll(selectors.join(',')).forEach(function(img) {
      var idx = images.length;
      images.push({ src: img.src, alt: img.alt || '' });
      var parent = img.closest('.gallery-item, .tl2-photo, .person-photo-placeholder');
      if (parent && !parent.dataset.lbBound) {
        parent.dataset.lbBound = '1';
        parent.style.cursor = 'zoom-in';
        (function(i){ parent.addEventListener('click', function() { openLightbox(i); }); })(idx);
      }
    });
    if (images.length <= 1) overlay.classList.add('single');
    else overlay.classList.remove('single');
  }

  // ── 3. Mở / đóng lightbox ───────────────────────────────
  var lbImg     = document.getElementById('lb-img');
  var lbCaption = document.getElementById('lb-caption');
  var lbCounter = document.getElementById('lb-counter');

  function openLightbox(index) {
    current = index;
    renderImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(function() { lbImg.src = ''; }, 400);
  }

  function renderImage() {
    var item = images[current];
    lbImg.style.opacity = '0';
    lbImg.style.transition = 'none';
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbImg.onload = function() {
      lbImg.style.transition = 'opacity 0.28s ease';
      lbImg.style.opacity = '1';
    };
    lbCaption.textContent = item.alt;
    lbCounter.textContent = images.length > 1 ? (current + 1) + ' / ' + images.length : '';
  }

  function showPrev() {
    current = (current - 1 + images.length) % images.length;
    renderImage();
  }
  function showNext() {
    current = (current + 1) % images.length;
    renderImage();
  }

  // ── 4. Sự kiện buttons ──────────────────────────────────
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', showPrev);
  document.getElementById('lb-next').addEventListener('click', showNext);

  // Click vào background để đóng
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.id === 'lb-content') closeLightbox();
  });

  // ── 5. Phím tắt ─────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // ── 6. Swipe trên mobile ─────────────────────────────────
  var touchStartX = 0;
  overlay.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) showNext(); else showPrev(); }
  });

  // ── 7. Khởi tạo: chờ page visible (sau khi mở màn) ─────
  var pageEl = document.getElementById('page');
  if (pageEl && pageEl.classList.contains('visible')) {
    collectImages();
  } else {
    var mo = new MutationObserver(function() {
      if (pageEl && pageEl.classList.contains('visible')) {
        collectImages();
        mo.disconnect();
      }
    });
    mo.observe(pageEl || document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  }
})();
