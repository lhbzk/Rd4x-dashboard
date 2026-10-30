/* ============================================================
   RD4X DASHBOARD V10 — Incidents Page
   ============================================================ */
'use strict';

window.renderIncidents = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Incidentes</h1>
        <p class="page-desc">Monitoramento de incidentes e alertas de segurança</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="inc-search" placeholder="Buscar incidente, tipo, responsável...">
        <select class="select" id="inc-severity" style="max-width:160px">
          <option value="all">Todas severidades</option>
          <option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option>
        </select>
        <select class="select" id="inc-status" style="max-width:160px">
          <option value="all">Todos status</option>
          <option>Aberto</option><option>Investigando</option><option>Resolvido</option><option>Fechado</option>
        </select>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>Incident</th><th>Tipo</th><th>Severidade</th>
            <th>Data</th><th>Status</th><th>Responsável</th>
          </tr></thead>
          <tbody id="inc-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const incidents = await Api.getIncidents();
  const st = { query:'', severity:'all', status:'all' };

  const draw = () => {
    const filtered = incidents.filter(i => {
      if (st.severity !== 'all' && i.severity !== st.severity) return false;
      if (st.status !== 'all' && i.status !== st.status) return false;
      const q = st.query;
      if (!q) return true;
      return [i.id, i.type, i.severity, i.status, i.assignee, i.description].join(' ').toLowerCase().includes(q);
    });

    const tbody = el.querySelector('#inc-tbody');
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg class="icon"><use href="#i-incident"/></svg><div>Nenhum incidente encontrado</div></div></td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(i => `
        <tr class="clickable" data-inc-id="${i.id}">
          <td class="cell-strong cell-mono">${Utils.escapeHtml(i.id)}</td>
          <td>${Utils.escapeHtml(i.type)}</td>
          <td>${Utils.severityBadge(i.severity)}</td>
          <td>${Utils.formatDate(i.createdAt)}</td>
          <td>${Utils.statusBadge(i.status)}</td>
          <td class="cell-mono">${Utils.escapeHtml(i.assignee || '—')}</td>
        </tr>
      `).join('');
    }

    tbody.querySelectorAll('tr[data-inc-id]').forEach(row => {
      row.addEventListener('click', () => {
        const i = incidents.find(x => x.id === row.dataset.incId);
        if (i) openIncidentModal(i);
      });
    });
  };

  el.querySelector('#inc-search').addEventListener('input', Utils.debounce(e => {
    st.query = e.target.value.trim().toLowerCase(); draw();
  }, 200));
  el.querySelector('#inc-severity').addEventListener('change', e => { st.severity = e.target.value; draw(); });
  el.querySelector('#inc-status').addEventListener('change', e => { st.status = e.target.value; draw(); });
  draw();
};

window.openIncidentModal = function(incident) {
  const content = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${Utils.severityBadge(incident.severity)}
      ${Utils.statusBadge(incident.status)}
    </div>
    <div class="field-grid">
      <div class="field"><div class="field-label">Incident ID</div><div class="field-value mono">${Utils.escapeHtml(incident.id)}</div></div>
      <div class="field"><div class="field-label">Tipo</div><div class="field-value">${Utils.escapeHtml(incident.type)}</div></div>
      <div class="field"><div class="field-label">Data</div><div class="field-value">${Utils.formatDate(incident.createdAt)}</div></div>
      <div class="field"><div class="field-label">Responsável</div><div class="field-value mono">${Utils.escapeHtml(incident.assignee || '—')}</div></div>
    </div>
    <div class="section-title">Descrição</div>
    <div class="field-value" style="font-size:13px;color:var(--text-2);line-height:1.6">${Utils.escapeHtml(incident.description)}</div>
  `;

  Modals.open({
    title: 'Detalhes do incidente',
    subtitle: incident.id,
    content,
    size: 'lg',
    actions: [
      { label: 'Fechar', className: 'btn-ghost' },
      {
        label: 'Marcar como resolvido', className: 'btn-primary', closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Resolver incidente',
            message: 'Confirmar resolução deste incidente?',
            details: `Incident: ${incident.id}\nTipo: ${incident.type}\nSeveridade: ${incident.severity}`,
            confirmText: 'Resolver'
          });
          if (ok) { Notifications.success('Incidente resolvido (simulação).'); Modals.close(bd); }
        }
      }
    ]
  });
};
