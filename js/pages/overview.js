/* ============================================================
   RD4X DASHBOARD V10 — Overview
   Visão geral com dados reais
   ============================================================ */
'use strict';

window.renderOverview = async function renderOverview(
  content
) {
  const escape = value =>
    typeof Utils !== 'undefined' &&
    typeof Utils.escapeHtml === 'function'
      ? Utils.escapeHtml(String(value ?? ''))
      : String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

  const formatDate = value => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getArray = response => {
    if (!response) return [];

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  };

  const normalizeTicket = item => ({
    channelId:
      item.channelId ||
      item.id ||
      '',

    channelName:
      item.channelName ||
      item.name ||
      item.ticket ||
      item.channelId ||
      'Ticket',

    username:
      item.username ||
      item.nick ||
      item.user ||
      'Usuário',

    userId:
      item.userId ||
      item.discordId ||
      '',

    status:
      item.status ||
      'open',

    prioridade:
      item.prioridade ||
      item.priority ||
      'normal',

    pagamento:
      item.pagamento ||
      'não informado',

    assumidoPor:
      item.assumidoPor ||
      null,

    ultimoContato:
      item.ultimoContato ||
      null
  });

  const normalizeAdmin = item => ({
    name:
      item.name ||
      item.username ||
      item.tag ||
      'Administrador',

    tag:
      item.tag ||
      item.username ||
      item.name ||
      '',

    avatar:
      item.avatar ||
      '',

    status:
      item.status ||
      'offline',

    role:
      item.role ||
      'Administrador'
  });

  const normalizeRelease = item => ({
    nick:
      item.nick ||
      item.username ||
      item.user ||
      'Desconhecido',

    expiraEm:
      item.expiraEm ??
      item.expiresAt ??
      null,

    valor:
      Number(
        item.valor ??
        item.valorPago ??
        0
      ) || 0,

    dataVenda:
      item.dataVenda ||
      item.createdAt ||
      item.at ||
      null
  });

  const renderLoading = () => {
    content.innerHTML = `
      <style>
        .overview-loading {
          display:flex;
          align-items:center;
          justify-content:center;
          min-height:260px;
          color:var(--muted);
        }
      </style>

      <div class="overview-loading">
        Carregando dados reais do RD4X...
      </div>
    `;
  };

  renderLoading();

  try {
    const [
      overviewResponse,
      ticketsResponse,
      adminsResponse,
      releasesResponse
    ] = await Promise.all([
      Api.getOverview(),
      Api.getTickets(),
      Api.getAdmins(),
      Api.getReleases()
    ]);

    const overview =
      overviewResponse?.data ||
      overviewResponse ||
      {};

    const tickets =
      getArray(ticketsResponse)
        .map(normalizeTicket);

    const admins =
      getArray(adminsResponse)
        .map(normalizeAdmin);

    const releases =
      getArray(releasesResponse)
        .map(normalizeRelease);

    const ativos =
      Number(
        overview.ativos ??
        overview.activeUsers ??
        0
      ) || 0;

    const ticketsAbertos =
      Number(
        overview.ticketsAbertos ??
        overview.openTickets ??
        tickets.filter(
          ticket =>
            ticket.status !== 'closed'
        ).length
      ) || 0;

    const execucoes =
      Number(
        overview.execucoes ??
        overview.executions ??
        0
      ) || 0;

    const vendas =
      Number(
        overview.vendas ??
        releases.length
      ) || 0;

    const faturamento =
      Number(
        overview.faturamento ??
        0
      ) || 0;

    const incidentes =
      Number(
        overview.incidentesAbertos ??
        overview.openIncidents ??
        0
      ) || 0;

    const recentTickets =
      tickets
        .slice()
        .sort(
          (a, b) =>
            Number(b.ultimoContato || 0) -
            Number(a.ultimoContato || 0)
        )
        .slice(0, 6);

    const recentReleases =
      releases
        .slice()
        .sort(
          (a, b) =>
            new Date(
              b.dataVenda || 0
            ).getTime() -
            new Date(
              a.dataVenda || 0
            ).getTime()
        )
        .slice(0, 5);

    content.innerHTML = `
      <style>
        .overview-page {
          display:flex;
          flex-direction:column;
          gap:20px;
        }

        .overview-head {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          flex-wrap:wrap;
        }

        .overview-title {
          margin:0;
          font-size:24px;
          font-weight:700;
          color:var(--text);
        }

        .overview-subtitle {
          margin-top:5px;
          font-size:13px;
          color:var(--muted);
        }

        .overview-actions {
          display:flex;
          gap:8px;
        }

        .overview-refresh {
          border:1px solid var(--border);
          background:var(--panel);
          color:var(--text);
          border-radius:9px;
          padding:9px 13px;
          cursor:pointer;
          font-weight:600;
        }

        .overview-refresh:hover {
          border-color:var(--accent);
        }

        .overview-grid {
          display:grid;
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
          gap:12px;
        }

        .overview-card {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
          padding:16px;
        }

        .overview-card-label {
          color:var(--muted);
          font-size:12px;
          margin-bottom:8px;
        }

        .overview-card-value {
          color:var(--text);
          font-size:22px;
          font-weight:700;
        }

        .overview-sections {
          display:grid;
          grid-template-columns:
            minmax(0, 1.4fr)
            minmax(320px, .8fr);
          gap:16px;
        }

        .overview-panel {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
          overflow:hidden;
        }

        .overview-panel-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:15px 16px;
          border-bottom:1px solid var(--border);
        }

        .overview-panel-title {
          margin:0;
          color:var(--text);
          font-size:14px;
          font-weight:700;
        }

        .overview-panel-link {
          border:0;
          background:transparent;
          color:var(--accent);
          cursor:pointer;
          font-size:12px;
        }

        .overview-list {
          display:flex;
          flex-direction:column;
        }

        .overview-item {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:13px 16px;
          border-bottom:1px solid var(--border);
          cursor:pointer;
        }

        .overview-item:last-child {
          border-bottom:0;
        }

        .overview-item:hover {
          background:rgba(255,255,255,.025);
        }

        .overview-item-main {
          min-width:0;
        }

        .overview-item-title {
          color:var(--text);
          font-size:13px;
          font-weight:650;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .overview-item-sub {
          margin-top:3px;
          color:var(--muted);
          font-size:11px;
        }

        .overview-badge {
          flex-shrink:0;
          border-radius:999px;
          padding:5px 9px;
          font-size:10px;
          font-weight:650;
          white-space:nowrap;
        }

        .overview-green {
          color:#4ade80;
          background:rgba(74,222,128,.10);
        }

        .overview-yellow {
          color:#fbbf24;
          background:rgba(251,191,36,.10);
        }

        .overview-red {
          color:#f87171;
          background:rgba(248,113,113,.10);
        }

        .overview-purple {
          color:#a78bfa;
          background:rgba(167,139,250,.10);
        }

        .overview-admin {
          display:flex;
          align-items:center;
          gap:11px;
          padding:13px 16px;
          border-bottom:1px solid var(--border);
        }

        .overview-admin:last-child {
          border-bottom:0;
        }

        .overview-avatar {
          width:36px;
          height:36px;
          border-radius:50%;
          object-fit:cover;
          background:var(--border);
          flex-shrink:0;
        }

        .overview-avatar-fallback {
          width:36px;
          height:36px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:rgba(255,255,255,.06);
          color:var(--muted);
          flex-shrink:0;
        }

        .overview-admin-main {
          min-width:0;
          flex:1;
        }

        .overview-admin-name {
          color:var(--text);
          font-size:13px;
          font-weight:650;
        }

        .overview-admin-tag {
          color:var(--muted);
          font-size:11px;
          margin-top:2px;
        }

        .overview-empty {
          padding:25px 16px;
          text-align:center;
          color:var(--muted);
          font-size:12px;
        }

        @media(max-width:1200px) {
          .overview-grid {
            grid-template-columns:
              repeat(3, minmax(0,1fr));
          }
        }

        @media(max-width:900px) {
          .overview-sections {
            grid-template-columns:1fr;
          }
        }

        @media(max-width:560px) {
          .overview-grid {
            grid-template-columns:
              repeat(2, minmax(0,1fr));
          }
        }
      </style>

      <section class="overview-page">

        <header class="overview-head">

          <div>
            <h1 class="overview-title">
              Visão Geral
            </h1>

            <div class="overview-subtitle">
              Dados atuais do RD4X Dashboard.
            </div>
          </div>

          <div class="overview-actions">

            <button
              class="overview-refresh"
              id="overview-refresh"
            >
              Atualizar
            </button>

          </div>

        </header>

        <div class="overview-grid">

          <div class="overview-card">
            <div class="overview-card-label">
              Usuários ativos
            </div>

            <div class="overview-card-value">
              ${ativos}
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-label">
              Tickets abertos
            </div>

            <div class="overview-card-value">
              ${ticketsAbertos}
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-label">
              Execuções
            </div>

            <div class="overview-card-value">
              ${execucoes}
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-label">
              Vendas
            </div>

            <div class="overview-card-value">
              ${vendas}
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-label">
              Faturamento
            </div>

            <div class="overview-card-value">
              R$ ${faturamento
                .toFixed(2)
                .replace('.', ',')}
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-label">
              Incidentes
            </div>

            <div class="overview-card-value">
              ${incidentes}
            </div>
          </div>

        </div>

        <div class="overview-sections">

          <section class="overview-panel">

            <div class="overview-panel-head">

              <h2 class="overview-panel-title">
                Tickets recentes
              </h2>

              <button
                class="overview-panel-link"
                id="overview-tickets-link"
              >
                Ver todos
              </button>

            </div>

            <div class="overview-list">

              ${
                recentTickets.length === 0
                  ? `
                    <div class="overview-empty">
                      Nenhum ticket encontrado.
                    </div>
                  `
                  : recentTickets.map(ticket => {

                      const priority =
                        String(
                          ticket.prioridade ||
                          'normal'
                        ).toLowerCase();

                      const badgeClass =
                        priority === 'urgente'
                          ? 'overview-red'
                          : priority === 'alta'
                            ? 'overview-yellow'
                            : 'overview-green';

                      return `
                        <div
                          class="overview-item"
                          data-ticket-id="${escape(
                            ticket.channelId
                          )}"
                        >

                          <div class="overview-item-main">

                            <div class="overview-item-title">
                              ${escape(
                                ticket.channelName
                              )}
                            </div>

                            <div class="overview-item-sub">
                              ${escape(
                                ticket.username
                              )}
                              ${
                                ticket.ultimoContato
                                  ? ` • ${formatDate(
                                      ticket.ultimoContato
                                    )}`
                                  : ''
                              }
                            </div>

                          </div>

                          <span
                            class="overview-badge ${badgeClass}"
                          >
                            ${escape(priority)}
                          </span>

                        </div>
                      `;
                    }).join('')
              }

            </div>

          </section>

          <section class="overview-panel">

            <div class="overview-panel-head">

              <h2 class="overview-panel-title">
                Administradores ativos
              </h2>

            </div>

            <div class="overview-list">

              ${
                admins.length === 0
                  ? `
                    <div class="overview-empty">
                      Nenhum administrador encontrado.
                    </div>
                  `
                  : admins.map(admin => `
                    <div class="overview-admin">

                      ${
                        admin.avatar
                          ? `
                            <img
                              class="overview-avatar"
                              src="${escape(
                                admin.avatar
                              )}"
                              alt=""
                            />
                          `
                          : `
                            <div class="overview-avatar-fallback">
                              ADM
                            </div>
                          `
                      }

                      <div class="overview-admin-main">

                        <div class="overview-admin-name">
                          ${escape(admin.name)}
                        </div>

                        <div class="overview-admin-tag">
                          ${escape(
                            admin.tag ||
                            admin.role
                          )}
                        </div>

                      </div>

                      <span
                        class="overview-badge ${
                          admin.status === 'online'
                            ? 'overview-green'
                            : 'overview-red'
                        }"
                      >
                        ${
                          admin.status === 'online'
                            ? 'Online'
                            : 'Offline'
                        }
                      </span>

                    </div>
                  `).join('')
              }

            </div>

          </section>

        </div>

        <section class="overview-panel">

          <div class="overview-panel-head">

            <h2 class="overview-panel-title">
              Releases recentes
            </h2>

            <button
              class="overview-panel-link"
              id="overview-releases-link"
            >
              Ver todos
            </button>

          </div>

          <div class="overview-list">

            ${
              recentReleases.length === 0
                ? `
                  <div class="overview-empty">
                    Nenhuma release encontrada.
                  </div>
                `
                : recentReleases.map(release => {

                    let statusText =
                      'Ativo';

                    let statusClass =
                      'overview-green';

                    if (
                      release.expiraEm === 'perm'
                    ) {
                      statusText =
                        'Permanente';

                      statusClass =
                        'overview-purple';

                    } else if (
                      Number.isFinite(
                        Number(
                          release.expiraEm
                        )
                      )
                    ) {
                      if (
                        Number(
                          release.expiraEm
                        ) <= Date.now()
                      ) {
                        statusText =
                          'Expirado';

                        statusClass =
                          'overview-red';
                      }
                    }

                    return `
                      <div
                        class="overview-item"
                        data-release-nick="${escape(
                          release.nick
                        )}"
                      >

                        <div class="overview-item-main">

                          <div class="overview-item-title">
                            ${escape(
                              release.nick
                            )}
                          </div>

                          <div class="overview-item-sub">
                            ${
                              release.dataVenda
                                ? formatDate(
                                    release.dataVenda
                                  )
                                : 'Data não informada'
                            }
                            ${
                              release.valor > 0
                                ? ` • R$ ${release.valor
                                    .toFixed(2)
                                    .replace('.', ',')}`
                                : ''
                            }
                          </div>

                        </div>

                        <span
                          class="overview-badge ${statusClass}"
                        >
                          ${statusText}
                        </span>

                      </div>
                    `;
                  }).join('')
            }

          </div>

        </section>

      </section>
    `;

    const refresh =
      document.getElementById(
        'overview-refresh'
      );

    if (refresh) {
      refresh.addEventListener(
        'click',
        () => window.renderOverview(content)
      );
    }

    const ticketsLink =
      document.getElementById(
        'overview-tickets-link'
      );

    if (ticketsLink) {
      ticketsLink.addEventListener(
        'click',
        () => {
          window.location.hash =
            '#/tickets';
        }
      );
    }

    const releasesLink =
      document.getElementById(
        'overview-releases-link'
      );

    if (releasesLink) {
      releasesLink.addEventListener(
        'click',
        () => {
          window.location.hash =
            '#/releases';
        }
      );
    }

    document
      .querySelectorAll(
        '[data-ticket-id]'
      )
      .forEach(item => {
        item.addEventListener(
          'click',
          () => {
            const id =
              item.dataset.ticketId;

            if (!id) return;

            window.location.hash =
              `#/tickets?q=${encodeURIComponent(id)}`;
          }
        );
      });

  } catch (error) {
    console.error(
      '[OVERVIEW]',
      error
    );

    content.innerHTML = `
      <style>
        .overview-error {
          padding:25px;
          border-radius:12px;
          border:1px solid rgba(248,113,113,.25);
          background:rgba(248,113,113,.07);
          color:#fca5a5;
        }

        .overview-error strong {
          display:block;
          color:var(--text);
          margin-bottom:6px;
        }
      </style>

      <div class="overview-error">

        <strong>
          Erro ao carregar a Visão Geral.
        </strong>

        ${escape(
          error?.message ||
          'Erro desconhecido.'
        )}

      </div>
    `;

    if (
      typeof Notifications !== 'undefined' &&
      typeof Notifications.error === 'function'
    ) {
      Notifications.error(
        'Erro ao carregar a Visão Geral.'
      );
    }
  }
};
