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
