// js/magnifier.js
(function () {
  // --- GLOBAL DEFAULTS (override per image with data-zoom) ---
  const LENS_DIAMETER = 180;      // circle size in px
  const DEFAULT_ZOOM = 0.5;       // smaller numbers (0.35–0.8) = gentler zoom, still crisp
  const EASE = 0.2;               // 0.1 = slower/smoother, 0.3 = faster/snappier
  const BORDER = '2px solid rgba(0,0,0,0.25)';

  console.log('[magnifier] loaded');

  function init() {
    const targets = document.querySelectorAll('.cs1-image.magnify-target');
    if (!targets.length) {
      console.warn('[magnifier] no .cs1-image.magnify-target found');
      return;
    }
    targets.forEach(setupMagnifier);
    console.log(`[magnifier] initialized on ${targets.length} image(s)`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function setupMagnifier(img) {
    if (!(img instanceof HTMLImageElement)) return;

    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener('load', () => doSetup(img), { once: true });
    } else {
      doSetup(img);
    }
  }

  function doSetup(img) {
    // Per-image config
    const zoomAttr = parseFloat(img.getAttribute('data-zoom'));
    const ZOOM = Number.isFinite(zoomAttr) ? zoomAttr : DEFAULT_ZOOM;

    // Wrap the image so the lens can be absolutely positioned
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';
    wrap.style.lineHeight = 0;
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    // Create lens
    const lens = document.createElement('div');
    lens.className = 'magnify-lens';
    Object.assign(lens.style, {
      position: 'absolute',
      pointerEvents: 'none',
      width: `${LENS_DIAMETER}px`,
      height: `${LENS_DIAMETER}px`,
      borderRadius: '50%',
      backgroundColor: '#fff',                 // ← make uncovered area white
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      border: BORDER,
      opacity: '0',
      transition: 'opacity .15s ease',
      zIndex: '999',
      overflow: 'hidden'                       // just in case of painting artifacts
    });
    wrap.appendChild(lens);

    // Scale and background setup (crisp using natural resolution)
    let scaleX = 1, scaleY = 1, naturalW = 0, naturalH = 0;

    function updateBackground() {
      const rect = img.getBoundingClientRect();
      naturalW = img.naturalWidth;
      naturalH = img.naturalHeight;

      // Map display pixels to natural pixels
      scaleX = naturalW / rect.width;
      scaleY = naturalH / rect.height;

      lens.style.backgroundImage = `url('${img.currentSrc || img.src}')`;
      lens.style.backgroundRepeat = 'no-repeat';
      // Maintain natural resolution; use small ZOOM for subtle magnification
      lens.style.backgroundSize = `${naturalW * ZOOM}px ${naturalH * ZOOM}px`;
    }

    // Smoothing state
    let targetX = 0, targetY = 0; // desired lens top-left
    let lensX = 0, lensY = 0;     // actual lens top-left
    let hovering = false;

    // Animation loop (eased follow)
    function animateLens() {
      lensX += (targetX - lensX) * EASE;
      lensY += (targetY - lensY) * EASE;

      lens.style.left = `${lensX}px`;
      lens.style.top = `${lensY}px`;

      // Compute background position from lens center in NATURAL pixel space
      const centerX = lensX + LENS_DIAMETER / 2;
      const centerY = lensY + LENS_DIAMETER / 2;

      const bgX = centerX * scaleX * ZOOM - LENS_DIAMETER / 2;
      const bgY = centerY * scaleY * ZOOM - LENS_DIAMETER / 2;
      lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;

      requestAnimationFrame(animateLens);
    }
    requestAnimationFrame(animateLens);

    function moveLens(e) {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetX = x - LENS_DIAMETER / 2;
      targetY = y - LENS_DIAMETER / 2;
    }

    img.addEventListener('mouseenter', () => {
      hovering = true;
      updateBackground();
      lens.style.opacity = '1';
    });

    img.addEventListener('mousemove', (e) => {
      if (!hovering) return;
      moveLens(e);
    });

    img.addEventListener('mouseleave', () => {
      hovering = false;
      lens.style.opacity = '0';
    });

    window.addEventListener('resize', updateBackground);
  }
})();
