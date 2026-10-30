/* ============================================================
   RD4X DASHBOARD V10 — OVERVIEW
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
          <div class="overview-card">
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

      <div class="overview-grid">

        <section class="panel">

          <div class="panel-header">

            <div>
              <div class="panel-title">
                Releases recentes
              </div>

              <div class="panel-subtitle">
                Últimas licenças registradas.
              </div>
            </div>

            <button
              class="btn btn-secondary btn-small"
              id="overview-releases"
            >
              Ver todas
            </button>

          </div>

          <div id="overview-releases-list">
            <div class="loading-state">
              Carregando...
            </div>
          </div>

        </section>

        <section class="panel">

          <div class="panel-header">

            <div>
              <div class="panel-title">
                Atividade recente
              </div>

              <div class="panel-subtitle">
                Últimas ações administrativas.
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

      </div>

      <section class="panel">

        <div class="panel-header">

          <div>
            <div class="panel-title">
              Status do sistema
            </div>

            <div class="panel-subtitle">
              Estado dos principais serviços RD4X.
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
          minmax(0,1.45fr)
          minmax(320px,.85fr);
        gap:16px;
        margin-bottom:16px;
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

      .recent-list,
      .admin-list,
      .release-list,
      .audit-list {
        display:flex;
        flex-direction:column;
      }

      .recent-ticket {
        display:grid;
        grid-template-columns:
          minmax(120px,1fr)
          100px
          95px;
        gap:12px;
        align-items:center;
        padding:14px 18px;
        border-bottom:1px solid var(--border);
        cursor:pointer;
      }

      .recent-ticket:last-child,
      .admin-item:last-child,
      .release-item:last-child,
      .audit-item:last-child {
        border-bottom:0;
      }

      .recent-ticket:hover {
        background:rgba(255,255,255,.025);
      }

      .recent-ticket-name {
        font-size:13px;
        font-weight:600;
        color:var(--text-primary);
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

      .admin-item {
        display:flex;
        align-items:center;
        gap:12px;
        padding:14px 18px;
        border-bottom:1px solid var(--border);
      }

      .admin-avatar {
        width:38px;
        height:38px;
        flex:0 0 38px;
        border-radius:50%;
        object-fit:cover;
        border:1px solid var(--border);
        background:var(--background);
      }

      .admin-avatar-fallback {
        width:38px;
        height:38px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        border:1px solid var(--border);
        background:var(--background);
        color:var(--text-secondary);
        font-weight:700;
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

      .release-item {
        display:grid;
        grid-template-columns:
          minmax(100px,1fr)
          100px
          110px;
        gap:12px;
        align-items:center;
        padding:14px 18px;
        border-bottom:1px solid var(--border);
      }

      .release-user {
        font-size:13px;
        font-weight:600;
        color:var(--text-primary);
      }

      .release-discord {
        margin-top:3px;
        font-size:10px;
        color:var(--text-secondary);
      }

      .release-expiration {
        font-size:11px;
        color:var(--text-secondary);
      }

      .release-value {
        text-align:right;
        font-size:11px;
        font-weight:600;
        color:var(--text-primary);
      }

      .release-badge {
        display:inline-flex;
        padding:4px 7px;
        border-radius:6px;
        border:1px solid var(--border);
        font-size:10px;
      }

      .audit-item {
        display:grid;
        grid-template-columns:
          105px
          minmax(90px,.8fr)
          minmax(80px,.6fr)
          minmax(80px,1fr);
        gap:10px;
        align-items:center;
        padding:13px 18px;
        border-bottom:1px solid var(--border);
      }

      .audit-item-time {
        font-size:10px;
        color:var(--text-secondary);
      }

      .audit-item-actor {
        font-size:11px;
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
        font-size:10px;
        color:var(--text-primary);
      }

      .audit-item-target {
        font-size:10px;
        color:var(--text-secondary);
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .overview-empty {
        padding:35px 18px;
        text-align:center;
        color:var(--text-secondary);
        font-size:12px;
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

      .status-dot {
        width:7px;
        height:7px;
        border-radius:50%;
        background:var(--text-secondary);
      }

      .status-dot.online {
        background:var(--success);
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
            repeat(3,minmax(0,1fr));
        }
      }

      @media (max-width:900px) {
        .overview-grid {
          grid-template-columns:1fr;
        }
      }

      @media (max-width:600px) {
        .overview-page .page-header {
          align-items:flex-start;
        }

        .overview-cards {
          grid-template-columns:
            repeat(2,minmax(0,1fr));
        }

        .recent-ticket,
        .release-item {
          grid-template-columns:1fr auto;
        }

        .recent-ticket-priority,
        .release-value {
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

  function formatCurrency(value) {
    return Number(
      value || 0
    ).toLocaleString(
      'pt-BR',
      {
        style:'currency',
        currency:'BRL'
      }
    );
  }

  function formatDate(value) {
    if (!value) return '—';

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  function normalizeArray(response) {
    const data =
      Array.isArray(response)
        ? response
        : response?.data;

    return Array.isArray(data)
      ? data
      : [];
  }

  function getReleaseStatus(item) {
    if (
      item.expiraEm === 'perm' ||
      item.expiraEm === 'permanente'
    ) {
      return 'Permanente';
    }

    return 'Ativa';
  }

  function renderCards(data) {
    const cards = [
      [
        'Usuários ativos',
        data.ativos || 0,
        'Licenças ativas'
      ],

      [
        'Tickets abertos',
        data.ticketsAbertos || 0,
        'Atendimentos'
      ],

      [
        'Execuções',
        data.execucoes || 0,
        'Execuções registradas'
      ],

      [
        'Vendas',
        data.vendas || 0,
        'Vendas registradas'
      ],

      [
        'Faturamento',
        formatCurrency(
          data.faturamento || 0
        ),
        'Faturamento acumulado'
      ],

      [
        'Incidentes',
        data.incidentesAbertos || 0,
        'Incidentes abertos'
      ]
    ];

    document.getElementById(
      'overview-cards'
    ).innerHTML =
      cards.map(card => `
        <div class="overview-card">

          <div class="overview-card-label">
            ${escape(card[0])}
          </div>

          <div class="overview-card-value">
            ${
              typeof card[1] === 'number'
                ? formatNumber(card[1])
                : escape(card[1])
            }
          </div>

          <div class="overview-card-description">
            ${escape(card[2])}
          </div>

        </div>
      `).join('');
  }

  function renderTickets(response) {
    const tickets =
      normalizeArray(response);

    const container =
      document.getElementById(
        'overview-recent-tickets'
      );

    const recent =
      tickets
        .sort(
          (a,b) =>
            Number(
              b.ultimoContato || 0
            ) -
            Number(
              a.ultimoContato || 0
            )
        )
        .slice(0,6);

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
              ticket.channelId || ''
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
                ${escape(
                  ticket.username ||
                  'Usuário'
                )}
              </div>
            </div>

            <div class="recent-ticket-status">
              ${escape(
                ticket.status ||
                'unknown'
              )}
            </div>

            <div class="recent-ticket-priority">
              ${escape(
                ticket.prioridade ||
                'normal'
              )}
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
            window.location.hash =
              `#/tickets?q=${encodeURIComponent(
                element.dataset.ticket
              )}`;
          }
        );
      });
  }

  function renderAdmins(response) {
    const admins =
      normalizeArray(response);

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

        ${admins.slice(0,8).map(admin => {

          const name =
            admin.name ||
            admin.username ||
            admin.tag ||
            'Administrador';

          const avatar =
            admin.avatar ||
            '';

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
                  ${escape(
                    admin.role ||
                    'Administrador'
                  )}
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

                ${online ? 'Online' : 'Offline'}

              </div>

            </div>
          `;
        }).join('')}

      </div>
    `;
  }

  function renderReleases(response) {
    const releases =
      normalizeArray(response);

    const container =
      document.getElementById(
        'overview-releases-list'
      );

    const recent =
      releases
        .slice()
        .sort((a,b) => {
          const ta =
            a.dataVenda
              ? new Date(
                  a.dataVenda
                ).getTime()
              : 0;

          const tb =
            b.dataVenda
              ? new Date(
                  b.dataVenda
                ).getTime()
              : 0;

          return tb - ta;
        })
        .slice(0,6);

    if (!recent.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhuma release encontrada.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="release-list">

        ${recent.map(item => `
          <div class="release-item">

            <div>
              <div class="release-user">
                ${escape(
                  item.nick ||
                  item.username ||
                  'Usuário'
                )}
              </div>

              <div class="release-discord">
                ${escape(
                  item.discordId ||
                  'Discord ID não informado'
                )}
              </div>
            </div>

            <div>
              <span class="release-badge">
                ${escape(
                  getReleaseStatus(item)
                )}
              </span>

              <div class="release-expiration">
                ${escape(
                  item.expiraEm === 'perm'
                    ? 'Sem expiração'
                    : formatDate(
                        item.expiraEm
                      )
                )}
              </div>
            </div>

            <div class="release-value">
              ${escape(
                formatCurrency(
                  item.valorPago || 0
                )
              )}
            </div>

          </div>
        `).join('')}

      </div>
    `;
  }

  function renderAudit(response) {
    const audit =
      normalizeArray(response)
        .slice()
        .sort((a,b) => {
          const ta =
            a.at
              ? new Date(a.at).getTime()
              : 0;

          const tb =
            b.at
              ? new Date(b.at).getTime()
              : 0;

          return tb - ta;
        })
        .slice(0,7);

    const container =
      document.getElementById(
        'overview-audit-list'
      );

    if (!audit.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhuma atividade registrada.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="audit-list">

        ${audit.map(event => `
          <div class="audit-item">

            <div class="audit-item-time">
              ${escape(
                formatDate(event.at)
              )}
            </div>

            <div class="audit-item-actor">
              ${escape(
                event.actor ||
                'Sistema'
              )}
            </div>

            <div>
              <span class="audit-item-action">
                ${escape(
                  event.action ||
                  'unknown'
                )}
              </span>
            </div>

            <div class="audit-item-target">
              ${escape(
                event.target ||
                '—'
              )}
            </div>

          </div>
        `).join('')}

      </div>
    `;
  }

  async function load() {
    try {
      const [
        overview,
        tickets,
        admins,
        audit,
        releases
      ] = await Promise.all([
        Api.getOverview(),
        Api.getTickets(),
        Api.getAdmins(),
        Api.getAudit(),
        Api.getReleases()
      ]);

      const overviewData =
        overview?.data ||
        overview ||
        {};

      renderCards(
        overviewData
      );

      renderTickets(
        tickets
      );

      renderAdmins(
        admins
      );

      renderAudit(
        audit
      );

      renderReleases(
        releases
      );

    } catch (error) {
      console.error(
        '[OVERVIEW]',
        error
      );

      Notifications.error(
        'Erro ao atualizar a visão geral.'
      );
    }
  }

  document
    .getElementById(
      'overview-refresh'
    )
    .addEventListener(
      'click',
      load
    );

  document
    .getElementById(
      'overview-tickets'
    )
    .addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/tickets';
      }
    );

  document
    .getElementById(
      'overview-releases'
    )
    .addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/releases';
      }
    );

  document
    .getElementById(
      'overview-audit'
    )
    .addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/audit';
      }
    );

  await load();
};
