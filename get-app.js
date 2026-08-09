// "Get the app" dialog.
//
// Installing differs completely by platform and there is no single button that
// works everywhere:
//   Android/Chrome  fires beforeinstallprompt, so we can install on a click.
//   iOS/Safari      has no such event; the only route is Share > Add to Home
//                   Screen, so it gets instructions rather than a dead button.
//   Desktop         installs too, but the honest pitch is "open it".
//
// A single "Download" button that silently does nothing on iOS is worse than
// telling people which two taps to make.
(function () {
  var deferred = null
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault()
    deferred = e
    document.documentElement.classList.add('can-install')
  })

  var ua = navigator.userAgent
  var isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)
  var isAndroid = /android/i.test(ua)
  var installed =
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

  function dialog() {
    var wrap = document.createElement('div')
    wrap.className = 'getapp-backdrop'
    wrap.innerHTML =
      '<div class="getapp" role="dialog" aria-modal="true" aria-labelledby="getapp-h">' +
        '<button class="getapp-x" aria-label="Close">&times;</button>' +
        '<img src="assets/icon-192.png" alt="" width="64" height="64" />' +
        '<h2 id="getapp-h">Get Rihla on your phone</h2>' +
        '<p class="getapp-sub">Installs like an app: full screen, its own icon, and your itinerary works offline.</p>' +
        '<div class="getapp-body"></div>' +
        '<p class="getapp-fine">Free. No account needed to try.</p>' +
      '</div>'
    var body = wrap.querySelector('.getapp-body')

    if (installed) {
      body.innerHTML = '<p class="getapp-done">Already installed. Open Rihla from your home screen.</p>'
    } else if (isIOS) {
      body.innerHTML =
        '<ol class="getapp-steps">' +
          '<li>Tap the <strong>Share</strong> button in Safari</li>' +
          '<li>Choose <strong>Add to Home Screen</strong></li>' +
          '<li>Tap <strong>Add</strong></li>' +
        '</ol>' +
        '<a class="btn btn-ghost" href="app/">Or open it in the browser</a>'
    } else if (deferred) {
      var b = document.createElement('button')
      b.className = 'btn btn-primary getapp-install'
      b.textContent = 'Install Rihla'
      b.onclick = function () {
        deferred.prompt()
        deferred.userChoice.finally(function () { close() })
      }
      body.appendChild(b)
    } else if (isAndroid) {
      body.innerHTML =
        '<ol class="getapp-steps">' +
          '<li>Open <a href="app/">rihlatc.com/app</a> in Chrome</li>' +
          '<li>Tap the <strong>⋮</strong> menu</li>' +
          '<li>Choose <strong>Install app</strong></li>' +
        '</ol>'
    } else {
      body.innerHTML =
        '<a class="btn btn-primary" href="app/">Open Rihla</a>' +
        '<p class="getapp-steps">On a phone, open rihlatc.com and tap “Get the app”.</p>'
    }

    function close() { wrap.remove(); document.removeEventListener('keydown', onKey) }
    function onKey(e) { if (e.key === 'Escape') close() }
    wrap.querySelector('.getapp-x').onclick = close
    wrap.onclick = function (e) { if (e.target === wrap) close() }
    document.addEventListener('keydown', onKey)
    document.body.appendChild(wrap)
    wrap.querySelector('.getapp-x').focus()
  }

  // Any element with data-get-app opens it.
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-get-app]')
    if (!t) return
    e.preventDefault()
    dialog()
  })
})()
