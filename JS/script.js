(function() {
  // CONFIG
  const LENS_DIAMETER = 180;   // px (circle size)
  const ZOOM = 2.2;            // magnification level
  const BORDER = '2px solid rgba(0,0,0,0.25)';

  // Run setup for every magnify-target image
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.magnify-target').forEach(setupMagnifier);
  });

  function setupMagnifier(img) {
    // Wrap image in positioned container
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.display  = 'inline-block';
    wrap.style.lineHeight = 0;
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    // Create the lens
    const lens = document.createElement('div');
    lens.className = 'magnify-lens';
    Object.assign(lens.style, {
      position: 'absolute',
      pointerEvents: 'none',
      width: LENS_DIAMETER + 'px',
      height: LENS_DIAMETER + 'px',
      borderRadius: '50%',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      border: BORDER,
      opacity: '0',
      transition: 'opacity .15s ease',
      zIndex: '3'
    });
    wrap.appendChild(lens);

    const updateBackground = () => {
      const rect = img.getBoundingClientRect();
      const displayW = rect.width;
      const displayH = rect.height;

      lens.style.backgroundImage = `url('${img.currentSrc || img.src}')`;
      lens.style.backgroundRepeat = 'no-repeat';
      lens.style.backgroundSize = `${displayW * ZOOM}px ${displayH * ZOOM}px`;
    };

    const move = (e) => {
      const rect = img.getBoundingClientRect();
      const pageX = (e.touches ? e.touches[0].clientX : e.clientX);
      const pageY = (e.touches ? e.touches[0].clientY : e.clientY);

      let x = pageX - rect.left;
      let y = pageY - rect.top;
      x = Math.max(0, Math.min(rect.width, x));
      y = Math.max(0, Math.min(rect.height, y));

      lens.style.left = (x - LENS_DIAMETER / 2) + 'px';
      lens.style.top  = (y - LENS_DIAMETER / 2) + 'px';

      const bgPosX = -((x * ZOOM) - LENS_DIAMETER / 2);
      const bgPosY = -((y * ZOOM) - LENS_DIAMETER / 2);
      lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
    };

    const show = () => { lens.style.opacity = '1'; };
    const hide = () => { lens.style.opacity = '0'; };

    updateBackground();
    window.addEventListener('resize', updateBackground);
    img.addEventListener('mouseenter', show);
    img.addEventListener('mouseleave', hide);
    img.addEventListener('mousemove', move);

    img.addEventListener('touchstart', (e) => { show(); move(e); }, {passive:true});
    img.addEventListener('touchmove', move, {passive:true});
    img.addEventListener('touchend', hide);

    if (!img.complete) {
      img.addEventListener('load', updateBackground, {once:true});
    }
  }
})();
