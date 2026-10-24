// Apply before styles load so a saved light theme never flashes dark.
(() => {
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#161714' : '#f2f1e9';
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    });
    document.dispatchEvent(new CustomEvent('portfolio:theme', { detail: { theme } }));
  }
  apply(preference || (systemTheme.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('portfolio-theme', preference); } catch {}
      apply(preference);
    }));
  });
  systemTheme.addEventListener('change', () => {
    if (!preference) apply(systemTheme.matches ? 'dark' : 'light');
  });
})();
