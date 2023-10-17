export const requestIdleCallback: typeof globalThis.requestIdleCallback =
  window.requestIdleCallback ||
  function requestIdleCallback(cb) {
    var start = Date.now()
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start))
        },
      })
    }, 1)
  }

export const cancelIdleCallback: typeof globalThis.cancelIdleCallback =
  window.cancelIdleCallback ||
  function cancelIdleCallback(id) {
    clearTimeout(id)
  }
