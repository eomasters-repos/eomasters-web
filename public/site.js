// Keep anchor targets clear of the sticky header, including after mobile wrapping.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeaderHeight = () => document.documentElement.style.setProperty('--header-height', siteHeader.getBoundingClientRect().height + 'px');
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}

document.querySelectorAll('.nav-group').forEach(group => {
  group.addEventListener('toggle', () => {
    if (group.open) document.querySelectorAll('.nav-group').forEach(other => { if (other !== group) other.open = false; });
  });
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('details[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); }); });
document.addEventListener('click', event => { if (!event.target.closest('.nav-group')) document.querySelectorAll('.nav-group').forEach(d => d.open = false); });

const dbForm = document.querySelector('#db-filters');
if (dbForm) {
  const cards = [...document.querySelectorAll('[data-sensor]')];
  const results = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');
  const groups = ['sensor', 'theme', 'platform'];
  function update() {
    const data = new FormData(dbForm);
    const selected = Object.fromEntries(groups.map(group => [group, data.getAll(group)]));
    let count = 0;
    cards.forEach(card => {
      const show = groups.every(group => !selected[group].length || selected[group].some(value => JSON.parse(card.dataset[group]).includes(value))) && (!data.has('active') || card.dataset.active === 'true');
      card.hidden = !show;
      if (show) count++;
    });
    results.textContent = `${count} of ${cards.length} instruments`;
    empty.hidden = count !== 0;
  }
  dbForm.addEventListener('change', update);
  dbForm.addEventListener('reset', () => requestAnimationFrame(update));
  update();
}

const blogFilter = document.querySelector('#blog-category');
if (blogFilter) blogFilter.addEventListener('change', () => {
  document.querySelectorAll('[data-categories]').forEach(card => card.hidden = !!blogFilter.value && !JSON.parse(card.dataset.categories).includes(blogFilter.value));
});

// Juxtapose creates its controls once both local images have loaded.
document.querySelectorAll('.image-comparison').forEach(figure => {
  function labelControl() {
    const control = figure.querySelector('[role="slider"]');
    const handle = figure.querySelector('.jx-handle');
    if (!control || !handle) return false;
    control.setAttribute('aria-label', 'Compare original 10 m and super-resolved 5 m Sentinel-2 imagery');
    control.setAttribute('aria-orientation', 'horizontal');
    const update = () => control.setAttribute('aria-valuenow', String(Math.round(parseFloat(handle.style.left))));
    update();
    new MutationObserver(update).observe(handle, {attributes:true, attributeFilter:['style']});
    return true;
  }
  if (!labelControl()) {
    const observer = new MutationObserver(() => { if (labelControl()) observer.disconnect(); });
    observer.observe(figure, {childList:true, subtree:true});
  }
});
