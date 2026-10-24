const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const hero = document.querySelector('.studio-hero');
const canvas = document.querySelector('#sculpture-canvas');
const sculpture = document.querySelector('.sculpture');
const ctx = canvas.getContext('2d');
const toggle = document.querySelector('.motion-toggle');
const perspective = document.querySelector('.perspective-button');
const menu = document.querySelector('#site-menu');
let paused = false;
try { paused = localStorage.getItem('portfolio-motion') === 'paused'; } catch {}
let active = !paused && !reduced.matches;
let visible = true;
let frame = 0;
let lastDraw = 0;
let elapsed = 0;
let previousTime = 0;
let width = 0;
let height = 0;
let sceneScroll = 0;
let shapeTarget = 0;
let shape = 0;
const aim = { x: 0, y: 0 };
const drift = { x: 0, y: 0 };

// A parametric knot, rendered locally. No remote 3D library or model required.
const rings = 104;
const segments = 14;
const vertices = [];
const faces = [];
function centerAt(t) {
  return [(2 + .65 * Math.cos(3 * t)) * Math.cos(2 * t),
    (2 + .65 * Math.cos(3 * t)) * Math.sin(2 * t), 1.08 * Math.sin(3 * t)];
}
for (let i = 0; i < rings; i++) {
  const t = i / rings * Math.PI * 2;
  const c = centerAt(t);
  const next = centerAt(t + .001);
  const tangent = next.map((v, k) => v - c[k]);
  const length = Math.hypot(...tangent);
  const unit = tangent.map(v => v / length);
  const normalLength = Math.hypot(unit[0], unit[1]);
  const normal = [-unit[1] / normalLength, unit[0] / normalLength, 0];
  const binormal = [unit[1] * normal[2] - unit[2] * normal[1], unit[2] * normal[0] - unit[0] * normal[2], unit[0] * normal[1] - unit[1] * normal[0]];
  for (let j = 0; j < segments; j++) {
    const u = j / segments * Math.PI * 2;
    const tube = .43;
    vertices.push(c.map((v, k) => v + tube * (normal[k] * Math.cos(u) + binormal[k] * Math.sin(u))));
    faces.push([i * segments + j, ((i + 1) % rings) * segments + j, ((i + 1) % rings) * segments + (j + 1) % segments, i * segments + (j + 1) % segments]);
  }
}
function paint() {
  if (!ctx || width < 1 || height < 1) return;
  ctx.clearRect(0, 0, width, height);
  const angleY = elapsed * .00009 + .6 + drift.x * .23 + sceneScroll * .8 + shape;
  const angleX = -.6 + drift.y * .2 + Math.sin(elapsed * .00012) * .12;
  const angleZ = -.38 + shape * .15;
  const cy = Math.cos(angleY), sy = Math.sin(angleY);
  const cx = Math.cos(angleX), sx = Math.sin(angleX);
  const cz = Math.cos(angleZ), sz = Math.sin(angleZ);
  const scale = Math.min(width, height) * .147;
  const projected = vertices.map(([x, y, z]) => {
    const rx = x * cy + z * sy;
    const rz = -x * sy + z * cy;
    const ry = y * cx - rz * sx;
    const depth = y * sx + rz * cx;
    const finalX = rx * cz - ry * sz;
    const finalY = rx * sz + ry * cz;
    const p = 8.5 / (8.5 - depth);
    return [width / 2 + finalX * scale * p, height / 2 + finalY * scale * p, depth];
  });
  const sorted = faces.map(indices => ({ indices, z: indices.reduce((sum, i) => sum + projected[i][2], 0) / 4 })).sort((a, b) => a.z - b.z);
  sorted.forEach(({indices, z}) => {
    const light = Math.min(1, Math.max(0, (z + 3) / 6));
    ctx.beginPath();
    indices.forEach((i, index) => {
      const p = projected[i];
      if (index === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.round(30 + light * 128)},${Math.round(37 + light * 145)},${Math.round(16 + light * 40)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(221,250,93,${.15 + light * .58})`;
    ctx.lineWidth = .55;
    ctx.stroke();
  });
  document.body.classList.add('scene-ready');
}
function loop(time) {
  frame = 0;
  if (!active || !visible || document.hidden || !ctx) { previousTime = 0; return; }
  if (time - lastDraw > 33) {
    if (previousTime) elapsed += Math.min(time - previousTime, 60);
    previousTime = time;
    drift.x += (aim.x - drift.x) * .05;
    drift.y += (aim.y - drift.y) * .05;
    shape += (shapeTarget - shape) * .045;
    paint();
    lastDraw = time;
  }
  frame = requestAnimationFrame(loop);
}
function schedule() {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  if (active && visible && !document.hidden && ctx) frame = requestAnimationFrame(loop);
  else paint();
}
function sizeCanvas() {
  const rect = sculpture.getBoundingClientRect();
  width = rect.width; height = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, 1.6);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  if (ctx) { ctx.setTransform(ratio, 0, 0, ratio, 0, 0); paint(); }
}
function syncMotion() {
  active = !paused && !reduced.matches;
  document.body.classList.toggle('motion-paused', !active);
  toggle.textContent = `MOTION: ${active ? 'ON' : 'OFF'}`;
  toggle.setAttribute('aria-pressed', String(!active));
  toggle.setAttribute('aria-label', active ? 'Pause motion' : 'Enable motion');
  schedule();
  updateScroll();
}
toggle.addEventListener('click', () => {
  paused = active;
  try { localStorage.setItem('portfolio-motion', paused ? 'paused' : 'enabled'); } catch {}
  syncMotion();
});
reduced.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', schedule);
perspective.addEventListener('click', () => {
  shapeTarget += Math.PI * .72;
  if (!active) { shape = shapeTarget; paint(); }
});
hero.addEventListener('pointermove', event => {
  if (!active || !finePointer.matches) return;
  const bounds = hero.getBoundingClientRect();
  aim.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
  aim.y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
});
hero.addEventListener('pointerleave', () => { aim.x = 0; aim.y = 0; });

const openMenu = document.querySelector('.menu-open');
openMenu.addEventListener('click', () => menu.showModal());
document.querySelector('.menu-close').addEventListener('click', () => menu.close());
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
menu.addEventListener('click', event => { if (event.target === menu) menu.close(); });

const panels = [...document.querySelectorAll('.project-panel')];
const headline = document.querySelectorAll('.headline-row');
const progress = document.querySelector('.scroll-progress');
let scrollPending = false;
function updateScroll() {
  sceneScroll = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
  if (active) {
    headline[0].style.setProperty('--headline-shift', `${-sceneScroll * 65}px`);
    headline[1].style.setProperty('--headline-shift', `${sceneScroll * 65}px`);
  }
  if (active && innerWidth > 700) {
    panels.forEach((panel, i) => {
      const next = panels[i + 1];
      if (!next) return;
      const nextTop = next.getBoundingClientRect().top;
      const overlap = Math.max(0, Math.min(1, 1 - nextTop / innerHeight));
      panel.style.transform = `scale(${1 - overlap * .035})`;
      panel.style.filter = `brightness(${1 - overlap * .12})`;
    });
  } else {
    panels.forEach(panel => { panel.style.removeProperty('transform'); panel.style.removeProperty('filter'); });
  }
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  scrollPending = false;
}
addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
addEventListener('resize', () => { sizeCanvas(); updateScroll(); });
if ('ResizeObserver' in window) new ResizeObserver(sizeCanvas).observe(sculpture);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(hero);
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.manifesto-text, .work-heading, .section-heading, .about-image, .about-copy, .blog-card').forEach(el => observer.observe(el));
}
function updateTime() {
  document.querySelector('#local-time').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date());
}
updateTime();
setInterval(updateTime, 60000);
document.querySelector('#year').textContent = new Date().getFullYear();
sizeCanvas();
syncMotion();
