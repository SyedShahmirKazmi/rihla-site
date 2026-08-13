// Anonymous, cookieless visit counting via PostHog (EU cloud).
//
// PASTE THE PROJECT KEY BELOW to activate — until then this file does nothing.
// Create it at eu.posthog.com → new project → copy the "phc_..." key.
//
// Privacy posture, on purpose:
//   - persistence "memory": no cookies, no localStorage, nothing stored on the
//     visitor's device — so no consent banner is required for this counting.
//   - Visits are counted, visitors are NOT identified. No emails, no names.
//     (An anonymous visitor's identity is not ours to take.)
var POSTHOG_KEY = ''
;(function () {
  if (!POSTHOG_KEY) return
  var s = document.createElement('script')
  s.src = 'https://eu-assets.i.posthog.com/static/array.js'
  s.async = true
  s.onload = function () {
    window.posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      persistence: 'memory',
      autocapture: false,
      capture_pageview: true,
      disable_session_recording: true,
    })
  }
  document.head.appendChild(s)
})()
