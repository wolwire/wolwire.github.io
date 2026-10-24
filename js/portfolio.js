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
