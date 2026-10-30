/* ============================================================
   RD4X DASHBOARD V10 — Overview Page
   ============================================================ */
'use strict';

window.renderOverview = async function(el) {
  el.innerHTML = renderLoadingSkeleton();
  const data = await Api.getOverview();
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Visão Geral</h1>
        <p class="page-desc">Resumo do sistema RD4X · dados de demonstração</p>
      </div>
      <div class="flex gap-8 items-center">
        <button class="btn btn-ghost btn-sm" id="refresh-overview">
          <svg class="icon" style="width:14px;height:14px"><use href="#i-refresh"/></svg>
          Atualizar
        </button>
      </div>
    </div>

    ${data.releaseVolumeAlert && data.releaseVolumeAlert.triggered ? renderAlertBanner(data.releaseVolumeAlert) : ''}

    <div class="stats-grid">
      ${statCard('Usuários', data.users.total, 'Cadastrados', 'i-users', '')}
      ${statCard('Usuários ativos', data.users.active, 'Com licença ativa', 'i-check', 'success')}
      ${statCard('Tickets abertos', data.tickets.open + data.tickets.inProgress, 'Abertos + em atendimento', 'i-ticket', 'warn')}
      ${statCard('Tickets fechados', data.tickets.closed + data.tickets.resolved, 'Resolvidos + fechados', 'i-ticket', 'success')}
      ${statCard('Releases totais', data.releases.total, 'Histórico completo', 'i-release', '')}
      ${statCard('Releases (24h)', data.releases.last24h, 'Últimas 24 horas', 'i-release', 'info')}
      ${statCard('Incidentes', data.incidents.total, data.incidents.open + ' em aberto', 'i-incident', 'danger')}
      ${statCard('Blacklist', data.users.blacklisted, 'Usuários bloqueados', 'i-alert', 'danger')}
      ${statCard('HWIDs ativos', data.hwid.active, 'Dispositivos registrados', 'i-check', 'info')}
    </div>

    <div class="grid-main mb-20">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Atividade do sistema</div>
            <div class="card-subtitle">Últimos 7 dias</div>
          </div>
        </div>
        ${renderBarChart(data.systemActivity.map(d => ({ label: d.label, value: d.activity, tooltip: `${d.activity} eventos` })))}
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Status da API</div>
            <div class="card-subtitle">Integração futura</div>
          </div>
        </div>
        <div class="list">
          ${statusRow('Modo', 'MOCK / DEMO', 'warn')}
          ${statusRow('Ambiente', 'demo', 'info')}
          ${statusRow('Endpoint', 'api.rd4x.example.com', '')}
          ${statusRow('Versão Dashboard', '10.0.0', '')}
          ${statusRow('Versão API', '10.x', '')}
          ${statusRow('Última sincronização', Utils.formatDate(new Date().toISOString()), '')}
        </div>
      </div>
    </div>

    <div class="grid-2 mb-20">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Tickets por período</div>
        </div>
        ${renderBarChart(data.systemActivity.map(d => ({ label: d.label, value: d.tickets, color: 'warn', tooltip: `${d.tickets} tickets` })))}
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Releases por período</div>
        </div>
        ${renderBarChart(data.systemActivity.map(d => ({ label: d.label, value: d.releases, color: 'purple', tooltip: `${d.releases} releases` })))}
      </div>
    </div>

    <div class="grid-2 mb-20">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Atividade recente</div>
          <a href="#/audit" class="btn btn-ghost btn-sm">Ver tudo</a>
        </div>
        <div class="list" id="recent-activity"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Tickets recentes</div>
          <a href="#/tickets" class="btn btn-ghost btn-sm">Ver tudo</a>
        </div>
        <div class="list" id="recent-tickets"></div>
      </div>
    </div>

    <div class="grid-2 mb-20">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Releases recentes</div>
          <a href="#/releases" class="btn btn-ghost btn-sm">Ver tudo</a>
        </div>
        <div class="list" id="recent-releases"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Incidentes recentes</div>
          <a href="#/incidents" class="btn btn-ghost btn-sm">Ver tudo</a>
        </div>
        <div class="list" id="recent-incidents"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Administradores ativos</div>
      </div>
      <div class="list">
        ${data.admins.map(a => `
          <div class="list-item">
            <div class="list-item-icon ${a.status === 'online' ? 'success' : 'warn'}">
              <svg class="icon"><use href="#i-users"/></svg>
            </div>
            <div style="flex:1;min-width:0">
              <div class="list-item-title">${Utils.escapeHtml(a.name)}</div>
              <div class="list-item-sub">${Utils.escapeHtml(a.role)}</div>
            </div>
            <span class="badge ${a.status === 'online' ? 'atl' : 'exp'}">${a.status === 'online' ? 'Online' : 'Ausente'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Recent activity
  const activityEl = el.querySelector('#recent-activity');
  activityEl.innerHTML = data.recentActivity.map(a => `
    <div class="list-item">
      <div class="list-item-icon ${a.result === 'Falha' ? 'danger' : a.action.includes('Alerta') || a.action.includes('Tentativa') ? 'warn' : 'success'}">
        <svg class="icon"><use href="#i-audit"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="list-item-title">${Utils.escapeHtml(a.action)}</div>
        <div class="list-item-sub">${Utils.escapeHtml(a.admin)} · ${Utils.escapeHtml(a.target)}</div>
      </div>
      <div class="list-item-time">${Utils.relativeTime(a.createdAt)}</div>
    </div>
  `).join('') || '<div class="empty-state">Nenhuma atividade</div>';

  const ticketsEl = el.querySelector('#recent-tickets');
  ticketsEl.innerHTML = data.recentTickets.map(t => {
    const user = MockData.users.find(u => u.id === t.userId);
    return `
      <div class="list-item" data-ticket-id="${t.id}">
        <div class="list-item-icon ${t.priority === 'Urgente' ? 'danger' : t.priority === 'Alta' ? 'warn' : ''}">
          <svg class="icon"><use href="#i-ticket"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div class="list-item-title">${Utils.escapeHtml(t.id)} · ${Utils.escapeHtml(t.category)}</div>
          <div class="list-item-sub">${Utils.escapeHtml(user ? user.discord : '—')} · ${Utils.escapeHtml(t.priority)}</div>
        </div>
        ${Utils.statusBadge(t.status)}
      </div>
    `;
  }).join('');

  const releasesEl = el.querySelector('#recent-releases');
  releasesEl.innerHTML = data.recentReleases.map(r => {
    const user = MockData.users.find(u => u.id === r.userId);
    return `
      <div class="list-item" data-release-id="${r.id}">
        <div class="list-item-icon">
          <svg class="icon"><use href="#i-release"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div class="list-item-title">${Utils.escapeHtml(r.id)} · ${Utils.escapeHtml(user ? user.discord : '—')}</div>
          <div class="list-item-sub">${Utils.escapeHtml(r.admin)} · ${Utils.relativeTime(r.createdAt)}</div>
        </div>
        ${Utils.statusBadge(r.status)}
      </div>
    `;
  }).join('');

  const incidentsEl = el.querySelector('#recent-incidents');
  incidentsEl.innerHTML = data.recentIncidents.map(i => `
    <div class="list-item" data-incident-id="${i.id}">
      <div class="list-item-icon ${i.severity === 'Crítica' || i.severity === 'Alta' ? 'danger' : 'warn'}">
        <svg class="icon"><use href="#i-incident"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="list-item-title">${Utils.escapeHtml(i.type)}</div>
        <div class="list-item-sub">${Utils.escapeHtml(i.id)} · ${Utils.relativeTime(i.createdAt)}</div>
      </div>
      ${Utils.severityBadge(i.severity)}
    </div>
  `).join('');

  // Handlers
  el.querySelector('#refresh-overview').addEventListener('click', () => {
    Notifications.info('Recarregando dados...');
    renderOverview(el);
  });
  el.querySelectorAll('[data-ticket-id]').forEach(node => {
    node.addEventListener('click', () => {
      const t = MockData.tickets.find(x => x.id === node.dataset.ticketId);
      if (t && window.openTicketModal) window.openTicketModal(t);
    });
  });
  el.querySelectorAll('[data-release-id]').forEach(node => {
    node.addEventListener('click', () => {
      const r = MockData.releases.find(x => x.id === node.dataset.releaseId);
      if (r && window.openReleaseModal) window.openReleaseModal(r);
    });
  });
  el.querySelectorAll('[data-incident-id]').forEach(node => {
    node.addEventListener('click', () => {
      const i = MockData.incidents.find(x => x.id === node.dataset.incidentId);
      if (i && window.openIncidentModal) window.openIncidentModal(i);
    });
  });
};

function renderLoadingSkeleton() {
  return `
    <div class="page-header">
      <div>
        <div class="skeleton skeleton-line" style="width:180px;height:22px"></div>
        <div class="skeleton skeleton-line" style="width:240px;height:12px;margin-top:8px"></div>
      </div>
    </div>
    <div class="stats-grid">
      ${Array(9).fill('<div class="skeleton skeleton-card"></div>').join('')}
    </div>
    <div class="grid-2 mb-20">
      <div class="skeleton" style="height:260px;border-radius:12px"></div>
      <div class="skeleton" style="height:260px;border-radius:12px"></div>
    </div>
  `;
}

function statCard(label, value, hint, iconId, variant) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${variant || ''}">
        <svg class="icon"><use href="#${iconId}"/></svg>
      </div>
      <div class="stat-label">${Utils.escapeHtml(label)}</div>
      <div class="stat-value">${Utils.escapeHtml(String(value))}</div>
      <div class="stat-hint">${Utils.escapeHtml(hint)}</div>
    </div>
  `;
}

function statusRow(label, value, variant) {
  return `
    <div class="list-item" style="cursor:default">
      <div style="flex:1">
        <div class="list-item-sub" style="margin:0">${Utils.escapeHtml(label)}</div>
      </div>
      <div style="font-size:12.5px;color:var(--text);font-weight:500">${Utils.escapeHtml(value)}</div>
    </div>
  `;
}

function renderBarChart(data) {
  if (!data || !data.length) return '<div class="empty-state">Sem dados</div>';
  const max = Math.max(...data.map(d => d.value), 1);
  return `
    <div class="chart">
      ${data.map(d => {
        const pct = Math.max(4, Math.round((d.value / max) * 100));
        return `
          <div class="chart-bar ${d.color || ''}" style="height:${pct}%">
            <span class="chart-tooltip">${Utils.escapeHtml(d.tooltip || d.value)}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="chart-labels">
      ${data.map(d => `<span>${Utils.escapeHtml(d.label)}</span>`).join('')}
    </div>
  `;
}

function renderAlertBanner(alert) {
  return `
    <div class="alert-banner">
      <svg class="icon"><use href="#i-incident"/></svg>
      <div style="flex:1">
        <div class="alert-banner-title">ALERTA: Volume anormal de releases detectado.</div>
        <div class="alert-banner-desc">
          O sistema detectou <strong>${alert.count} releases</strong> em um período de
          <strong>${alert.periodMinutes} minutos</strong>. Severidade:
          <strong>${Utils.escapeHtml(alert.severity)}</strong>.
        </div>
        <div class="alert-banner-meta">
          <span>Detectado em: <strong>${Utils.formatDate(alert.detectedAt)}</strong></span>
          <span>Admins envolvidos: <strong>${alert.admins.map(Utils.escapeHtml).join(', ')}</strong></span>
          <span>Usuários afetados: <strong>${alert.usersAffected}</strong></span>
        </div>
        <div class="alert-banner-actions">
          <a class="btn btn-danger btn-sm" href="#/incidents">Ver incidente</a>
          <a class="btn btn-ghost btn-sm" href="#/releases">Ver releases</a>
        </div>
      </div>
    </div>
  `;
}
