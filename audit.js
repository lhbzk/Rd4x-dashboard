/* ============================================================
   RD4X DASHBOARD V10 — Audit Page
   ============================================================ */
'use strict';

window.renderAudit = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Auditoria</h1>
        <p class="page-desc">Registro de todas as ações administrativas</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="audit-search" placeholder="Buscar admin, ação, alvo...">
        <select class="select" id="audit-result" style="max-width:160px">
          <option value="all">Todos resultados</option>
          <option>Sucesso</option><option>Falha</option>
        </select>
        <div class="ml-auto text-muted" style="font-size:12px" id="audit-count"></div>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>Data/Hora</th><th>Administrador</th><th>Ação</th>
            <th>Alvo</th><th>Resultado</th><th>Detalhes</th>
          </tr></thead>
          <tbody id="audit-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const audit = await Api.getAudit();
  const st = { query:'', result:'all' };

  const draw = () => {
    const filtered = audit.filter(a => {
      if (st.result !== 'all' && a.result !== st.result) return false;
      const q = st.query;
      if (!q) return true;
      return [a.admin, a.action, a.target, a.result, a.details, a.targetUserId]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });

    const tbody = el.querySelector('#audit-tbody');
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg class="icon"><use href="#i-audit"/></svg><div>Nenhum registro</div></div></td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(a => `
        <tr class="clickable" data-aud-id="${a.id}">
          <td>${Utils.formatDate(a.createdAt)}</td>
          <td class="cell-mono">${Utils.escapeHtml(a.admin)}</td>
          <td class="cell-strong">${Utils.escapeHtml(a.action)}</td>
          <td class="cell-mono">${Utils.escapeHtml(a.target || '—')}</td>
          <td>${Utils.statusBadge(a.result)}</td>
          <td class="truncate" style="max-width:280px">${Utils.escapeHtml(a.details)}</td>
        </tr>
      `).join('');
    }
    el.querySelector('#audit-count').textContent = `${filtered.length} registro(s)`;

    tbody.querySelectorAll('tr[data-aud-id]').forEach(row => {
      row.addEventListener('click', () => {
        const a = audit.find(x => x.id === row.dataset.audId);
        if (a) openAuditModal(a);
      });
    });
  };

  el.querySelector('#audit-search').addEventListener('input', Utils.debounce(e => {
    st.query = e.target.value.trim().toLowerCase(); draw();
  }, 200));
  el.querySelector('#audit-result').addEventListener('change', e => { st.result = e.target.value; draw(); });
  draw();
};

window.openAuditModal = function(a) {
  Modals.open({
    title: 'Registro de auditoria',
    subtitle: a.id,
    content: `
      <div class="field-grid">
        <div class="field"><div class="field-label">Data/Hora</div><div class="field-value">${Utils.formatDate(a.createdAt)}</div></div>
        <div class="field"><div class="field-label">Administrador</div><div class="field-value mono">${Utils.escapeHtml(a.admin)}</div></div>
        <div class="field"><div class="field-label">Ação</div><div class="field-value">${Utils.escapeHtml(a.action)}</div></div>
        <div class="field"><div class="field-label">Alvo</div><div class="field-value mono">${Utils.escapeHtml(a.target || '—')}</div></div>
        <div class="field"><div class="field-label">Resultado</div><div class="field-value">${Utils.statusBadge(a.result)}</div></div>
      </div>
      <div class="section-title">Detalhes</div>
      <div class="field-value" style="font-size:13px;color:var(--text-2);line-height:1.6">${Utils.escapeHtml(a.details)}</div>
    `,
    actions: [{ label: 'Fechar', className: 'btn-primary' }]
  });
};