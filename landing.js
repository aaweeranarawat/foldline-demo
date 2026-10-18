/* Landing page: motion layer (Lenis smooth scroll, GSAP scroll reveals), live result numbers from data/comparison.json,
   and a slowly rotating Mol* view of the real ESMFold ubiquitin prediction in the Results section. */
(async () => {
  const el = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BANDS = [
    { min: 90, color: '#0053d6', name: 'very high', range: '>90' },
    { min: 70, color: '#65cbf3', name: 'confident', range: '70–90' },
    { min: 50, color: '#ffdb13', name: 'low', range: '50–70' },
    { min: 0, color: '#ff7d45', name: 'very low', range: '<50' },
  ];
  const bandOf = (v) => BANDS.find((b) => v >= b.min) || BANDS[3];

  /* data */
  let data;
  try {
    data = await fetch('data/comparison.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  } catch (e) { data = null; }
  const ref = data && (data.models.find((m) => m.id === data.reference_model) || data.models[0]);

  if (ref) {
    const N = data.residues, c = ref.comparison;
    el('ex-h') && (el('ex-h').textContent = `Ubiquitin: ${ref.label} shown, ${data.models.filter((m) => Array.isArray(m.plddt)).length} predictions in the full comparison`);
    el('ex-stats').innerHTML =
      `<div><dt>Mean pLDDT</dt><dd class="num" data-count="${c.mean_plddt}" data-dec="1">${c.mean_plddt.toFixed(1)}</dd></div>` +
      `<div><dt>pTM</dt><dd class="num"${c.ptm != null ? ` data-count="${c.ptm}" data-dec="3"` : ''}>${c.ptm != null ? c.ptm.toFixed(3) : '—'}</dd></div>` +
      `<div><dt>Residues below 70</dt><dd class="num"><span data-count="${c.low_confidence_residues}" data-dec="0">${c.low_confidence_residues}</span> <small>of ${N}</small></dd></div>`;
    const counts = BANDS.map((b) => ref.plddt.filter((v) => bandOf(v) === b).length);
    const pct = counts.map((n) => (100 * n) / N);
    el('ex-bar').innerHTML = BANDS.map((b, i) => (counts[i] ? `<span style="width:${pct[i]}%;background:${b.color}"></span>` : '')).join('');
    el('ex-bar').setAttribute('aria-label', BANDS.map((b, i) => `${pct[i].toFixed(1)}% ${b.name}`).join(', '));
    el('ex-list').innerHTML = BANDS.map((b, i) => `<li><i style="background:${b.color}"></i>${b.name} <small>${b.range}</small><b class="num">${pct[i].toFixed(1)}%</b></li>`).join('');
  }

  /* ---------- motion: Lenis smooth scroll, GSAP entrance + scroll reveals, Vanta network backdrop ----------
     All of it is progressive enhancement: if a library fails to load, or the visitor prefers reduced
     motion, the page is fully visible and usable without it. */
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const lowPower = (navigator.hardwareConcurrency || 8) < 4 || window.innerWidth < 760;

  // split the headline into masked words (screen readers still get the full sentence)
  const splitWords = (root) => {
    const label = root.textContent.replace(/\s+/g, ' ').trim();
    root.setAttribute('aria-label', label);
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
          const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = tok;
          w.appendChild(wi); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(root);
  };

  if (hasGsap) {
    document.documentElement.classList.add('gsap-on');
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync */
      let lenis = null;
      if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({ lerp: 0.1, anchors: { offset: -8 } });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      /* scroll reveals for cards and steps (one batched trigger per group, per GreenSock's guidance) */
      gsap.set('.reveal', { opacity: 0, y: 24 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%', once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, overwrite: true }),
      });

      /* result numbers count up to their real values; the bar segments grow in */
      const counters = [...document.querySelectorAll('[data-count]')];
      const segs = [...document.querySelectorAll('#ex-bar span')];
      counters.forEach((c) => { c.textContent = (0).toFixed(+c.dataset.dec); });
      gsap.set(segs, { scaleX: 0, transformOrigin: 'left center' });
      ScrollTrigger.create({
        trigger: '#example .example', start: 'top 82%', once: true,
        onEnter: () => {
          counters.forEach((c) => {
            const end = +c.dataset.count, dec = +c.dataset.dec, o = { v: 0 };
            gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out',
              onUpdate: () => { c.textContent = o.v.toFixed(dec); },
              onComplete: () => { c.textContent = end.toFixed(dec); } });
          });
          gsap.to(segs, { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.15 });
        },
      });

      return () => { if (lenis) lenis.destroy(); };
    });

    // reduced motion: nothing hidden, nothing moving (CSS already forces .reveal visible)
  } else if ('IntersectionObserver' in window) {
    const reveals = [...document.querySelectorAll('.reveal')];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    reveals.forEach((r) => io.observe(r));
  } else document.querySelectorAll('.reveal').forEach((r) => r.classList.add('in'));

  /* 3D hero */
  const fallback = () => { el('viz-fallback').hidden = false; el('spin-toggle').hidden = true; };
  if (!ref || typeof molstar === 'undefined') return fallback();
  let viewer;
  try {
    viewer = await molstar.Viewer.create(el('molstar-viewer'), {
      layoutIsExpanded: false, layoutShowControls: false, layoutShowSequence: false,
      layoutShowLog: false, layoutShowLeftPanel: false, collapseLeftPanel: true,
      viewportShowControls: false, viewportShowExpand: false, viewportShowAnimation: false,
      viewportShowSettings: false, viewportShowScreenshotControls: false, viewportShowReset: false,
      viewportShowSelectionMode: false, viewportShowTrajectoryControls: false,
      viewportBackgroundColor: '#102a47', allowMajorPerformanceCaveat: true,
    });
  } catch (e) { return fallback(); }

  const plugin = viewer.plugin;
  try {
    const pdb = await fetch(`data/${encodeURIComponent(ref.pdb)}`).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
    const before = new Set(plugin.managers.structure.hierarchy.current.structures.map((s) => s.cell.transform.ref));
    await viewer.loadStructureFromData(pdb, 'pdb', { dataLabel: ref.label });
    const added = plugin.managers.structure.hierarchy.current.structures.filter((s) => !before.has(s.cell.transform.ref));
    const reps = added.flatMap((s) => (s.components || []).flatMap((c) => c.representations || []).map((r) => r.cell));
    const build = plugin.state.data.build();
    for (const cell of reps) build.to(cell).update((old) => { old.colorTheme = { name: 'plddt-confidence', params: {} }; });
    await build.commit();
    plugin.managers.camera.reset();
  } catch (e) { console.error(e); return fallback(); }

  /* slow rotation with an explicit pause control; off by default for reduced-motion users */
  const btn = el('spin-toggle');
  let spinning = false;
  const setSpin = (on) => {
    spinning = on;
    // Merge into the existing trackball settings (as Mol*'s own toggle does); replacing them wholesale breaks rendering.
    const tb = plugin.canvas3d.props.trackball;
    plugin.canvas3d.setProps({ trackball: { ...tb, animate: on ? { name: 'spin', params: { speed: 0.25, axis: [0, -1, 0] } } : { name: 'off', params: {} } } });
    btn.setAttribute('aria-pressed', String(!on));
    btn.title = on ? 'Pause rotation' : 'Resume rotation';
    btn.querySelector('use').setAttribute('href', on ? '#pause' : '#play');
    btn.querySelector('.sr-only').textContent = btn.title;
  };
  btn.addEventListener('click', () => setSpin(!spinning));
  setSpin(!reduceMotion);
})();
