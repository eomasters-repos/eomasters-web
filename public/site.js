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
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.querySelector('.image-viewer[open]')) document.querySelectorAll('details[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); }); });
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

// Keep the image links usable without JavaScript, then enhance them with a modal viewer.
const screenshotLinks = document.querySelectorAll('a[data-image-viewer]');
if (screenshotLinks.length) {
  const viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-labelledby', 'image-viewer-title');
  viewer.innerHTML = '<div class="image-viewer-toolbar"><h2 id="image-viewer-title">Screenshot viewer</h2><button type="button" autofocus aria-label="Close image viewer">Close</button></div><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.append(viewer);
  const fullImage = viewer.querySelector('img');
  const caption = viewer.querySelector('figcaption');
  let opener;
  screenshotLinks.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      viewer.querySelector('h2').textContent = link.dataset.viewerTitle || 'Screenshot viewer';
      fullImage.src = link.href;
      fullImage.alt = link.querySelector('img').alt;
      caption.textContent = link.closest('figure')?.querySelector('figcaption')?.textContent || fullImage.alt;
      viewer.showModal();
      document.documentElement.classList.add('image-viewer-open');
    });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  // Backdrop clicks dismiss the viewer; clicks inside the panel do not.
  let backdropPointerDown = false;
  const isOutside = event => {
    const bounds = viewer.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  viewer.addEventListener('pointerdown', event => { backdropPointerDown = isOutside(event); });
  viewer.addEventListener('click', event => {
    if (backdropPointerDown && isOutside(event)) viewer.close();
    backdropPointerDown = false;
  });
  viewer.addEventListener('close', () => {
    document.documentElement.classList.remove('image-viewer-open');
    opener?.focus({preventScroll:true});
  });
}

// Show all figures without JavaScript; enhance them into a manually controlled carousel.
document.querySelectorAll('[data-carousel]').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('figure')];
  if (slides.length < 2) return;
  let current = 0;
  gallery.setAttribute('role', 'region');
  gallery.setAttribute('aria-roledescription', 'carousel');
  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
  });
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous';
  previous.setAttribute('aria-label', 'Previous map');
  const status = document.createElement('p');
  status.className = 'carousel-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.setAttribute('aria-label', 'Next map');
  controls.append(previous, status, next);
  const thumbnails = document.createElement('div');
  thumbnails.className = 'carousel-thumbnails';
  thumbnails.setAttribute('role', 'group');
  thumbnails.setAttribute('aria-label', 'Choose a map');
  const selectors = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show map ${index + 1}: ${slide.querySelector('strong').textContent}`);
    button.setAttribute('aria-controls', slide.id);
    const thumbnail = slide.querySelector('img').cloneNode();
    thumbnail.alt = '';
    button.append(thumbnail);
    button.addEventListener('click', () => show(index));
    thumbnails.append(button);
    return button;
  });
  function show(index) {
    const focusedImage = slides[current].contains(document.activeElement);
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      selectors[i].setAttribute('aria-pressed', String(i === current));
    });
    status.textContent = `${current + 1} / ${slides.length}`;
    status.setAttribute('aria-label', `Map ${current + 1} of ${slides.length}: ${slides[current].querySelector('strong').textContent}`);
    if (focusedImage) slides[current].querySelector('a').focus({preventScroll:true});
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  gallery.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  gallery.append(controls, thumbnails);
  show(0);
});
