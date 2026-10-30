/* ============================================================
   RD4X DASHBOARD V10 — Estatísticas
   ============================================================ */

'use strict';

window.renderStats = async function renderStats(content) {
  content.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Estatísticas</div>
        <div class="page-subtitle">
          Indicadores e desempenho do sistema RD4X
        </div>
      </div>

      <button
        class="btn btn-secondary"
        id="stats-refresh"
        type="button"
      >
        <svg class="icon">
          <use href="#i-refresh"></use>
        </svg>
        Atualizar
      </button>
    </div>

    <div id="stats-loading" class="empty-state">
      <div class="loading-spinner"></div>
      <div>Carregando estatísticas...</div>
    </div>

    <div id="stats-content" style="display:none"></div>
  `;

  const refreshButton =
    document.getElementById('stats-refresh');

  if (refreshButton) {
    refreshButton.addEventListener(
      'click',
      () => renderStats(content)
    );
  }

  try {
    const [
      overviewResponse,
      usersResponse,
      ticketsResponse,
      auditResponse,
      incidentsResponse
    ] = await Promise.all([
      Api.getOverview(),
      Api.getUsers(),
      Api.getTickets(),
      Api.getAudit(),
      Api.getIncidents()
    ]);

    const overview =
      overviewResponse?.data ||
      overviewResponse ||
      {};

    const users =
      Array.isArray(usersResponse?.data)
        ? usersResponse.data
        : Array.isArray(usersResponse)
          ? usersResponse
          : [];

    const tickets =
      Array.isArray(ticketsResponse?.data)
        ? ticketsResponse.data
        : Array.isArray(ticketsResponse)
          ? ticketsResponse
          : [];

    const audit =
      Array.isArray(auditResponse?.data)
        ? auditResponse.data
        : Array.isArray(auditResponse)
          ? auditResponse
          : [];

    const incidents =
      Array.isArray(incidentsResponse?.data)
        ? incidentsResponse.data
        : Array.isArray(incidentsResponse)
          ? incidentsResponse
          : [];

    const activeUsers = users.filter(user => {
      const expiration =
        user.expiraEm;

      if (
        expiration === 'perm' ||
        expiration === 'permanente'
      ) {
        return true;
      }

      if (!expiration) {
        return true;
      }

      const timestamp =
        Number(expiration);

      return (
        Number.isNaN(timestamp) ||
        timestamp > Date.now()
      );
    }).length;

    const openTickets =
      tickets.filter(ticket => {
        const status =
          String(
            ticket.status ||
            ticket.estado ||
            ''
          ).toLowerCase();

        return ![
          'closed',
          'fechado',
          'finalizado',
          'resolvido'
        ].includes(status);
      }).length;

    const openIncidents =
      incidents.filter(incident => {
        const status =
          String(
            incident.status ||
            ''
          ).toLowerCase();

        return ![
          'closed',
          'fechado',
          'resolved',
          'resolvido'
        ].includes(status);
      }).length;

    const releases =
      audit.filter(event => {
        const action =
          String(
            event.action ||
            ''
          ).toLowerCase();

        return [
          'release',
          'liberar',
          'liberacao',
          'liberação'
        ].includes(action);
      });

    let revenue = 0;

    releases.forEach(event => {
      const details =
        event.details || {};

      const value =
        Number(
          details.valor ??
          details.value ??
          event.valor ??
          0
        );

      if (!Number.isNaN(value)) {
        revenue += value;
      }
    });

    const executions =
      Number(
        overview.execucoes ||
        overview.executions ||
        0
      );

    const totalRevenue =
      Number(
        overview.faturamento ??
        overview.revenue ??
        revenue
      ) || revenue;

    const cards = [
      {
        label: 'Usuários ativos',
        value: activeUsers,
        icon: 'i-users'
      },
      {
        label: 'Tickets abertos',
        value: openTickets,
        icon: 'i-ticket'
      },
      {
        label: 'Incidentes abertos',
        value: openIncidents,
        icon: 'i-alert'
      },
      {
        label: 'Execuções',
        value: executions,
        icon: 'i-activity'
      },
      {
        label: 'Faturamento',
        value: formatMoney(totalRevenue),
        icon: 'i-dollar'
      },
      {
        label: 'Releases',
        value: releases.length,
        icon: 'i-download'
      }
    ];

    const statusMap = {};

    tickets.forEach(ticket => {
      const status =
        String(
          ticket.status ||
          ticket.estado ||
          'Sem status'
        );

      statusMap[status] =
        (statusMap[status] || 0) + 1;
    });

    const severityMap = {};

    incidents.forEach(incident => {
      const severity =
        String(
          incident.severity ||
          incident.nivel ||
          'normal'
        );

      severityMap[severity] =
        (severityMap[severity] || 0) + 1;
    });

    const actionMap = {};

    audit.forEach(event => {
      const action =
        String(
          event.action ||
          'unknown'
        );

      actionMap[action] =
        (actionMap[action] || 0) + 1;
    });

    const statsContent =
      document.getElementById('stats-content');

    const loading =
      document.getElementById('stats-loading');

    if (!statsContent) return;

    statsContent.innerHTML = `
      <div class="stats-grid">
        ${cards.map(card => `
          <div class="stat-card">
            <div class="stat-card-icon">
              <svg class="icon">
                <use href="#${card.icon}"></use>
              </svg>
            </div>

            <div class="stat-card-body">
              <div class="stat-card-label">
                ${Utils.escapeHtml(card.label)}
              </div>

              <div class="stat-card-value">
                ${Utils.escapeHtml(String(card.value))}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="stats-panels">

        <section class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Tickets por status
              </div>

              <div class="panel-subtitle">
                Distribuição atual dos tickets
              </div>
            </div>
          </div>

          <div class="stats-list">
            ${renderMap(statusMap)}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Incidentes por severidade
              </div>

              <div class="panel-subtitle">
                Distribuição dos incidentes registrados
              </div>
            </div>
          </div>

          <div class="stats-list">
            ${renderMap(severityMap)}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Atividade da auditoria
              </div>

              <div class="panel-subtitle">
                Ações registradas pelo sistema
              </div>
            </div>
          </div>

          <div class="stats-list">
            ${renderMap(actionMap)}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">
                Resumo do sistema
              </div>

              <div class="panel-subtitle">
                Dados recebidos da API RD4X
              </div>
            </div>
          </div>

          <div class="stats-summary">
            <div>
              <span>Usuários cadastrados</span>
              <strong>${users.length}</strong>
            </div>

            <div>
              <span>Tickets registrados</span>
              <strong>${tickets.length}</strong>
            </div>

            <div>
              <span>Incidentes registrados</span>
              <strong>${incidents.length}</strong>
            </div>

            <div>
              <span>Eventos de auditoria</span>
              <strong>${audit.length}</strong>
            </div>

            <div>
              <span>Faturamento calculado</span>
              <strong>${formatMoney(totalRevenue)}</strong>
            </div>
          </div>
        </section>

      </div>
    `;

    if (loading) {
      loading.style.display = 'none';
    }

    statsContent.style.display = 'block';

  } catch (error) {
    console.error(
      '[STATS]',
      error
    );

    const loading =
      document.getElementById('stats-loading');

    if (loading) {
      loading.innerHTML = `
        <svg class="icon">
          <use href="#i-alert"></use>
        </svg>

        <div
          style="
            font-size:15px;
            font-weight:600;
            color:var(--danger);
            margin-bottom:4px
          "
        >
          Erro ao carregar estatísticas
        </div>

        <div>
          ${Utils.escapeHtml(
            error.message ||
            'Erro desconhecido'
          )}
        </div>
      `;
    }

    if (window.Notifications) {
      Notifications.error(
        'Não foi possível carregar as estatísticas.'
      );
    }
  }
};


function formatMoney(value) {
  const number =
    Number(value) || 0;

  return number.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  );
}


function renderMap(map) {
  const entries =
    Object.entries(map);

  if (!entries.length) {
    return `
      <div class="empty-state">
        Nenhum dado disponível.
      </div>
    `;
  }

  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => `
      <div class="stats-row">
        <span>
          ${Utils.escapeHtml(label)}
        </span>

        <strong>
          ${Utils.escapeHtml(String(value))}
        </strong>
      </div>
    `)
    .join('');
                   }
