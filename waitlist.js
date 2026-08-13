// Waitlist form → the Rihla API. Emails are given voluntarily and stored
// server-side (PDPPL: the only personal data is the address; deletion on
// request via hello@rihlatc.com). Progressive enhancement: without JS the
// section simply shows the email link.
;(function () {
  var form = document.querySelector('.waitlist-form')
  if (!form) return
  var input = form.querySelector('input[type="email"]')
  var btn = form.querySelector('button')
  var note = document.querySelector('.waitlist-note')

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
        if (!r.ok) throw new Error(String(r.status))
        form.style.display = 'none'
        note.textContent = "You're on the list — we'll write before Qatar Travel Mart 2026. شكرًا!"
        note.classList.add('ok')
      })
      .catch(function () {
        btn.disabled = false
        btn.textContent = 'Notify me'
        note.textContent = "That didn't work — check the address, or email hello@rihlatc.com and we'll add you."
      })
  })
})()
