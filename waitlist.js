// Waitlist form → the Rihla API. Emails are given voluntarily and stored
// server-side (PDPPL: the only personal data is the address; deletion on
// request via hello@rihlatc.com). Progressive enhancement: without JS the
// section simply shows the email link.
;(function () {
  var forms = document.querySelectorAll('.waitlist-form')
  forms.forEach(function (form) { bind(form) })

  function bind(form) {
  var input = form.querySelector('input[type="email"]')
  var btn = form.querySelector('button')
  var note = form.parentElement.querySelector('.waitlist-note')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var email = (input.value || '').trim()
    if (!email) return
    btn.disabled = true
    btn.textContent = '…'
    fetch('https://api.rihlatc.com/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: 'homepage' }),
    })
      .then(function (r) {
        if (!r.ok) {
          return r.json().then(function (j) {
            var e = new Error(String(r.status))
            e.serverMessage = j && j.error
            e.suggestion = j && j.suggestion
            throw e
          })
        }
        form.style.display = 'none'
        note.textContent = "You're on the list — we'll write before Qatar Travel Mart 2026. شكرًا!"
        note.classList.add('ok')
      })
      .catch(function (err) {
        btn.disabled = false
        btn.textContent = 'Notify me'
        // Show the server's actual reason ("Did you mean gmail.com?", "That
        // doesn't look like an email address") instead of a generic shrug.
        if (err && err.serverMessage) {
          note.textContent = err.serverMessage
          if (err.suggestion) input.value = err.suggestion
        } else {
          note.textContent = "That didn't work — check the address, or email hello@rihlatc.com and we'll add you."
        }
      })
  })
  }
})()
