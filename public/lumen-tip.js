(function () {
  if (window.__lumenTipBooted) return;
  window.__lumenTipBooted = true;

  var el = document.getElementById('lumen-tip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lumen-tip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('data-lumen-tooltip', 'default');
    document.documentElement.appendChild(el);
  }

  function hide() {
    el.classList.remove('is-on');
    el.style.display = 'none';
  }

  function show(target) {
    if (target && target.nodeType === 3) target = target.parentElement;
    var node = target && target.closest ? target.closest('[data-tip]') : null;
    if (!node) {
      hide();
      return;
    }
    var label = node.getAttribute('data-tip');
    if (!label) {
      hide();
      return;
    }
    var side = node.getAttribute('data-tip-side') || 'right';
    el.dataset.side = side;
    el.textContent = label;
    var r = node.getBoundingClientRect();
    if (side === 'right') {
      el.style.top = r.top + r.height / 2 + 'px';
      el.style.left = r.right + 8 + 'px';
      el.style.transform = 'translate(0,-50%)';
    } else if (side === 'left') {
      el.style.top = r.top + r.height / 2 + 'px';
      el.style.left = r.left - 8 + 'px';
      el.style.transform = 'translate(-100%,-50%)';
    } else if (side === 'top') {
      el.style.top = r.top - 8 + 'px';
      el.style.left = r.left + r.width / 2 + 'px';
      el.style.transform = 'translate(-50%,-100%)';
    } else {
      el.style.top = r.bottom + 8 + 'px';
      el.style.left = r.left + r.width / 2 + 'px';
      el.style.transform = 'translate(-50%,0)';
    }
    el.classList.add('is-on');
    el.style.display = 'inline-flex';
  }

  document.addEventListener('pointerover', function (event) {
    show(event.target);
  }, true);
  document.addEventListener('mouseover', function (event) {
    show(event.target);
  }, true);
  window.addEventListener('scroll', hide, true);
})();
