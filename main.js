(() => {
  const grid = document.querySelector('.grid');
  const tiles = [...grid.querySelectorAll('.tile')];

  // Fade images in as they load
  tiles.forEach((tile) => {
    const img = tile.querySelector('img');
    const done = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener('load', done, { once: true });
  });

  // Masonry: place tiles in their original order into the shortest column
  let currentCols = 0;
  const colCount = () => (innerWidth <= 520 ? 1 : innerWidth <= 900 ? 2 : 3);

  function layout() {
    const n = colCount();
    if (n === currentCols) return;
    currentCols = n;
    const cols = Array.from({ length: n }, () => {
      const c = document.createElement('div');
      c.className = 'col';
      return c;
    });
    const heights = new Array(n).fill(0);
    tiles.forEach((tile) => {
      const img = tile.querySelector('img');
      const ratio = img.getAttribute('height') / img.getAttribute('width');
      const i = heights.indexOf(Math.min(...heights));
      cols[i].appendChild(tile);
      heights[i] += ratio;
    });
    grid.replaceChildren(...cols);
    grid.classList.add('is-masonry');
  }

  layout();
  addEventListener('resize', layout);

  // Lightbox
  const lb = document.querySelector('.lightbox');
  const lbImg = lb.querySelector('img');
  const lbCount = lb.querySelector('.lb-count');
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + tiles.length) % tiles.length;
    const img = tiles[index].querySelector('img');
    lbImg.src = tiles[index].href;
    lbImg.alt = img.alt;
    lbCount.textContent = `${index + 1} / ${tiles.length}`;
    // Preload neighbours
    [index - 1, index + 1].forEach((j) => {
      new Image().src = tiles[(j + tiles.length) % tiles.length].href;
    });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  tiles.forEach((tile, i) =>
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      open(i);
    })
  );

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });
  lbImg.addEventListener('click', () => show(index + 1));

  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  // Swipe on touch devices
  let startX = null;
  lb.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
