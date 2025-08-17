// js/magnifier.js
(function () {
  // ---- CONFIG ----
  const LENS_DIAMETER = 180;         // circle size (px)
  const DEFAULT_ZOOM = 0.5;          // per-image override via data-zoom (try 0.35–0.8)
  const EXIT_MARGIN = 240;           // keep tracking this far outside the image (px)
  const BORDER = '2px solid rgba(0,0,0,0.25)';

  function init() {
    const targets = document.querySelectorAll('.cs1-image.magnify-target');
    if (!targets.length) return;
    targets.forEach(attachMagnifier);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function attachMagnifier(img) {
    if (!(img instanceof HTMLImageElement)) return;

    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener('load', () => setup(img), { once: true });
    } else {
      setup(img);
    }
  }

  function setup(img) {
    // Per-image zoom (fallback to default)
    const z = parseFloat(img.getAttribute('data-zoom'));
    const ZOOM = Number.isFinite(z) ? z : DEFAULT_ZOOM;

    // Create a lens for this image, on <body> so no parent can clip it
    const lens = document.createElement('div');
    lens.className = 'magnify-lens';
    const pageBg = getComputedStyle(document.body).backgroundColor || '#fff';
    Object.assign(lens.style, {
      position: 'fixed',
      pointerEvents: 'none',
      width: `${LENS_DIAMETER}px`,
      height: `${LENS_DIAMETER}px`,
      borderRadius: '50%',
      backgroundColor: pageBg,                 // shows when image "runs out"
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      border: BORDER,
      opacity: '0',
      transition: 'opacity .12s ease',         // fade only
      zIndex: '999999',
      overflow: 'hidden',
      left: '-9999px',
      top: '-9999px'
    });
    document.body.appendChild(lens);

    // Natural vs display scaling
    let scaleX = 1, scaleY = 1, naturalW = 0, naturalH = 0;

    function updateBackground() {
      const rect = img.getBoundingClientRect();
      naturalW = img.naturalWidth;
      naturalH = img.naturalHeight;
      scaleX = naturalW / rect.width;
      scaleY = naturalH / rect.height;

      lens.style.backgroundImage = `url('${img.currentSrc || img.src}')`;
      lens.style.backgroundRepeat = 'no-repeat';
      lens.style.backgroundSize = `${naturalW * ZOOM}px ${naturalH * ZOOM}px`;
    }

    const r = LENS_DIAMETER / 2;
    let tracking = false;

    function onDocMove(e) {
      if (!tracking) return;

      // Place lens at cursor (viewport coords)
      lens.style.left = `${e.clientX - r}px`;
      lens.style.top  = `${e.clientY - r}px`;

      // Mouse relative to the image box (can go negative/outside)
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Stop tracking once far outside the image
      if (
        x < -EXIT_MARGIN || y < -EXIT_MARGIN ||
        x > rect.width + EXIT_MARGIN || y > rect.height + EXIT_MARGIN
      ) {
        tracking = false;
        lens.style.opacity = '0';
        document.removeEventListener('mousemove', onDocMove);
        return;
      }

      // Background position in zoomed natural px (NO clamping → white appears at edges)
      const bgX = x * scaleX * ZOOM - r;
      const bgY = y * scaleY * ZOOM - r;
      lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    }

    img.addEventListener('mouseenter', () => {
      updateBackground();
      tracking = true;
      lens.style.opacity = '1';
      document.addEventListener('mousemove', onDocMove);
    });

    // Keep tracking after leaving the image; onDocMove hides lens via EXIT_MARGIN
    img.addEventListener('mouseleave', () => { /* intentional no-op */ });

    window.addEventListener('resize', () => {
      if (tracking) updateBackground();
    });
  }
})();
