const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    let visible = 0;
    projects.forEach(project => {
      project.hidden = category !== 'all' && project.dataset.category !== category;
      if (!project.hidden) visible++;
    });
    document.querySelector('#project-status').textContent = `Showing ${visible} ${category === 'all' ? '' : button.textContent.toLowerCase() + ' '}project${visible === 1 ? '' : 's'}`;
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep every enhancement optional: the document works without motion or JavaScript.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionToggle = document.querySelector('.motion-toggle');
let motionPaused = false;
try { motionPaused = localStorage.getItem('portfolio-motion') === 'paused'; } catch {}
let motionActive = false;
let particleFrame = 0;
let heroOnScreen = true;
const hero = document.querySelector('.hero');
const canvas = document.querySelector('.hero-particles');
const context = canvas.getContext('2d');
let sceneWidth = 0;
let sceneHeight = 0;
let lastFrame = 0;
const pointer = { x: -1000, y: -1000 };
const particles = Array.from({ length: 34 }, (_, i) => ({
  x: ((i * 37 + 13) % 101) / 101,
  y: ((i * 61 + 29) % 103) / 103,
  radius: i % 5 === 0 ? 2 : 1,
  phase: i * 1.7,
}));

function paintScene(time = 0) {
  if (!context) return;
  context.clearRect(0, 0, sceneWidth, sceneHeight);
  const points = particles.map(p => ({
    x: p.x * sceneWidth + Math.sin(time * 0.00013 + p.phase) * 16,
    y: p.y * sceneHeight + Math.cos(time * 0.00017 + p.phase) * 19,
    radius: p.radius,
  }));
  points.forEach((p, i) => {
    const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y);
    context.beginPath();
    context.arc(p.x, p.y, distance < 140 ? p.radius + 1 : p.radius, 0, Math.PI * 2);
    context.fillStyle = i % 3 === 0 ? 'rgba(189,76,44,.30)' : 'rgba(107,124,92,.23)';
    context.fill();
    if (distance < 150) {
      context.beginPath();
      context.moveTo(p.x, p.y);
      context.lineTo(pointer.x, pointer.y);
      context.strokeStyle = `rgba(189,76,44,${(1 - distance / 150) * 0.16})`;
      context.lineWidth = 0.7;
      context.stroke();
    }
    if (i % 3 === 0 && points[i + 1] && Math.hypot(p.x - points[i + 1].x, p.y - points[i + 1].y) < 150) {
      context.beginPath();
      context.moveTo(p.x, p.y);
      context.lineTo(points[i + 1].x, points[i + 1].y);
      context.strokeStyle = 'rgba(107,124,92,.1)';
      context.lineWidth = 0.5;
      context.stroke();
    }
  });
}
function animateScene(time) {
  particleFrame = 0;
  if (!motionActive || !heroOnScreen || document.hidden || !context) return;
  if (time - lastFrame > 33) { paintScene(time); lastFrame = time; }
  particleFrame = requestAnimationFrame(animateScene);
}
function syncScene() {
  cancelAnimationFrame(particleFrame);
  particleFrame = 0;
  if (motionActive && heroOnScreen && !document.hidden && context) particleFrame = requestAnimationFrame(animateScene);
}
function syncMotion() {
  motionActive = !motionPaused && !reducedMotion.matches;
  document.body.classList.toggle('motion-enabled', motionActive);
  document.body.classList.toggle('motion-paused', !motionActive);
  motionToggle.setAttribute('aria-pressed', String(motionPaused));
  motionToggle.setAttribute('aria-label', motionPaused ? 'Enable animations' : 'Pause animations');
  motionToggle.querySelector('.motion-toggle-label').textContent = motionPaused ? 'Motion off' : 'Motion on';
  motionToggle.querySelector('.motion-toggle-icon').textContent = motionPaused ? '▷' : 'Ⅱ';
  if (!motionActive) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');
    });
    document.querySelector('.portrait-frame').style.removeProperty('--portrait-x');
    document.querySelector('.portrait-frame').style.removeProperty('--portrait-y');
  }
  syncScene();
}
motionToggle.addEventListener('click', () => {
  motionPaused = !motionPaused;
  try { localStorage.setItem('portfolio-motion', motionPaused ? 'paused' : 'enabled'); } catch {}
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncScene);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.section-heading, .project-card, .career-item, .blog-card, .about-section > div, .contact-inner > div').forEach((item, i) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${item.classList.contains('project-card') ? (i % 2) * 90 : 0}ms`);
    revealObserver.observe(item);
  });
  const heroObserver = new IntersectionObserver(entries => {
    heroOnScreen = entries[0].isIntersecting;
    hero.classList.toggle('scene-idle', !heroOnScreen);
    if (heroOnScreen) document.querySelectorAll('.nav-links a').forEach(link => link.removeAttribute('aria-current'));
    syncScene();
  });
  heroObserver.observe(hero);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}

function sizeScene() {
  const bounds = hero.getBoundingClientRect();
  sceneWidth = bounds.width; sceneHeight = bounds.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(sceneWidth * ratio);
  canvas.height = Math.round(sceneHeight * ratio);
  if (context) { context.setTransform(ratio, 0, 0, ratio, 0, 0); paintScene(); }
}
if ('ResizeObserver' in window) new ResizeObserver(sizeScene).observe(hero);
else window.addEventListener('resize', sizeScene);
hero.addEventListener('pointermove', event => {
  if (!motionActive || !finePointer.matches) return;
  const bounds = hero.getBoundingClientRect();
  pointer.x = event.clientX - bounds.left; pointer.y = event.clientY - bounds.top;
});
hero.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
const visual = document.querySelector('.hero-visual');
const portrait = document.querySelector('.portrait-frame');
visual.addEventListener('pointermove', event => {
  if (!motionActive || !finePointer.matches) return;
  const bounds = visual.getBoundingClientRect();
  portrait.style.setProperty('--portrait-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.035}px`);
  portrait.style.setProperty('--portrait-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.035}px`);
});
visual.addEventListener('pointerleave', () => {
  portrait.style.removeProperty('--portrait-x'); portrait.style.removeProperty('--portrait-y');
});
projects.forEach(card => {
  card.addEventListener('pointermove', event => {
    if (!motionActive || !finePointer.matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 3}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 3}deg`);
    card.style.setProperty('--glow-x', `${x * 100}%`);
    card.style.setProperty('--glow-y', `${y * 100}%`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');
  });
});
filters.forEach(button => button.addEventListener('click', () => {
  projects.forEach(card => {
    card.classList.remove('filter-enter');
    if (!card.hidden) {
      card.classList.add('is-visible');
      if (motionActive) requestAnimationFrame(() => card.classList.add('filter-enter'));
    }
  });
}));
let scrollPending = false;
const progress = document.querySelector('.reading-progress');
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(window.scrollY / distance, 1) : 0})`;
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
sizeScene();
syncMotion();
updateProgress();
