/* ============================================================
   RD4X DASHBOARD V10 — OVERVIEW REAL
   ============================================================ */
'use strict';

window.renderOverview = async function (
  content,
  params = {}
) {
  content.innerHTML = `
    <div class="page overview-page">

      <div class="page-header">
        <div>
          <div class="page-title">
            Visão geral
          </div>

          <div class="page-subtitle">
            Monitoramento do sistema RD4X em tempo real.
          </div>
        </div>

        <button
          class="btn btn-secondary"
          id="overview-refresh"
        >
          <svg class="icon">
            <use href="#i-refresh"></use>
          </svg>
          Atualizar
        </button>
      </div>

      <div
        class="overview-cards"
        id="overview-cards"
      >
        ${[1,2,3,4,5,6].map(() => `
          <div class="overview-card skeleton-card">
            <div class="skeleton skeleton-small"></div>
            <div class="skeleton skeleton-large"></div>
          </div>
        `).join('')}
      </div>

      <div class="overview-grid">

        <section class="panel">

          <div class="panel-header">
            <div>
              <div class="panel-title">
                Tickets recentes
              </div>

              <div class="panel-subtitle">
                Últimos tickets registrados pelo bot.
              </div>
            </div>

            <button
              class="btn btn-secondary btn-small"
              id="overview-tickets"
            >
              Ver todos
            </button>
          </div>

          <div id="overview-recent-tickets">
            <div class="loading-state">
              Carregando...
            </div>
          </div>

        </section>

        <section class="panel">

          <div class="panel-header">
            <div>
              <div class="panel-title">
                Administradores ativos
              </div>

              <div class="panel-subtitle">
                Administradores encontrados no Discord.
              </div>
            </div>
          </div>

          <div id="overview-admins">
            <div class="loading-state">
              Carregando...
            </div>
          </div>

        </section>

      </div>

      <div class="overview-grid overview-grid-bottom">

        <section class="panel">

          <div class="panel-header">
            <div>
              <div class="panel-title">
                Atividade recente
              </div>

              <div class="panel-subtitle">
                Últimas ações registradas na auditoria.
              </div>
            </div>

            <button
              class="btn btn-secondary btn-small"
              id="overview-audit"
            >
              Auditoria
            </button>
          </div>

          <div id="overview-audit-list">
            <div class="loading-state">
              Carregando...
            </div>
          </div>

        </section>

        <section class="panel">

          <div class="panel-header">
            <div>
              <div class="panel-title">
                Status do sistema
              </div>

              <div class="panel-subtitle">
                Conectividade da infraestrutura RD4X.
              </div>
            </div>
          </div>

          <div class="system-status">

            <div class="system-status-item">
              <div class="system-status-icon success">
                <svg class="icon">
                  <use href="#i-check"></use>
                </svg>
              </div>

              <div>
                <div class="system-status-title">
                  API RD4X
                </div>

                <div class="system-status-subtitle">
                  Conectada
                </div>
              </div>

              <span class="status-dot online"></span>
            </div>

            <div class="system-status-item">
              <div class="system-status-icon success">
                <svg class="icon">
                  <use href="#i-check"></use>
                </svg>
              </div>

              <div>
                <div class="system-status-title">
                  Discord
                </div>

                <div class="system-status-subtitle">
                  Bot operacional
                </div>
              </div>

              <span class="status-dot online"></span>
            </div>

            <div class="system-status-item">
              <div class="system-status-icon success">
                <svg class="icon">
                  <use href="#i-check"></use>
                </svg>
              </div>

              <div>
                <div class="system-status-title">
                  Dashboard
                </div>

                <div class="system-status-subtitle">
                  Worker online
                </div>
              </div>

              <span class="status-dot online"></span>
            </div>

          </div>

        </section>

      </div>

    </div>

    <style>
      .overview-page {
        padding-bottom:40px;
      }

      .overview-page .page-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        margin-bottom:22px;
      }

      .overview-page .page-title {
        font-size:24px;
        font-weight:700;
        color:var(--text-primary);
      }

      .overview-page .page-subtitle {
        margin-top:5px;
        font-size:13px;
        color:var(--text-secondary);
      }

      .overview-cards {
        display:grid;
        grid-template-columns:
          repeat(6, minmax(0, 1fr));
        gap:12px;
        margin-bottom:18px;
      }

      .overview-card {
        min-height:110px;
        padding:17px;
        border:1px solid var(--border);
        border-radius:14px;
        background:var(--card);
      }

      .overview-card-label {
        font-size:12px;
        color:var(--text-secondary);
        margin-bottom:10px;
      }

      .overview-card-value {
        font-size:25px;
        font-weight:700;
        color:var(--text-primary);
      }

      .overview-card-description {
        margin-top:5px;
        font-size:11px;
        color:var(--text-secondary);
      }

      .overview-grid {
        display:grid;
        grid-template-columns:
          minmax(0, 1.45fr)
          minmax(320px, .85fr);
        gap:16px;
        margin-bottom:16px;
      }

      .overview-grid-bottom {
        grid-template-columns:
          minmax(0, 1.45fr)
          minmax(320px, .85fr);
      }

      .overview-page .panel {
        overflow:hidden;
      }

      .overview-page .panel-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:17px 18px;
        border-bottom:1px solid var(--border);
      }

      .overview-page .panel-title {
        font-size:14px;
        font-weight:700;
        color:var(--text-primary);
      }

      .overview-page .panel-subtitle {
        margin-top:4px;
        font-size:11px;
        color:var(--text-secondary);
      }

      .btn-small {
        height:34px;
        padding:0 11px;
        font-size:12px;
      }

      .recent-list {
        display:flex;
        flex-direction:column;
      }

      .recent-ticket {
        display:grid;
        grid-template-columns:
          minmax(120px, 1fr)
          100px
          95px;
        gap:12px;
        align-items:center;
        padding:14px 18px;
        border-bottom:1px solid var(--border);
        cursor:pointer;
        transition:.15s ease;
      }

      .recent-ticket:last-child {
        border-bottom:0;
      }

      .recent-ticket:hover {
        background:rgba(255,255,255,.025);
      }

      .recent-ticket-name {
        font-size:13px;
        font-weight:600;
        color:var(--text-primary);
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .recent-ticket-user {
        margin-top:4px;
        font-size:11px;
        color:var(--text-secondary);
      }

      .recent-ticket-status {
        font-size:11px;
        font-weight:600;
      }

      .recent-ticket-priority {
        text-align:right;
        font-size:11px;
        color:var(--text-secondary);
      }

      .overview-empty {
        padding:35px 18px;
        text-align:center;
        color:var(--text-secondary);
        font-size:12px;
      }

      .admin-list {
        display:flex;
        flex-direction:column;
      }

      .admin-item {
        display:flex;
        align-items:center;
        gap:12px;
        padding:14px 18px;
        border-bottom:1px solid var(--border);
      }

      .admin-item:last-child {
        border-bottom:0;
      }

      .admin-avatar {
        width:38px;
        height:38px;
        flex:0 0 38px;
        border-radius:50%;
        object-fit:cover;
        background:var(--background);
        border:1px solid var(--border);
      }

      .admin-avatar-fallback {
        width:38px;
        height:38px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:var(--background);
        border:1px solid var(--border);
        font-weight:700;
        color:var(--text-secondary);
      }

      .admin-name {
        font-size:13px;
        font-weight:600;
        color:var(--text-primary);
      }

      .admin-role {
        margin-top:3px;
        font-size:11px;
        color:var(--text-secondary);
      }

      .admin-status {
        margin-left:auto;
        display:flex;
        align-items:center;
        gap:6px;
        font-size:10px;
        color:var(--text-secondary);
      }

      .status-dot {
        width:7px;
        height:7px;
        border-radius:50%;
        background:var(--text-secondary);
      }

      .status-dot.online {
        background:var(--success);
      }

      .audit-list {
        display:flex;
        flex-direction:column;
      }

      .audit-item {
        display:grid;
        grid-template-columns:
          120px
          minmax(100px, .7fr)
          minmax(90px, .6fr)
          minmax(90px, .8fr);
        gap:12px;
        align-items:center;
        padding:13px 18px;
        border-bottom:1px solid var(--border);
      }

      .audit-item:last-child {
        border-bottom:0;
      }

      .audit-item-time {
        font-size:10px;
        color:var(--text-secondary);
        white-space:nowrap;
      }

      .audit-item-actor {
        font-size:12px;
        font-weight:600;
        color:var(--text-primary);
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .audit-item-action {
        display:inline-flex;
        width:max-content;
        max-width:100%;
        padding:4px 7px;
        border-radius:6px;
        border:1px solid var(--border);
        background:rgba(255,255,255,.04);
        color:var(--text-primary);
        font-size:10px;
        font-weight:600;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .audit-item-target {
        font-size:11px;
        color:var(--text-secondary);
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .system-status {
        display:flex;
        flex-direction:column;
      }

      .system-status-item {
        display:flex;
        align-items:center;
        gap:12px;
        padding:16px 18px;
        border-bottom:1px solid var(--border);
      }

      .system-status-item:last-child {
        border-bottom:0;
      }

      .system-status-icon {
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:9px;
        background:rgba(255,255,255,.04);
      }

      .system-status-icon.success {
        color:var(--success);
      }

      .system-status-title {
        font-size:12px;
        font-weight:600;
        color:var(--text-primary);
      }

      .system-status-subtitle {
        margin-top:3px;
        font-size:10px;
        color:var(--text-secondary);
      }

      .system-status-item .status-dot {
        margin-left:auto;
      }

      .skeleton {
        border-radius:6px;
        background:rgba(255,255,255,.07);
        animation:pulse 1.3s infinite;
      }

      .skeleton-small {
        width:55%;
        height:11px;
        margin-bottom:13px;
      }

      .skeleton-large {
        width:40%;
        height:26px;
      }

      @keyframes pulse {
        0%,100% {
          opacity:.45;
        }

        50% {
          opacity:.9;
        }
      }

      @media (max-width:1200px) {
        .overview-cards {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width:900px) {
        .overview-grid,
        .overview-grid-bottom {
          grid-template-columns:1fr;
        }
      }

      @media (max-width:600px) {
        .overview-page .page-header {
          align-items:flex-start;
        }

        .overview-cards {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .recent-ticket {
          grid-template-columns:1fr auto;
        }

        .recent-ticket-priority {
          text-align:left;
        }

        .audit-item {
          grid-template-columns:1fr 1fr;
        }
      }
    </style>
  `;

  const escape =
    value =>
      Utils.escapeHtml(
        value === null ||
        value === undefined
          ? ''
          : String(value)
      );

  function formatNumber(value) {
    return Number(
      value || 0
    ).toLocaleString('pt-BR');
  }

  function formatDate(value) {
    if (!value) return '—';

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString(
      'pt-BR',
      {
        dateStyle:'short',
        timeStyle:'short'
      }
    );
  }

  function normalizeTickets(response) {
    const data =
      Array.isArray(response)
        ? response
        : response?.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(ticket => ({
      channelId:
        ticket.channelId ||
        ticket.id ||
        '',

      username:
        ticket.username ||
        ticket.nick ||
        'Usuário',

      status:
        ticket.status ||
        'open',

      prioridade:
        ticket.prioridade ||
        'normal',

      ultimoContato:
        ticket.ultimoContato ||
        null
    }));
  }

  function normalizeAdmins(response) {
    const data =
      Array.isArray(response)
        ? response
        : response?.data;

    return Array.isArray(data)
      ? data
      : [];
  }

  function normalizeAudit(response) {
    const data =
      Array.isArray(response)
        ? response
        : response?.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map(event => ({
        id:
          event?.id ||
          '',

        at:
          event?.at ||
          event?.createdAt ||
          null,

        actor:
          event?.actor ||
          'Sistema',

        action:
          event?.action ||
          'unknown',

        target:
          event?.target ||
          ''
      }))
      .sort((a, b) => {
        const ta =
          a.at
            ? new Date(a.at).getTime()
            : 0;

        const tb =
          b.at
            ? new Date(b.at).getTime()
            : 0;

        return tb - ta;
      });
  }

  function renderCards(data) {
    const cards = [
      {
        label:'Usuários ativos',
        value:data.ativos,
        description:'Licenças ativas'
      },

      {
        label:'Tickets abertos',
        value:data.ticketsAbertos,
        description:'Atendimentos em andamento'
      },

      {
        label:'Execuções',
        value:data.execucoes,
        description:'Execuções registradas'
      },

      {
        label:'Vendas',
        value:data.vendas,
        description:'Vendas registradas'
      },

      {
        label:'Faturamento',
        value:
          `R$ ${Number(
            data.faturamento || 0
          ).toLocaleString(
            'pt-BR',
            {
              minimumFractionDigits:2,
              maximumFractionDigits:2
            }
          )}`,
        description:'Faturamento acumulado'
      },

      {
        label:'Incidentes',
        value:data.incidentesAbertos,
        description:'Incidentes abertos'
      }
    ];

    document.getElementById(
      'overview-cards'
    ).innerHTML =
      cards.map(card => `
        <div class="overview-card">

          <div class="overview-card-label">
            ${escape(card.label)}
          </div>

          <div class="overview-card-value">
            ${escape(
              typeof card.value === 'number'
                ? formatNumber(card.value)
                : card.value
            )}
          </div>

          <div class="overview-card-description">
            ${escape(card.description)}
          </div>

        </div>
      `).join('');
  }

  function renderTickets(tickets) {
    const container =
      document.getElementById(
        'overview-recent-tickets'
      );

    const recent =
      [...tickets]
        .sort((a, b) => {
          const ta =
            Number(a.ultimoContato || 0);

          const tb =
            Number(b.ultimoContato || 0);

          return tb - ta;
        })
        .slice(0, 6);

    if (!recent.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhum ticket encontrado.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="recent-list">

        ${recent.map(ticket => `
          <div
            class="recent-ticket"
            data-ticket="${escape(
              ticket.channelId
            )}"
          >

            <div>
              <div class="recent-ticket-name">
                #${escape(
                  ticket.channelId ||
                  'ticket'
                )}
              </div>

              <div class="recent-ticket-user">
                ${escape(ticket.username)}
              </div>
            </div>

            <div class="recent-ticket-status">
              ${escape(ticket.status)}
            </div>

            <div class="recent-ticket-priority">
              ${escape(ticket.prioridade)}
            </div>

          </div>
        `).join('')}

      </div>
    `;

    container
      .querySelectorAll('.recent-ticket')
      .forEach(element => {
        element.addEventListener(
          'click',
          () => {
            const id =
              element.dataset.ticket;

            window.location.hash =
              `#/tickets?q=${encodeURIComponent(id)}`;
          }
        );
      });
  }

  function renderAdmins(admins) {
    const container =
      document.getElementById(
        'overview-admins'
      );

    if (!admins.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhum administrador encontrado.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="admin-list">

        ${admins.slice(0, 8).map(admin => {

          const avatar =
            admin.avatar ||
            admin.displayAvatarURL ||
            '';

          const name =
            admin.name ||
            admin.username ||
            admin.tag ||
            'Administrador';

          const role =
            admin.role ||
            'Administrador';

          const online =
            admin.status === 'online';

          return `
            <div class="admin-item">

              ${
                avatar
                  ? `
                    <img
                      class="admin-avatar"
                      src="${escape(avatar)}"
                      alt=""
                    >
                  `
                  : `
                    <div class="admin-avatar-fallback">
                      ${escape(
                        name
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>
                  `
              }

              <div>
                <div class="admin-name">
                  ${escape(name)}
                </div>

                <div class="admin-role">
                  ${escape(role)}
                </div>
              </div>

              <div class="admin-status">

                <span
                  class="status-dot ${
                    online
                      ? 'online'
                      : ''
                  }"
                ></span>

                ${
                  online
                    ? 'Online'
                    : 'Offline'
                }

              </div>

            </div>
          `;
        }).join('')}

      </div>
    `;
  }

  function renderAudit(audit) {
    const container =
      document.getElementById(
        'overview-audit-list'
      );

    const recent =
      audit.slice(0, 7);

    if (!recent.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhuma atividade registrada.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="audit-list">

        ${recent.map(event => `
          <div class="audit-item">

            <div class="audit-item-time">
              ${escape(
                formatDate(event.at)
              )}
            </div>

            <div class="audit-item-actor">
              ${escape(event.actor)}
            </div>

            <div>
              <span class="audit-item-action">
                ${escape(event.action)}
              </span>
            </div>

            <div class="audit-item-target">
              ${escape(
                event.target || '—'
              )}
            </div>

          </div>
        `).join('')}

      </div>
    `;
  }

  async function load() {
    const cards =
      document.getElementById(
        'overview-cards'
      );

    cards.innerHTML =
      [1,2,3,4,5,6].map(() => `
        <div class="overview-card skeleton-card">
          <div class="skeleton skeleton-small"></div>
          <div class="skeleton skeleton-large"></div>
        </div>
      `).join('');

    try {
      const [
        overviewResponse,
        ticketsResponse,
        adminsResponse,
        auditResponse
      ] = await Promise.all([
        Api.getOverview(),
        Api.getTickets(),
        Api.getAdmins(),
        Api.getAudit()
      ]);

      const overview =
        overviewResponse?.data ||
        overviewResponse ||
        {};

      const tickets =
        normalizeTickets(
          ticketsResponse
        );

      const admins =
        normalizeAdmins(
          adminsResponse
        );

      const audit =
        normalizeAudit(
          auditResponse
        );

      renderCards({
        ativos:
          overview.ativos || 0,

        ticketsAbertos:
          overview.ticketsAbertos || 0,

        execucoes:
          overview.execucoes || 0,

        vendas:
          overview.vendas || 0,

        faturamento:
          overview.faturamento || 0,

        incidentesAbertos:
          overview.incidentesAbertos || 0
      });

      renderTickets(tickets);
      renderAdmins(admins);
      renderAudit(audit);

    } catch (error) {
      console.error(
        '[OVERVIEW]',
        error
      );

      Notifications.error(
        'Erro ao atualizar a visão geral.'
      );

      document.getElementById(
        'overview-cards'
      ).innerHTML = `
        <div
          class="overview-card"
          style="grid-column:1/-1"
        >
          <div
            style="
              color:var(--danger);
              font-weight:600
            "
          >
            Não foi possível carregar os dados.
          </div>

          <div
            style="
              margin-top:6px;
              color:var(--text-secondary);
              font-size:12px
            "
          >
            ${escape(
              error?.message ||
              'Erro desconhecido'
            )}
          </div>
        </div>
      `;
    }
  }

  document
    .getElementById('overview-refresh')
    .addEventListener(
      'click',
      load
    );

  document
    .getElementById('overview-tickets')
    .addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/tickets';
      }
    );

  document
    .getElementById('overview-audit')
    .addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/audit';
      }
    );

  await load();
};
