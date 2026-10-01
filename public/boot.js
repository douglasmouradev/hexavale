/* Aviso em texto simples se o app não abrir (sem innerHTML: a mensagem de erro nunca vira HTML). */
;(function () {
  function avisar(titulo, detalhe) {
    var root = document.getElementById('root')
    if (!root || root.dataset.ready) return
    var p = document.createElement('p')
    p.style.cssText = 'padding:24px;font:600 16px/1.4 Segoe UI,sans-serif'
    p.appendChild(document.createTextNode(titulo))
    p.appendChild(document.createElement('br'))
    var span = document.createElement('span')
    span.style.fontWeight = '400'
    span.textContent = detalhe
    p.appendChild(span)
    root.replaceChildren(p)
  }

  window.setTimeout(function () {
    var root = document.getElementById('root')
    if (!root || root.dataset.ready) return
    if (root.textContent.indexOf('Carregando') === -1) return
    avisar(
      'O app demorou para abrir.',
      'Feche esta aba e abra de novo. Se continuar, recarregue com Ctrl+Shift+R.',
    )
  }, 20000)

  window.addEventListener('error', function (event) {
    avisar('Não deu para abrir o app.', event.message || 'Erro no navegador')
  })

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason && event.reason.message ? event.reason.message : String(event.reason || '')
    avisar('Não deu para abrir o app.', reason)
  })
})()
