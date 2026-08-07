// Mobile navigation. The links used to be display:none below 640px with no way
// to reach Product, About or Investors on a phone — the pages existed but were
// unreachable for most visitors.
(function () {
  var burger = document.querySelector('.nav-burger')
  var links = document.getElementById('nav-links')
  if (!burger || !links) return
  function set(open) {
    links.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', String(open))
    burger.textContent = open ? '✕' : '☰'
  }
  burger.addEventListener('click', function () {
    set(!links.classList.contains('open'))
  })
  // Escape closes, and so does following a link.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') set(false)
  })
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') set(false)
  })
})()

// Hero parallax. Each layer moves at its own rate on scroll, which is what
// makes a flat gradient read as depth. Deliberately small numbers: this should
// register as "the scene has weight", not as an effect anyone notices.
(function () {
  var layers = [].slice.call(document.querySelectorAll('.hero-layers .layer'))
  if (!layers.length) return
  // Honour the OS setting rather than animating over someone's objection.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var ticking = false
  function place() {
    var y = window.scrollY || 0
    // Below the hero nothing is visible, so stop doing the work.
    if (y > window.innerHeight) { ticking = false; return }
    for (var i = 0; i < layers.length; i++) {
      var d = parseFloat(layers[i].getAttribute('data-depth')) || 0
      layers[i].style.transform = 'translate3d(0,' + (y * d).toFixed(1) + 'px,0)'
    }
    ticking = false
  }
  window.addEventListener('scroll', function () {
    if (ticking) return
    ticking = true
    requestAnimationFrame(place)
  }, { passive: true })
  place()
})()

// Scroll reveal and count-up.
//
// The techniques worth taking from the animation libraries, written against our
// own stack: those libraries install through the shadcn CLI and assume Tailwind
// and Next.js, none of which this site uses. This is the same effect in about
// forty lines and no dependencies.
//
// IntersectionObserver rather than a scroll handler: the browser does the work
// off the main thread, and elements are unobserved once shown, so scrolling a
// long page costs nothing after the first pass.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var targets = document.querySelectorAll(
    '.theme-card, .card, .step, .num, .two-col > *, .hero-shot, .demo-frame, .cmp-scroll'
  )
  if (!targets.length) return

  // With motion turned down, show everything immediately. The content is the
  // point; the animation is decoration.
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('shown') })
    return
  }

  targets.forEach(function (el) { el.classList.add('reveal') })
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return
      // Stagger siblings so a row arrives as a row, not all at once.
      var sibs = Array.prototype.slice.call(e.target.parentNode.children)
      e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 70 + 'ms'
      e.target.classList.add('shown')
      io.unobserve(e.target)
    })
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  targets.forEach(function (el) { io.observe(el) })

  // Count the headline numbers up when they arrive. Only plain integers, so
  // "6M by 2030" and "10–12%" are left exactly as written.
  var nums = document.querySelectorAll('.num b, .stat b')
  var numIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return
      numIO.unobserve(e.target)
      var target = parseInt(e.target.textContent.replace(/[^0-9]/g, ''), 10)
      if (!/^\d+$/.test(e.target.textContent.trim()) || !target) return
      var start = performance.now()
      var dur = 850
      ;(function tick(now) {
        var p = Math.min((now - start) / dur, 1)
        // Ease out: fast first, settling at the end.
        e.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(tick)
      })(start)
    })
  }, { threshold: 0.6 })
  nums.forEach(function (el) { numIO.observe(el) })
})()
