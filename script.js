(() => {
  'use strict';
  const config = window.VEYFIR_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';

  // Original SVG stream study: shared flow field, tapered strands and travelling
  // pockets of negative space. Each strand is one smooth, open contour.
  const lines = [];
  for (const [id, base, start, end, count] of [
    ['upper-flow', 203, 460, 1740, 7],
    ['lower-flow', 762, -150, 1770, 9]
  ]) {
    for (let i = 0; i < count; i++) {
      const path = document.createElementNS(svgNS, 'path');
      document.getElementById(id).appendChild(path);
      path.style.opacity = String(i % 3 === 0 ? .64 : .35);
      lines.push({path, base, start, end, lane: i - (count - 1) / 2, index: i});
    }
  }
  const blades = Array.from({ length: 7 }, () => {
    const path = document.createElementNS(svgNS, 'path');
    document.getElementById('iris-blades').appendChild(path);
    return path;
  });
  const TAU = Math.PI * 2;
  const number = n => n.toFixed(2);
  const polar = (r, a) => `${number(Math.cos(a) * r)} ${number(Math.sin(a) * r)}`;

  function updateBlades(t) {
    document.getElementById('iris-rotor').setAttribute('transform', `rotate(${number(t * 4)} 0 0)`);
    const aperture = 79 + 13 * Math.cos(t * TAU / 14);
    const twist = .68 + .12 * Math.sin(t * TAU / 14);
    blades.forEach((path, i) => {
      const a = -Math.PI / 2 + i * TAU / 7;
      const b = a + TAU / 7;
      // Adjacent blades share an edge, leaving one clean polygonal aperture.
      path.setAttribute('d', `M ${polar(131, a)} A 131 131 0 0 1 ${polar(131, b)} L ${polar(aperture, b + twist)} L ${polar(aperture, a + twist)} Z`);
    });
  }

  function updateLines(t) {
    for (const {path, base, start, end, lane, index} of lines) {
      // Ends drift slowly instead of blinking, resetting or forming a dash pattern.
      const left = start + (index % 3) * 32 + 22 * Math.sin(t * .12 + index * .6);
      const right = end - (index % 4) * 96 + 35 * Math.sin(t * .1 + index * .4);
      const points = Array.from({length: 49}, (_, i) => {
        const u = i / 48;
        const x = left + (right - left) * u;
        const pocket = Math.exp(-Math.pow((x - (310 + 100 * Math.sin(t * .13))) / 175, 2));
        const pocket2 = Math.exp(-Math.pow((x - (1320 + 90 * Math.cos(t * .11))) / 210, 2));
        const spine = 7 * Math.sin(x / 180 - t * .18)
          + 2.5 * Math.sin(x / 49 + t * .22);
        const spread = 2 + 6 * pocket + 4 * pocket2;
        const taper = Math.pow(Math.sin(Math.PI * u), .5);
        return [x, base + spine + lane * spread * taper];
      });
      let d = `M ${points[0].map(number).join(' ')}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i], p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        // Broad gaps in selected strands, carried along by the shared flow.
        const gap = index % 3 === 1 && i >= 16 && i <= 19;
        if (gap) { d += ` M ${p2.map(number).join(' ')}`; continue; }
        d += ` C ${number(p1[0] + (p2[0]-p0[0])/6)} ${number(p1[1] + (p2[1]-p0[1])/6)}, ${number(p2[0] - (p3[0]-p1[0])/6)} ${number(p2[1] - (p3[1]-p1[1])/6)}, ${p2.map(number).join(' ')}`;
      }
      path.setAttribute('d', d);
    }
  }
  let rafId = 0;
  let lastTime = 0;
  let elapsed = 0;
  let heroVisible = true;
  const mobile = window.matchMedia('(max-width: 600px)');
  function draw() {
    if (!mobile.matches) updateLines(elapsed);
    updateBlades(elapsed);
  }
  function tick(now) {
    if (lastTime) elapsed += Math.min(now - lastTime, 50) / 1000;
    lastTime = now;
    draw();
    rafId = requestAnimationFrame(tick);
  }
  function refreshAnimation() {
    cancelAnimationFrame(rafId);
    lastTime = 0;
    const paused = document.hidden || !heroVisible || reducedMotion.matches;
    document.documentElement.classList.toggle('motion-paused', paused);
    if (!paused) rafId = requestAnimationFrame(tick);
    else if (reducedMotion.matches) { elapsed = 0; draw(); }
  }
  updateLines(0);
  updateBlades(0);
  refreshAnimation();
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    refreshAnimation();
  }).observe(document.querySelector('.hero'));
  document.addEventListener('visibilitychange', refreshAnimation);
  reducedMotion.addEventListener('change', refreshAnimation);
  mobile.addEventListener('change', () => { updateLines(elapsed); });

  document.getElementById('year').textContent = String(new Date().getFullYear());

  const downloadFeedback = document.getElementById('download-feedback');
  document.querySelectorAll('[data-download]').forEach((link) => {
    const platform = link.dataset.download;
    const configured = config.downloads?.[platform];
    // A real HTTPS release or same-site relative installer path can be configured.
    const safe = typeof configured === 'string' && (
      /^https:\/\//i.test(configured) || /^(?!\/\/|[a-z]+:)[\w./-]+$/i.test(configured)
    );
    if (safe) link.href = configured;
    else link.addEventListener('click', (event) => {
      event.preventDefault();
      downloadFeedback.textContent = `${platform === 'mac' ? 'macOS' : 'Windows'} download isn't available yet. Please check back soon.`;
    });
  });

  const dialog = document.getElementById('bug-dialog');
  const form = document.getElementById('bug-form');
  const status = document.getElementById('form-status');
  const sendButton = form.querySelector('button[type=submit]');

  let opener;
  let lastSent = 0;
  document.querySelectorAll('.open-report').forEach(button => button.addEventListener('click', () => {
    opener = button;
    status.textContent = '';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    opener?.focus();
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sendButton.disabled || !form.reportValidity()) return;
    if (form.elements.company.value.trim()) return; // Anti-spam honeypot
    const email = form.elements.email.value.trim();
    const platform = form.elements.platform.value;
    const message = form.elements.message.value.trim();
    if (message.length < 10) { status.textContent = 'Please describe the issue in at least 10 characters.'; form.elements.message.focus(); return; }
    if (Date.now() - lastSent < 30000) { status.textContent = 'Please wait a moment before sending another report.'; return; }
    const emailSettings = config.emailjs || {};
    const ready = emailSettings.publicKey && emailSettings.serviceId && emailSettings.templateId && window.emailjs;

    if (!ready) {
      if (config.supportEmail) {
        const subject = encodeURIComponent(`Veyfir bug report - ${platform}`);
        const body = encodeURIComponent(`From: ${email}\nOS: ${platform}\n\n${message}`);
        window.location.href = `mailto:${config.supportEmail}?subject=${subject}&body=${body}`;
        status.textContent = 'Continue in your mail app and press Send there to submit your report.';
      } else {
        status.textContent = 'Bug reports are not available yet. Your report has not been sent; your text is still here.';
      }
      return;
    }

    sendButton.disabled = true;
    status.textContent = 'Sending…';
    try {
      await window.emailjs.send(emailSettings.serviceId, emailSettings.templateId, {
        from_name: 'Veyfir user',
        from_email: email,
        reply_to: email,
        email,
        platform,
        message,
        subject: `Veyfir bug report — ${platform}`,
        source: 'veyfir-site'
      }, { publicKey: emailSettings.publicKey });
      status.textContent = 'Thanks! Your bug report was sent successfully.';
      lastSent = Date.now();
      form.reset();
    } catch (error) {
      console.error('Veyfir bug report failed:', error);
      status.textContent = 'Something went wrong while sending. Please try again.';
    } finally {
      sendButton.disabled = false;
    }
  });
})();
