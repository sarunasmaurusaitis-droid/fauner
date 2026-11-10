// Pakartotinai naudojami formos elementai: pasirinkimas iš sąrašo su paieška, dvigubas slankiklis
import { esc, $, $$, icon } from './app.js?v=11';

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Pasirinkimas iš ilgo sąrašo (miestai, veislės) su paieška.
// multi = true – galima pasirinkti kelis (filtrams), false – vieną (formoms).
export function combo(el, { options, value, multi = false, placeholder = 'Pasirink', onChange, required = false, name = '', allLabel = '' }) {
  let selected = multi ? [...(value || [])] : (value || '');
  let opts = options;
  el.classList.add('combo');
  el.innerHTML = `
    <button type="button" class="input combo-btn" aria-haspopup="listbox"><span class="combo-val"></span>${icon('next', 'sm rot')}</button>
    <input class="combo-req" tabindex="-1" aria-hidden="true" ${required ? 'required' : ''} name="${esc(name)}">
    <div class="combo-pop" hidden>
      <input class="input combo-search" placeholder="Ieškoti…" autocomplete="off">
      <div class="combo-list" role="listbox"></div>
      ${multi ? '<div class="row gap combo-foot"><button type="button" class="link" data-clear>Išvalyti</button><button type="button" class="btn primary sm" data-done>Gerai</button></div>' : ''}
    </div>`;
  const btn = $('.combo-btn', el), pop = $('.combo-pop', el), list = $('.combo-list', el), search = $('.combo-search', el), req = $('.combo-req', el);
  function label() {
    const v = multi ? (selected.length ? selected.join(', ') : '') : selected;
    $('.combo-val', el).textContent = v || allLabel || placeholder;
    $('.combo-val', el).classList.toggle('sub', !v && !allLabel);
    req.value = multi ? selected.join(',') : selected;
  }
  function draw() {
    const q = norm(search.value.trim());
    const items = opts.filter(o => !q || norm(o).includes(q));
    list.innerHTML = items.length ? items.map(o => {
      const on = multi ? selected.includes(o) : selected === o;
      return `<button type="button" class="combo-opt ${on ? 'on' : ''}" data-v="${esc(o)}">${multi ? `<span class="cbox">${on ? icon('check', 'xs') : ''}</span>` : ''}${esc(o)}</button>`;
    }).join('') : '<p class="sub small pad">Nieko nerasta</p>';
    $$('.combo-opt', list).forEach(b => b.onclick = () => {
      const v = b.dataset.v;
      if (multi) { selected.includes(v) ? selected.splice(selected.indexOf(v), 1) : selected.push(v); draw(); label(); onChange?.([...selected]); }
      else { selected = v; label(); close(); onChange?.(selected); }
    });
  }
  const outside = e => { if (!el.contains(e.target)) close(); };
  function open() { pop.hidden = false; el.classList.add('open'); search.value = ''; draw(); setTimeout(() => search.focus(), 0); document.addEventListener('pointerdown', outside); }
  function close() { pop.hidden = true; el.classList.remove('open'); document.removeEventListener('pointerdown', outside); }
  btn.onclick = () => pop.hidden ? open() : close();
  search.oninput = draw;
  search.onkeydown = e => { if (e.key === 'Escape') close(); if (e.key === 'Enter') { e.preventDefault(); $('.combo-opt', list)?.click(); } };
  if (multi) {
    $('[data-clear]', el).onclick = () => { selected = []; draw(); label(); onChange?.([]); };
    $('[data-done]', el).onclick = close;
  }
  label();
  return {
    get value() { return multi ? [...selected] : selected; },
    set value(v) { selected = multi ? [...(v || [])] : (v || ''); label(); },
    setOptions(o) { opts = o; if (!multi && selected && !o.includes(selected)) { selected = ''; label(); } },
  };
}

// Slankiklis su dviem taškais (nuo–iki)
export function dualRange(el, { min, max, from, to, step = 1, format = v => v, onChange }) {
  el.classList.add('dual');
  el.innerHTML = `<div class="dual-track"><div class="dual-fill"></div></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${from}" aria-label="Nuo">
    <input type="range" min="${min}" max="${max}" step="${step}" value="${to}" aria-label="Iki">`;
  const [a, b] = $$('input', el), fill = $('.dual-fill', el);
  function upd(e) {
    let x = Number(a.value), y = Number(b.value);
    if (x > y) { if (e?.target === a) { a.value = y; x = y; } else { b.value = x; y = x; } }
    fill.style.left = ((x - min) / (max - min) * 100) + '%';
    fill.style.right = (100 - (y - min) / (max - min) * 100) + '%';
    onChange?.(x, y, format);
  }
  a.oninput = b.oninput = upd;
  upd();
  return { set(x, y) { a.value = x; b.value = y; upd(); } };
}
