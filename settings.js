/* ============================================================
   RD4X DASHBOARD V10 — Settings Page
   ============================================================ */
'use strict';

window.renderSettings = function(el) {
  const cfg = Api.getConfig();
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Configuração</h1>
        <p class="page-desc">Informações sobre o ambiente do dashboard</p>
      </div>
    </div>

    <div class="card mb-16">
      <div class="card-header"><div class="card-title">Ambiente</div></div>
      <div class="field-grid">
        <div class="field"><div class="field-label">URL da API</div><div class="field-value mono">${Utils.escapeHtml(cfg.apiBaseUrl)}</div></div>
        <div class="field"><div class="field-label">Status da API</div><div class="field-value"><span class="badge exp">MOCK</span></div></div>
        <div class="field"><div class="field-label">Modo</div><div class="field-value">${cfg.mockMode ? 'MOCK_MODE = true' : 'Produção'}</div></div>
        <div class="field"><div class="field-label">Ambiente</div><div class="field-value mono">${Utils.escapeHtml(cfg.environment)}</div></div>
        <div class="field"><div class="field-label">Versão Dashboard</div><div class="field-value mono">${Utils.escapeHtml(cfg.dashboardVersion)}</div></div>
        <div class="field"><div class="field-label">Versão API</div><div class="field-value mono">${Utils.escapeHtml(cfg.apiVersion)}</div></div>
        <div class="field"><div class="field-label">Intervalo de atualização</div><div class="field-value">${cfg.refreshInterval / 1000}s</div></div>
        <div class="field"><div class="field-label">Tema</div><div class="field-value">Dark (fixo)</div></div>
      </div>
    </div>

    <div class="card mb-16">
      <div class="card-header"><div class="card-title">Endpoints disponíveis (integração futura)</div></div>
      <div class="list">
        ${[
          ['GET', '/api/dashboard/overview'],
          ['GET', '/api/dashboard/users'],
          ['GET', '/api/dashboard/tickets'],
          ['GET', '/api/dashboard/audit'],
          ['POST', '/api/dashboard/release'],
          ['POST', '/api/dashboard/reset-hwid'],
          ['POST', '/api/dashboard/revoke'],
          ['POST', '/api/dashboard/blacklist'],
          ['POST', '/api/dashboard/unblacklist']
        ].map(([m, p]) => `
          <div class="list-item" style="cursor:default">
            <div class="list-item-icon ${m === 'POST' ? 'warn' : ''}">
              <svg class="icon"><use href="#i-external"/></svg>
            </div>
            <div style="flex:1">
              <div class="list-item-title" style="font-family:monospace;font-size:12.5px">${Utils.escapeHtml(p)}</div>
              <div class="list-item-sub">${m}</div>
            </div>
            <span class="badge nol">${m === 'GET' ? 'GET' : 'POST'}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="alert-banner" style="background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04));border-color:rgba(245,158,11,.35)">
      <svg class="icon" style="color:var(--warning)"><use href="#i-alert"/></svg>
      <div style="flex:1">
        <div class="alert-banner-title" style="color:#ffc46b">Aviso de segurança</div>
        <div class="alert-banner-desc" style="color:#e6c88f">
          Nunca insira chaves de API (DASHBOARD_API_KEY) ou credenciais diretamente no frontend.
          A integração real deve ser feita via proxy seguro (Cloudflare Worker) com autenticação no backend.
        </div>
      </div>
    </div>
  `;
};