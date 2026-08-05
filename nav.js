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
