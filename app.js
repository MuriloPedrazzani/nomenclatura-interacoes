'use strict';
(() => {
  document.documentElement.classList.add('js');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const setMenu = open => {
    navToggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      navToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => setMenu(false));
  const data = window.TCC_DATA;
  if (!data) return;
  const num = (value, digits = 2) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const signed = value => (value > 0 ? '+' : value < 0 ? '−' : '') + num(Math.abs(value));
  const pct = value => num(value) + '%';
  const cell = (text, tag = 'td') => {
    const el = document.createElement(tag);
    if (tag === 'th') el.scope = 'row';
    el.textContent = text;
    return el;
  };
  const row = (target, values) => {
    const tr = document.createElement('tr');
    values.forEach((v, i) => tr.append(cell(v, i === 0 ? 'th' : 'td')));
    document.getElementById(target).append(tr);
  };
  data.nomenclature.forEach(d => row('naming-body', [d.model, d.pairs, d.grave, `${d.dcb} / ${d.grave}`, `${d.inn} / ${d.grave}`, `${signed(d.difference)} p.p.`]));
  data.central.forEach(d => row('central-body', [`${d.target}%`, `${d.accepted} / ${d.total}`, pct(d.coverage), `${d.under} / ${d.grave} (${pct(d.policyRate)})`, `${num(d.expected)} / ${d.grave} (${pct(d.expectedRate)})`, `${signed(d.difference)} p.p.`]));
  data.policyModels.forEach(d => row('models-body', [d.model, d.total, d.grave, ...d.differences.map(signed)]));
  data.transfer.forEach(d => row('transfer-body', [`${d.arm} / ${d.target}%`, `${d.originAccepted} / ${d.originTotal} (${pct(d.originCoverage)})`, `${d.destAccepted} / ${d.destTotal} (${pct(d.destCoverage)})`, `${signed(d.drift)} p.p.`, d.status === 'dentro' ? 'Dentro' : 'Fora']));
  const controls = document.getElementById('coverage-controls');
  const detail = document.getElementById('coverage-detail');
  const explorer = document.querySelector('.explorer');
  const status = document.getElementById('coverage-status');
  let selectedButton = null;
  const clear = () => {
    const returnFocus = selectedButton;
    controls.querySelectorAll('button').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-expanded', 'false');
    });
    detail.hidden = true;
    delete detail.dataset.selected;
    detail.innerHTML = '';
    explorer.classList.remove('has-selection');
    status.textContent = 'Detalhes fechados. As quatro metas continuam disponíveis, sem seleção.';
    returnFocus?.focus({ preventScroll: true });
    selectedButton = null;
  };
  const select = d => {
    controls.querySelectorAll('button').forEach(b => {
      const active = Number(b.dataset.target) === d.target;
      b.setAttribute('aria-pressed', String(active));
      b.setAttribute('aria-expanded', String(active));
      if (active) selectedButton = b;
    });
    detail.dataset.selected = 'true';
    detail.innerHTML = `<div class="detail-topline"><h4 id="detail-title">Meta de ${d.target}%</h4><button type="button" class="clear-selection">Fechar detalhes</button></div><p class="detail-result"><strong>${signed(d.difference)} <span>p.p.</span></strong><span>política − expectativa aleatória</span></p><dl class="metric-list"><div><dt>Respostas aceitas</dt><dd>${d.accepted} / ${d.total}<span>respostas disponíveis</span></dd></div><div><dt>Cobertura realizada</dt><dd>${pct(d.coverage)}<span>meta de ${d.target}%</span></dd></div><div><dt>Subestimações aceitas</dt><dd>${d.under} / ${d.grave}<span>${pct(d.policyRate)} · contribuições graves</span></dd></div><div><dt>Expectativa aleatória</dt><dd>${num(d.expected)} / ${d.grave}<span>${pct(d.expectedRate)} · contribuições graves</span></dd></div></dl><p class="detail-foot">O denominador ${d.grave} inclui as contribuições graves não aceitas. O comparador considera ${d.accepted} respostas no total, respeitando a cota de cada versão. Valores arredondados apenas para exibição.</p>`;
    detail.hidden = false;
    explorer.classList.add('has-selection');
    status.textContent = `Meta de ${d.target}% selecionada. Diferença de ${signed(d.difference)} pontos percentuais. Detalhes disponíveis após as quatro metas.`;
    detail.querySelector('button').addEventListener('click', clear);
  };
  detail.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); clear(); }
  });
  data.central.forEach(d => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'coverage-row';
    button.dataset.target = d.target;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'coverage-detail');
    button.setAttribute('aria-label', `Meta de ${d.target} por cento; diferença ${d.difference < 0 ? 'menos' : 'mais'} ${num(Math.abs(d.difference))} pontos percentuais. Ver detalhes.`);
    const anchor = d.difference < 0 ? 'right:16.6666667%' : 'left:83.3333333%';
    const width = Math.abs(d.difference) / 12 * 100;
    button.innerHTML = `<span class="target">${d.target}%</span><span class="plot-track" aria-hidden="true"><span class="plot-bar" style="${anchor};width:${width}%"></span></span><span class="value" aria-hidden="true">${signed(d.difference)}</span>`;
    button.addEventListener('click', () => select(d));
    controls.append(button);
  });
})();
